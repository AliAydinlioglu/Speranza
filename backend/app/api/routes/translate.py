from fastapi import APIRouter
from backend.app.core.models import TranslateRequest, TranslateResponse
from backend.app.engine import translator

router = APIRouter(prefix="/translate", tags=["Translation"])


@router.post("", response_model=TranslateResponse)
async def translate(payload: TranslateRequest):
    translations = await translator.translate_multi(
        text=payload.text,
        source_lang=payload.source_lang,
        target_langs=payload.target_langs,
    )
    return TranslateResponse(translations=translations)
