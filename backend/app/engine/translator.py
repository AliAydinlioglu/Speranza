import asyncio
import re
try:
    import argostranslate.translate
except ImportError:
    argostranslate = None

from backend.app.engine import package_manager


def sanitize_translation(text: str, source_text: str = "") -> str:
    if not text:
        return ""
    text = text.strip()

    terminals = (".", "。", "!", "¡", "?", "¿", ",", ";", ":", "…")

    for n in range(6, 0, -1):
        pattern = r"\b(" + r"\s+".join([r"\S+"] * n) + r")(?:\s+\1\b)+"
        text = re.sub(pattern, r"\1", text, flags=re.IGNORECASE)

    tokens = text.split()
    if not tokens:
        return ""

    deduped = [tokens[0]]
    for t in tokens[1:]:
        clean_curr = re.sub(r"[^\w\s]", "", t.lower())
        clean_prev = re.sub(r"[^\w\s]", "", deduped[-1].lower())
        if clean_curr != clean_prev:
            if len(clean_curr) > 3 and len(clean_prev) > 3:
                stem1 = clean_prev[:4]
                stem2 = clean_curr[:4]
                if stem1 == stem2 and (clean_curr.startswith(clean_prev) or clean_prev.startswith(clean_curr)):
                    continue
            deduped.append(t)

    src_words = source_text.strip().split() if source_text else []
    if len(src_words) == 1 and len(deduped) > 1:
        unique_clean = {re.sub(r"[^\w\s]", "", w.lower()) for w in deduped}
        if len(unique_clean) == 1:
            deduped = [deduped[0]]
        elif len(deduped) > 2:
            deduped = deduped[:2]

    result = " ".join(deduped).strip()

    if source_text and result:
        src = source_text.strip()
        src_has_term = any(src.endswith(p) for p in terminals)
        if not src_has_term:
            while result and any(result.endswith(p) for p in terminals):
                result = result[:-1].strip()
            while result and any(result.startswith(p) for p in terminals):
                result = result[1:].strip()
        else:
            for p in (".", "。"):
                if not any(src.endswith(s) for s in (".", "。")) and result.endswith(p):
                    result = result[:-1].strip()
            if any(src.endswith(s) for s in ("?", "¿")) and not result.endswith("?"):
                result = result.rstrip(".。,;") + "?"
            elif any(src.endswith(s) for s in ("!", "¡")) and not result.endswith("!"):
                result = result.rstrip(".。,;") + "!"

    return result


def _sync_translate_pair(text: str, from_code: str, to_code: str) -> str:
    installed_languages = argostranslate.translate.get_installed_languages()
    from_lang = next((lang for lang in installed_languages if lang.code == from_code), None)
    to_lang = next((lang for lang in installed_languages if lang.code == to_code), None)
    if not from_lang or not to_lang:
        raise ValueError(f"Language pair not available: {from_code} -> {to_code}")
    translation = from_lang.get_translation(to_lang)
    if translation is None:
        raise ValueError(f"Translation object not found: {from_code} -> {to_code}")
    raw = translation.translate(text)
    return sanitize_translation(raw, text)


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


def _sync_get_translation_obj(from_code: str, to_code: str):
    installed_languages = argostranslate.translate.get_installed_languages()
    from_lang = next((lang for lang in installed_languages if lang.code == from_code), None)
    to_lang = next((lang for lang in installed_languages if lang.code == to_code), None)
    if not from_lang or not to_lang:
        return None
    return from_lang.get_translation(to_lang)


def _sync_translate_batch(
    phrases: list[str],
    source_lang: str,
    target_langs: list[str],
    cached_translations: dict[str, dict[str, str]] | None = None,
    on_progress=None,
) -> list[dict[str, str]]:
    all_targets = [t for t in target_langs if t != source_lang]
    source_to_en_model = None
    if source_lang != "en":
        source_to_en_model = _sync_get_translation_obj(source_lang, "en")

    direct_models: dict[str, any] = {}
    en_to_target_models: dict[str, any] = {}

    for target in all_targets:
        if target == "en":
            continue
        direct = _sync_get_translation_obj(source_lang, target)
        if direct is not None:
            direct_models[target] = direct
        else:
            en_to_target_models[target] = _sync_get_translation_obj("en", target)

    results: list[dict[str, str]] = []
    total = len(phrases)

    for idx, phrase in enumerate(phrases):
        cleaned = phrase.strip()
        if not cleaned:
            continue

        phrase_cache = (cached_translations or {}).get(cleaned.lower(), {})
        trans_map: dict[str, str] = {source_lang: cleaned}

        en_intermediate = phrase_cache.get("en")
        if en_intermediate is None and source_lang == "en":
            en_intermediate = cleaned

        for target in target_langs:
            if target == source_lang:
                continue

            if target in phrase_cache:
                trans_map[target] = phrase_cache[target]
                continue

            if target == "en":
                if en_intermediate is not None:
                    trans_map["en"] = en_intermediate
                elif source_to_en_model:
                    try:
                        raw = source_to_en_model.translate(cleaned)
                        en_intermediate = sanitize_translation(raw, cleaned)
                        trans_map["en"] = en_intermediate
                    except Exception:
                        trans_map["en"] = cleaned
                else:
                    trans_map["en"] = cleaned
                continue

            if target in direct_models and direct_models[target]:
                try:
                    raw = direct_models[target].translate(cleaned)
                    trans_map[target] = sanitize_translation(raw, cleaned)
                except Exception:
                    trans_map[target] = cleaned
                continue

            if en_intermediate is None and source_to_en_model:
                try:
                    raw = source_to_en_model.translate(cleaned)
                    en_intermediate = sanitize_translation(raw, cleaned)
                    if "en" in target_langs:
                        trans_map["en"] = en_intermediate
                except Exception:
                    en_intermediate = cleaned

            if target in en_to_target_models and en_to_target_models[target]:
                try:
                    src_text = en_intermediate if en_intermediate else cleaned
                    raw = en_to_target_models[target].translate(src_text)
                    trans_map[target] = sanitize_translation(raw, cleaned)
                except Exception:
                    trans_map[target] = cleaned
            else:
                trans_map[target] = cleaned

        results.append(trans_map)
        if on_progress:
            on_progress(cleaned, idx + 1, total)

    return results


async def translate_batch(
    phrases: list[str],
    source_lang: str,
    target_langs: list[str],
    cached_translations: dict[str, dict[str, str]] | None = None,
    on_progress=None,
) -> list[dict[str, str]]:
    if not phrases:
        return []

    if source_lang != "en":
        try:
            await package_manager.ensure_pair_installed(source_lang, "en")
        except Exception:
            pass

    for target in target_langs:
        if target == source_lang:
            continue
        if source_lang == "en":
            try:
                await package_manager.ensure_pair_installed("en", target)
            except Exception:
                pass
        else:
            is_direct = await package_manager.is_pair_installed_async(source_lang, target)
            if not is_direct:
                try:
                    await package_manager.ensure_pair_installed("en", target)
                except Exception:
                    pass

    return await asyncio.to_thread(
        _sync_translate_batch,
        phrases,
        source_lang,
        target_langs,
        cached_translations,
        on_progress,
    )
