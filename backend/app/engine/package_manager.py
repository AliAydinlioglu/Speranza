import asyncio
import os
from pathlib import Path
import argostranslate.package
import argostranslate.translate

_available_packages_cache: list | None = None
_install_lock = asyncio.Lock()


def is_pair_installed(from_code: str, to_code: str) -> bool:
    installed_languages = argostranslate.translate.get_installed_languages()
    from_lang = next((lang for lang in installed_languages if lang.code == from_code), None)
    if not from_lang:
        return False
    to_lang = next((lang for lang in installed_languages if lang.code == to_code), None)
    if not to_lang:
        return False
    return from_lang.get_translation(to_lang) is not None


async def is_pair_installed_async(from_code: str, to_code: str) -> bool:
    return await asyncio.to_thread(is_pair_installed, from_code, to_code)


def _sync_update_package_index() -> list:
    global _available_packages_cache
    try:
        argostranslate.package.update_package_index()
    except Exception:
        pass
    packages: list = []
    try:
        packages = argostranslate.package.get_available_packages()
    except Exception:
        packages = []
    _available_packages_cache = packages
    return packages


def _sync_get_available_packages(force_update: bool = False) -> list:
    global _available_packages_cache
    if _available_packages_cache is None or force_update:
        return _sync_update_package_index()
    return _available_packages_cache


def _sync_get_available_languages() -> dict:
    installed = argostranslate.translate.get_installed_languages()
    installed_pairs = set()
    for lang in installed:
        for trans in getattr(lang, "translations_from", []):
            if hasattr(trans, "to_lang") and hasattr(trans.to_lang, "code"):
                installed_pairs.add((lang.code, trans.to_lang.code))

    available_packages = _sync_get_available_packages()

    installed_meta = [
        {
            "code": lang.code,
            "name": lang.name,
            "targets": [
                trans.to_lang.code
                for trans in getattr(lang, "translations_from", [])
                if hasattr(trans, "to_lang") and hasattr(trans.to_lang, "code")
            ],
        }
        for lang in installed
    ]

    available_meta = [
        {
            "from_code": pkg.from_code,
            "to_code": pkg.to_code,
            "from_name": getattr(pkg, "from_name", pkg.from_code),
            "to_name": getattr(pkg, "to_name", pkg.to_code),
            "package_version": getattr(pkg, "package_version", "1.0.0"),
            "installed": (pkg.from_code, pkg.to_code) in installed_pairs,
        }
        for pkg in available_packages
    ]

    return {
        "installed_languages": installed_meta,
        "available_packages": available_meta,
    }


async def get_available_languages() -> dict:
    return await asyncio.to_thread(_sync_get_available_languages)


def _sync_ensure_pair_installed(from_code: str, to_code: str) -> bool:
    if is_pair_installed(from_code, to_code):
        return True

    packages = _sync_get_available_packages()
    pkg = next(
        (p for p in packages if p.from_code == from_code and p.to_code == to_code),
        None,
    )
    if pkg is None:
        packages = _sync_update_package_index()
        pkg = next(
            (p for p in packages if p.from_code == from_code and p.to_code == to_code),
            None,
        )

    if pkg is None:
        raise ValueError(f"Translation package not found for {from_code} -> {to_code}")

    download_path = pkg.download()
    try:
        argostranslate.package.install_from_path(download_path)
        if hasattr(argostranslate.translate.get_installed_languages, "cache_clear"):
            argostranslate.translate.get_installed_languages.cache_clear()
    finally:
        if isinstance(download_path, Path):
            download_path.unlink(missing_ok=True)
        elif os.path.exists(str(download_path)):
            os.remove(str(download_path))
    return True


async def ensure_pair_installed(from_code: str, to_code: str) -> bool:
    async with _install_lock:
        return await asyncio.to_thread(_sync_ensure_pair_installed, from_code, to_code)
