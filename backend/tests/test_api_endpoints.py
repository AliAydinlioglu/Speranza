import asyncio
import sqlite3
import unittest
from unittest.mock import patch

try:
    import fastapi
    from backend.app.api.routes import bundles, health, languages, translate
    from backend.app.core.models import (
        BundleCreateRequest,
        BundleLanguagesUpdateRequest,
        EntryCreateRequest,
        InstallLanguageRequest,
        TranslateRequest,
    )
    HAS_FASTAPI = True
except ImportError:
    HAS_FASTAPI = False

from backend.app.storage import repository


class TestApiEndpoints(unittest.TestCase):
    def setUp(self):
        if not HAS_FASTAPI:
            self.skipTest("FastAPI not installed on host environment")
        self.conn = sqlite3.connect(":memory:")
        self.conn.row_factory = sqlite3.Row
        self.conn.execute("PRAGMA foreign_keys = ON;")
        repository.init_db(conn=self.conn)

    def tearDown(self):
        if HAS_FASTAPI:
            self.conn.close()

    def test_health_endpoint(self):
        result = asyncio.run(health.health())
        self.assertEqual(result, {"status": "healthy"})

    def test_bundle_crud_routes(self):
        with patch("backend.app.api.routes.bundles.repository.get_db") as mock_db:
            mock_db.return_value.__enter__.return_value = self.conn

            created = asyncio.run(
                bundles.create_bundle(
                    BundleCreateRequest(name="Radio Signals", languages=["en", "fr"])
                )
            )
            self.assertEqual(created.name, "Radio Signals")
            self.assertEqual(created.languages, ["en", "fr"])

            bundle_list = asyncio.run(bundles.list_bundles())
            self.assertEqual(len(bundle_list), 1)

            matrix = asyncio.run(bundles.get_bundle(created.id))
            self.assertEqual(matrix.name, "Radio Signals")
            self.assertEqual(len(matrix.entries), 0)

            with patch("backend.app.api.routes.bundles.translator.translate_multi") as mock_trans:
                mock_trans.return_value = {"en": "Signal detected", "fr": "Signal détecté"}
                entry = asyncio.run(
                    bundles.create_bundle_entry(
                        created.id,
                        EntryCreateRequest(source_lang="en", text="Signal detected"),
                    )
                )
                self.assertEqual(entry.translations["fr"], "Signal détecté")

            patch_res = asyncio.run(
                bundles.update_bundle_languages(
                    created.id,
                    BundleLanguagesUpdateRequest(languages=["fr", "en"]),
                )
            )
            self.assertEqual(patch_res["status"], "updated")
            self.assertEqual(patch_res["languages"], ["fr", "en"])

            reordered = asyncio.run(bundles.get_bundle(created.id))
            self.assertEqual(reordered.languages, ["fr", "en"])

            del_res = asyncio.run(bundles.delete_bundle_entry(created.id, entry.id))
            self.assertEqual(del_res["status"], "deleted")

            bundle_del = asyncio.run(bundles.delete_bundle(created.id))
            self.assertEqual(bundle_del["status"], "deleted")

    def test_translate_route(self):
        with patch("backend.app.api.routes.translate.translator.translate_multi") as mock_trans:
            mock_trans.return_value = {"es": "Hola", "de": "Hallo"}
            res = asyncio.run(
                translate.translate(
                    TranslateRequest(text="Hello", source_lang="en", target_langs=["es", "de"])
                )
            )
            self.assertEqual(res.translations["es"], "Hola")
            self.assertEqual(res.translations["de"], "Hallo")


if __name__ == "__main__":
    unittest.main()
