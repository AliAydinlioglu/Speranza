from fastapi import APIRouter, BackgroundTasks, File, Form, HTTPException, Query, UploadFile, status
from backend.app.core.models import (
    BulkGenerateRequest,
    BulkTaskStatus,
    CorpusAnalyzeTextRequest,
    CorpusCandidateItem,
    CorpusPreviewResponse,
)
from backend.app.engine import translator
from backend.app.services import corpus_service, task_service
from backend.app.storage import repository

router = APIRouter(tags=["Corpus & Bulk Generation"])


async def _run_bulk_generation_worker(
    task_id: str,
    bundle_id: str,
    phrases: list[str],
    source_lang: str,
    target_langs: list[str],
):
    try:
        cached = repository.find_cached_translations(phrases, source_lang, target_langs)
        chunk_size = 20
        total = len(phrases)
        processed = 0

        for i in range(0, total, chunk_size):
            chunk = phrases[i : i + chunk_size]

            def on_progress(phrase_text, idx_in_chunk, chunk_total):
                task_service.update_progress(
                    task_id=task_id,
                    processed_items=processed + idx_in_chunk - 1,
                    current_phrase=phrase_text,
                )

            translated_chunk = await translator.translate_batch(
                phrases=chunk,
                source_lang=source_lang,
                target_langs=target_langs,
                cached_translations=cached,
                on_progress=on_progress,
            )

            repository.add_batch_entries_with_translations(bundle_id, translated_chunk)
            processed += len(chunk)
            task_service.update_progress(task_id=task_id, processed_items=processed)

        task_service.complete_task(task_id=task_id, bundle_id=bundle_id)
    except Exception as exc:
        task_service.fail_task(task_id=task_id, error=str(exc))


@router.get("/corpus/presets/wordfreq", response_model=CorpusPreviewResponse)
async def get_wordfreq_preset(
    lang: str = Query("en"),
    top_n: int = Query(100, ge=1, le=500),
    rank_start: int = Query(0, ge=0),
):
    raw_candidates = corpus_service.get_wordfreq_candidates(
        lang=lang,
        top_n=top_n,
        rank_start=rank_start,
    )
    items = [CorpusCandidateItem(text=c["text"], frequency=c["frequency"]) for c in raw_candidates]
    return CorpusPreviewResponse(
        source="wordfreq",
        total_candidates=len(items),
        candidates=items,
    )


@router.get("/corpus/presets/sentence-categories", response_model=list[str])
async def get_sentence_categories():
    return corpus_service.get_sentence_categories()


@router.get("/corpus/presets/sentences", response_model=CorpusPreviewResponse)
async def get_sentence_preset(
    category: str | None = Query(None),
    count: int = Query(50, ge=1, le=250),
):
    raw_candidates = corpus_service.get_seed_sentences(
        category=category,
        count=count,
    )
    items = [CorpusCandidateItem(text=c["text"], frequency=c["frequency"]) for c in raw_candidates]
    return CorpusPreviewResponse(
        source="sentences",
        total_candidates=len(items),
        candidates=items,
    )


@router.post("/corpus/analyze/text", response_model=CorpusPreviewResponse)
async def analyze_text(payload: CorpusAnalyzeTextRequest):
    raw_candidates = corpus_service.extract_from_text(
        text=payload.text,
        mode=payload.mode,
        top_n=payload.top_n,
        filter_stopwords=payload.filter_stopwords,
        min_length=payload.min_length,
    )
    items = [CorpusCandidateItem(text=c["text"], frequency=c["frequency"]) for c in raw_candidates]
    return CorpusPreviewResponse(
        source="text",
        total_candidates=len(items),
        candidates=items,
    )


