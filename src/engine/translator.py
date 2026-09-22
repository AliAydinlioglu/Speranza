import asyncio
import argostranslate.translate
from src.engine import package_manager


def _sync_translate_pair(text: str, from_code: str, to_code: str) -> str:
    installed_languages = argostranslate.translate.get_installed_languages()
    from_lang = next((lang for lang in installed_languages if lang.code == from_code), None)
    to_lang = next((lang for lang in installed_languages if lang.code == to_code), None)
    if not from_lang or not to_lang:
        raise ValueError(f"Language pair not available: {from_code} -> {to_code}")
    translation = from_lang.get_translation(to_lang)
    if translation is None:
        raise ValueError(f"Translation object not found: {from_code} -> {to_code}")
    return translation.translate(text)


async def translate_pair(text: str, from_code: str, to_code: str) -> str:
    return await asyncio.to_thread(_sync_translate_pair, text, from_code, to_code)


async def translate_multi(text: str, source_lang: str, target_langs: list[str]) -> dict[str, str]:
    if not text or not text.strip():
        return {target: text for target in target_langs}

    results: dict[str, str] = {}
    pivot_targets: list[str] = []

    for target in target_langs:
        if target == source_lang:
            results[target] = text
        elif source_lang == "en":
            await package_manager.ensure_pair_installed("en", target)
            results[target] = await translate_pair(text, "en", target)
        elif target == "en":
            await package_manager.ensure_pair_installed(source_lang, "en")
            results[target] = await translate_pair(text, source_lang, "en")
        else:
            is_direct = await package_manager.is_pair_installed_async(source_lang, target)
            if is_direct:
                results[target] = await translate_pair(text, source_lang, target)
            else:
                pivot_targets.append(target)

    if pivot_targets:
        en_text = results.get("en")
        if en_text is None:
            await package_manager.ensure_pair_installed(source_lang, "en")
            en_text = await translate_pair(text, source_lang, "en")
            if "en" in target_langs:
                results["en"] = en_text
        for target in pivot_targets:
            await package_manager.ensure_pair_installed("en", target)
            results[target] = await translate_pair(en_text, "en", target)

    return {target: results[target] for target in target_langs if target in results}
