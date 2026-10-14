import sqlite3
import unittest
from backend.app.services import gdpr_service
from backend.app.storage import repository


class TestGDPRService(unittest.TestCase):
    def setUp(self):
        self.conn = sqlite3.connect(":memory:")
        self.conn.row_factory = sqlite3.Row
        self.conn.execute("PRAGMA foreign_keys = ON;")
        repository.init_db(conn=self.conn)

    def tearDown(self):
        self.conn.close()

    def test_privacy_policy(self):
        policy = gdpr_service.get_privacy_policy()
        self.assertIn("GDPR", policy.compliance)
        self.assertIn("100% Local", policy.data_storage)
        self.assertEqual(len(policy.rights), 5)

    def test_export_and_purge_flow(self):
        repository.create_bundle(
            name="Tactical Vocabulary",
            language_codes=["en", "de"],
            bundle_id="b-export",
            conn=self.conn,
        )
        repository.add_entry_with_translations(
            bundle_id="b-export",
            translations={"en": "Affirmative", "de": "Positiv"},
            entry_id="e-export",
            conn=self.conn,
        )

        export_data = gdpr_service.export_all_user_data(conn=self.conn)
        self.assertEqual(export_data.application, "Speranza")
        self.assertEqual(export_data.total_bundles, 1)
        self.assertEqual(export_data.total_entries, 1)
        self.assertEqual(len(export_data.bundles), 1)
        self.assertEqual(export_data.bundles[0].name, "Tactical Vocabulary")
        self.assertEqual(
            export_data.bundles[0].entries[0].translations["de"],
            "Positiv",
        )

        purge_result = gdpr_service.purge_all_user_data(conn=self.conn)
        self.assertEqual(purge_result.status, "purged")

        export_after = gdpr_service.export_all_user_data(conn=self.conn)
        self.assertEqual(export_after.total_bundles, 0)
        self.assertEqual(export_after.total_entries, 0)


if __name__ == "__main__":
    unittest.main()