@router.post("/corpus/analyze/file", response_model=CorpusPreviewResponse)
async def analyze_file(
    file: UploadFile = File(...),
    mode: str = Form("words"),
    top_n: int | str = Form(50),
    filter_stopwords: bool = Form(True),
    min_length: int = Form(3),
):
    content_bytes = await file.read()
    filename_lower = (file.filename or "").lower()

    if filename_lower.endswith(".epub"):
        text = corpus_service.extract_text_from_epub(content_bytes)
    else:
        try:
            text = content_bytes.decode("utf-8")
        except UnicodeDecodeError:
            text = content_bytes.decode("latin-1", errors="ignore")

    raw_candidates = corpus_service.extract_from_text(
        text=text,
        mode=mode,
        top_n=top_n,
        filter_stopwords=filter_stopwords,
        min_length=min_length,
    )
    items = [CorpusCandidateItem(text=c["text"], frequency=c["frequency"]) for c in raw_candidates]
    return CorpusPreviewResponse(
        source="file",
        total_candidates=len(items),
        candidates=items,
    )


@router.post("/bundles/bulk-generate", status_code=status.HTTP_202_ACCEPTED)
async def bulk_generate_bundle(
    payload: BulkGenerateRequest,
    background_tasks: BackgroundTasks,
):
    if not payload.phrases:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No phrases provided for bulk generation",
        )

    target_bundle_id = payload.bundle_id
    bundle_name = payload.bundle_name or "Generated Pack"
    target_languages = list(payload.languages)

    if target_bundle_id:
        existing_bundle = repository.get_bundle(target_bundle_id)
        if not existing_bundle:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Bundle with id '{target_bundle_id}' not found",
            )
        bundle_name = existing_bundle["name"]
        target_languages = existing_bundle["languages"]
    else:
        if not payload.bundle_name or not payload.bundle_name.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Bundle name is required when creating a new bundle",
            )
        existing_name = repository.get_bundle_by_name(payload.bundle_name.strip())
        if existing_name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Bundle with name '{payload.bundle_name}' already exists",
            )
        if not target_languages:
            target_languages = ["en", "nl"]
        new_bundle = repository.create_bundle(
            name=payload.bundle_name.strip(),
            language_codes=target_languages,
            style_id=payload.style_id,
        )
        target_bundle_id = new_bundle["id"]
        bundle_name = new_bundle["name"]

    existing_phrases = repository.get_existing_phrases_in_bundle(
        target_bundle_id,
        payload.source_lang,
    )

    clean_unique_phrases: list[str] = []
    seen = set()

    for p in payload.phrases:
        cleaned = p.strip()
        if not cleaned:
            continue
        lower_p = cleaned.lower()
        if lower_p in seen:
            continue
        seen.add(lower_p)
        if lower_p in existing_phrases:
            continue
        clean_unique_phrases.append(cleaned)

    skipped_duplicates = len(payload.phrases) - len(clean_unique_phrases)

    task_id = task_service.create_task(
        bundle_id=target_bundle_id,
        bundle_name=bundle_name,
        total_items=len(clean_unique_phrases),
        skipped_duplicates=skipped_duplicates,
    )

    if not clean_unique_phrases:
        task_service.complete_task(task_id, bundle_id=target_bundle_id)
        return {
            "task_id": task_id,
            "bundle_id": target_bundle_id,
            "bundle_name": bundle_name,
            "status": "completed",
            "total_items": 0,
            "skipped_duplicates": skipped_duplicates,
        }

    background_tasks.add_task(
        _run_bulk_generation_worker,
        task_id=task_id,
        bundle_id=target_bundle_id,
        phrases=clean_unique_phrases,
        source_lang=payload.source_lang,
        target_langs=target_languages,
    )

    return {
        "task_id": task_id,
        "bundle_id": target_bundle_id,
        "bundle_name": bundle_name,
        "status": "processing",
        "total_items": len(clean_unique_phrases),
        "skipped_duplicates": skipped_duplicates,
    }


@router.get("/bundles/bulk-tasks/{task_id}", response_model=BulkTaskStatus)
async def get_bulk_task_status(task_id: str):
    task = task_service.get_task(task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with id '{task_id}' not found",
        )
    return BulkTaskStatus(**task)
