from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exception_handlers import http_exception_handler
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from src.core.models import (
    BundleCreateRequest,
    BundleDetail,
    BundleSummary,
    EntryCreateRequest,
    EntryResponse,
    InstallLanguageRequest,
    InstallLanguageResponse,
    LanguageMetadata,
    TranslateRequest,
    TranslateResponse,
)
from src.engine import package_manager, translator
from src.storage import repository

BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "web" / "static"
TEMPLATES_DIR = BASE_DIR / "web" / "templates"

STATIC_DIR.mkdir(parents=True, exist_ok=True)
TEMPLATES_DIR.mkdir(parents=True, exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    repository.init_db()
    yield


app = FastAPI(title="Speranza", lifespan=lifespan)

app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")
templates = Jinja2Templates(directory=str(TEMPLATES_DIR))


@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError):
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail": str(exc)},
    )


@app.exception_handler(KeyError)
async def key_error_handler(request: Request, exc: KeyError):
    key_name = str(exc).strip("'\"")
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={"detail": f"Resource not found: {key_name}"},
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    if isinstance(exc, HTTPException):
        return await http_exception_handler(request, exc)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": str(exc)},
    )


@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse(request=request, name="index.html")


@app.get("/health")
async def health():
    return {"status": "healthy"}


@app.get("/api/languages", response_model=list[LanguageMetadata])
async def get_languages():
    raw_data = await package_manager.get_available_languages()
    installed_langs = raw_data.get("installed_languages", [])
    installed_codes = {l["code"] for l in installed_langs}

    languages_map: dict[str, LanguageMetadata] = {}
    for l in installed_langs:
        languages_map[l["code"]] = LanguageMetadata(
            code=l["code"],
            name=l["name"],
            is_installed=True,
        )

    for pkg in raw_data.get("available_packages", []):
        from_code = pkg["from_code"]
        if from_code not in languages_map:
            languages_map[from_code] = LanguageMetadata(
                code=from_code,
                name=pkg.get("from_name", from_code),
                is_installed=from_code in installed_codes,
            )
        to_code = pkg["to_code"]
        if to_code not in languages_map:
            languages_map[to_code] = LanguageMetadata(
                code=to_code,
                name=pkg.get("to_name", to_code),
                is_installed=to_code in installed_codes,
            )

    sorted_languages = sorted(
        languages_map.values(),
        key=lambda x: (not x.is_installed, x.name.lower()),
    )
    return sorted_languages


@app.post("/api/languages/install", response_model=InstallLanguageResponse)
async def install_language(payload: InstallLanguageRequest):
    await package_manager.ensure_pair_installed(payload.from_code, payload.to_code)
    return InstallLanguageResponse(
        status="installed",
        from_code=payload.from_code,
        to_code=payload.to_code,
    )


@app.post("/api/translate", response_model=TranslateResponse)
async def translate(payload: TranslateRequest):
    translations = await translator.translate_multi(
        text=payload.text,
        source_lang=payload.source_lang,
        target_langs=payload.target_langs,
    )
    return TranslateResponse(translations=translations)


@app.get("/api/bundles", response_model=list[BundleSummary])
async def list_bundles():
    return repository.list_bundles()


@app.post("/api/bundles", response_model=BundleSummary, status_code=status.HTTP_201_CREATED)
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
    )
    return BundleSummary(
        id=created["id"],
        name=created["name"],
        languages=created["languages"],
        item_count=0,
    )


@app.get("/api/bundles/{id}", response_model=BundleDetail)
async def get_bundle(id: str):
    bundle = repository.get_bundle_matrix(id)
    if not bundle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Bundle with id '{id}' not found",
        )
    return bundle


@app.post("/api/bundles/{id}/entries", response_model=EntryResponse, status_code=status.HTTP_201_CREATED)
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
    return entry


@app.delete("/api/bundles/{id}/entries/{entry_id}")
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


@app.delete("/api/bundles/{id}")
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

