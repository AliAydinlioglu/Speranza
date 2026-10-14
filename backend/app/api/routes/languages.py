from fastapi import APIRouter
from backend.app.core.models import (
    InstallLanguageRequest,
    InstallLanguageResponse,
    LanguageMetadata,
)
from backend.app.engine import package_manager

router = APIRouter(prefix="/languages", tags=["Languages"])


@router.get("", response_model=list[LanguageMetadata])
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


@router.post("/install", response_model=InstallLanguageResponse)
async def install_language(payload: InstallLanguageRequest):
    await package_manager.ensure_pair_installed(payload.from_code, payload.to_code)
    return InstallLanguageResponse(
        status="installed",
        from_code=payload.from_code,
        to_code=payload.to_code,
    )
