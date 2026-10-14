import asyncio
import sqlite3
import unittest
from unittest.mock import patch

try:
    import fastapi
    from backend.app.api.routes import bundles, gdpr, health, languages, translate
    from backend.app.core.models import (
        BundleCreateRequest,
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

    def test_gdpr_endpoints(self):
        with patch("backend.app.services.gdpr_service.repository.get_db") as mock_db:
            mock_db.return_value.__enter__.return_value = self.conn

            policy = asyncio.run(gdpr.get_gdpr_policy())
            self.assertIn("GDPR", policy.compliance)
            self.assertEqual(len(policy.rights), 5)

            repository.create_bundle(
                name="Survival Pack",
                language_codes=["en", "es"],
                bundle_id="b-surv",
                conn=self.conn,
            )
            repository.add_entry_with_translations(
                bundle_id="b-surv",
                translations={"en": "Water", "es": "Agua"},
                entry_id="e-water",
                conn=self.conn,
            )

            export_data = asyncio.run(gdpr.export_gdpr_data())
            self.assertEqual(export_data.total_bundles, 1)
            self.assertEqual(export_data.total_entries, 1)
            self.assertEqual(export_data.bundles[0].name, "Survival Pack")

            purge_res = asyncio.run(gdpr.erase_gdpr_data())
            self.assertEqual(purge_res.status, "purged")

            export_after = asyncio.run(gdpr.export_gdpr_data())
            self.assertEqual(export_after.total_bundles, 0)

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
