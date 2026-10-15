import sqlite3
import unittest
from backend.app.storage import repository


class TestRepository(unittest.TestCase):
    def setUp(self):
        self.conn = sqlite3.connect(":memory:")
        self.conn.row_factory = sqlite3.Row
        self.conn.execute("PRAGMA foreign_keys = ON;")
        repository.init_db(conn=self.conn)

    def tearDown(self):
        self.conn.close()

    def test_init_db(self):
        tables = self.conn.execute(
            "SELECT name FROM sqlite_master WHERE type='table';"
        ).fetchall()
        table_names = {t["name"] for t in tables}
        self.assertIn("bundles", table_names)
        self.assertIn("bundle_languages", table_names)
        self.assertIn("entries", table_names)
        self.assertIn("translations", table_names)

    def test_create_and_get_bundle(self):
        created = repository.create_bundle(
            name="Core Vocabulary",
            language_codes=["en", "es", "de"],
            bundle_id="bundle-1",
            conn=self.conn,
        )
        self.assertEqual(created["name"], "Core Vocabulary")
        self.assertEqual(created["languages"], ["en", "es", "de"])

        fetched = repository.get_bundle("bundle-1", conn=self.conn)
        self.assertIsNotNone(fetched)
        self.assertEqual(fetched["name"], "Core Vocabulary")
        self.assertEqual(fetched["languages"], ["en", "es", "de"])

        by_name = repository.get_bundle_by_name("Core Vocabulary", conn=self.conn)
        self.assertIsNotNone(by_name)
        self.assertEqual(by_name["id"], "bundle-1")

    def test_list_and_delete_bundle(self):
        repository.create_bundle(
            name="Alpha",
            language_codes=["en", "nl"],
            bundle_id="b-1",
            conn=self.conn,
        )
        repository.create_bundle(
            name="Beta",
            language_codes=["en", "fr"],
            bundle_id="b-2",
            conn=self.conn,
        )
        bundles = repository.list_bundles(conn=self.conn)
        self.assertEqual(len(bundles), 2)

        deleted = repository.delete_bundle("b-1", conn=self.conn)
        self.assertTrue(deleted)
        remaining = repository.list_bundles(conn=self.conn)
        self.assertEqual(len(remaining), 1)
        self.assertEqual(remaining[0]["id"], "b-2")

    def test_entries_and_matrix(self):
        repository.create_bundle(
            name="Comms",
            language_codes=["en", "es"],
            bundle_id="b-comms",
            conn=self.conn,
        )
        entry = repository.add_entry_with_translations(
            bundle_id="b-comms",
            translations={"en": "Hold position", "es": "Mantener posición"},
            entry_id="e-1",
            conn=self.conn,
        )
        self.assertEqual(entry["id"], "e-1")
        self.assertEqual(entry["translations"]["en"], "Hold position")

        matrix = repository.get_bundle_matrix("b-comms", conn=self.conn)
        self.assertIsNotNone(matrix)
        self.assertEqual(len(matrix["entries"]), 1)
        self.assertEqual(matrix["entries"][0]["translations"]["es"], "Mantener posición")

        entry2 = repository.add_entry_with_translations(
            bundle_id="b-comms",
            translations={"en": "Advance", "es": "Avanzar"},
            entry_id="e-2",
            conn=self.conn,
        )
        matrix2 = repository.get_bundle_matrix("b-comms", conn=self.conn)
        self.assertEqual(len(matrix2["entries"]), 2)
        self.assertEqual(matrix2["entries"][0]["id"], "e-2")
        self.assertEqual(matrix2["entries"][1]["id"], "e-1")

        deleted = repository.delete_entry("e-1", conn=self.conn)
        self.assertTrue(deleted)
        deleted2 = repository.delete_entry("e-2", conn=self.conn)
        self.assertTrue(deleted2)
        matrix_after = repository.get_bundle_matrix("b-comms", conn=self.conn)
        self.assertEqual(len(matrix_after["entries"]), 0)

    def test_purge_all_data(self):
        repository.create_bundle(
            name="PurgePack",
            language_codes=["en", "it"],
            bundle_id="b-purge",
            conn=self.conn,
        )
        repository.add_entry_with_translations(
            bundle_id="b-purge",
            translations={"en": "Evacuate", "it": "Evacuare"},
            entry_id="e-purge",
            conn=self.conn,
        )

        stats = repository.purge_all_data(conn=self.conn)
        self.assertEqual(stats["deleted_bundles"], 1)
        self.assertEqual(stats["deleted_entries"], 1)
        self.assertEqual(stats["deleted_translations"], 2)

        bundles_after = repository.list_bundles(conn=self.conn)
        self.assertEqual(len(bundles_after), 0)

    def test_reorder_bundle_languages(self):
        repository.create_bundle(
            name="Signals",
            language_codes=["en", "nl", "de"],
            bundle_id="b-sig",
            conn=self.conn,
        )
        self.assertEqual(repository.get_bundle_languages("b-sig", conn=self.conn), ["en", "nl", "de"])

        updated = repository.set_bundle_languages("b-sig", ["de", "en", "nl"], conn=self.conn)
        self.assertEqual(updated, ["de", "en", "nl"])
        self.assertEqual(repository.get_bundle_languages("b-sig", conn=self.conn), ["de", "en", "nl"])

        bundle = repository.get_bundle("b-sig", conn=self.conn)
        self.assertEqual(bundle["languages"], ["de", "en", "nl"])


if __name__ == "__main__":
    unittest.main()
