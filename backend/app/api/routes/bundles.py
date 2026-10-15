from fastapi import APIRouter, HTTPException, status
from backend.app.core.models import (
    BundleCreateRequest,
    BundleDetail,
    BundleLanguagesUpdateRequest,
    BundleSummary,
    EntryCreateRequest,
    EntryResponse,
)
from backend.app.engine import translator
from backend.app.storage import repository

router = APIRouter(prefix="/bundles", tags=["Bundles"])


@router.get("", response_model=list[BundleSummary])
async def list_bundles():
    return repository.list_bundles()


@router.post("", response_model=BundleSummary, status_code=status.HTTP_201_CREATED)
async def create_bundle(payload: BundleCreateRequest):
    existing = repository.get_bundle_by_name(payload.name)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Bundle with name '{payload.name}' already exists",
        )
    created = repository.create_bundle(
        name=payload.name,
        language_codes=payload.languages,
        style_id=payload.style_id,
    )
    return BundleSummary(
        id=created["id"],
        name=created["name"],
        languages=created["languages"],
        item_count=0,
        style_id=created.get("style_id"),
    )


@router.get("/{id}", response_model=BundleDetail)
async def get_bundle(id: str):
    bundle = repository.get_bundle_matrix(id)
    if not bundle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Bundle with id '{id}' not found",
        )
    return BundleDetail(**bundle)


@router.post("/{id}/entries", response_model=EntryResponse, status_code=status.HTTP_201_CREATED)
async def create_bundle_entry(id: str, payload: EntryCreateRequest):
    bundle = repository.get_bundle(id)
    if not bundle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Bundle with id '{id}' not found",
        )

    target_langs = bundle["languages"]
    if payload.source_lang not in target_langs:
        target_langs = target_langs + [payload.source_lang]

    translations = await translator.translate_multi(
        text=payload.text,
        source_lang=payload.source_lang,
        target_langs=target_langs,
    )

    entry = repository.add_entry_with_translations(
        bundle_id=id,
        translations=translations,
    )
    return EntryResponse(**entry)


@router.delete("/{id}/entries/{entry_id}")
async def delete_bundle_entry(id: str, entry_id: str):
    bundle = repository.get_bundle(id)
    if not bundle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Bundle with id '{id}' not found",
        )

    entry = repository.get_entry(entry_id)
    if not entry or entry["bundle_id"] != id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Entry with id '{entry_id}' not found in bundle '{id}'",
        )

    deleted = repository.delete_entry(entry_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Entry with id '{entry_id}' not found",
        )

    return {"status": "deleted", "id": entry_id}


@router.delete("/{id}")
async def delete_bundle(id: str):
    bundle = repository.get_bundle(id)
    if not bundle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Bundle with id '{id}' not found",
        )

    deleted = repository.delete_bundle(id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Bundle with id '{id}' could not be deleted",
        )

    return {"status": "deleted", "id": id}


@router.patch("/{id}/languages")
async def update_bundle_languages(id: str, payload: BundleLanguagesUpdateRequest):
    bundle = repository.get_bundle(id)
    if not bundle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Bundle with id '{id}' not found",
        )

    if not payload.languages or len(payload.languages) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Languages must contain at least 2 language codes",
        )

    if set(payload.languages) != set(bundle["languages"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reordered languages must match existing bundle languages",
        )

    updated = repository.set_bundle_languages(id, payload.languages)
    return {"status": "updated", "languages": updated}
