import sqlite3
import unittest
from backend.app.storage import repository


class TestBulkGeneration(unittest.TestCase):
    def setUp(self):
        self.conn = sqlite3.connect(":memory:")
        self.conn.row_factory = sqlite3.Row
        self.conn.execute("PRAGMA foreign_keys = ON;")
        repository.init_db(conn=self.conn)

    def tearDown(self):
        self.conn.close()

    def test_batch_entries_and_deduplication(self):
        repository.create_bundle(
            name="Alpha Pack",
            language_codes=["en", "es"],
            bundle_id="b-alpha",
            conn=self.conn,
        )

        batch_data = [
            {"en": "water", "es": "agua"},
            {"en": "bread", "es": "pan"},
            {"en": "apple", "es": "manzana"},
        ]
        entry_ids = repository.add_batch_entries_with_translations(
            bundle_id="b-alpha",
            batch_items=batch_data,
            conn=self.conn,
        )
        self.assertEqual(len(entry_ids), 3)

        existing = repository.get_existing_phrases_in_bundle("b-alpha", "en", conn=self.conn)
        self.assertEqual(existing, {"water", "bread", "apple"})

        cached = repository.find_cached_translations(
            source_phrases=["Water", "Coffee"],
            source_lang="en",
            target_langs=["es"],
            conn=self.conn,
        )
        self.assertIn("water", cached)
        self.assertEqual(cached["water"]["es"], "agua")
        self.assertNotIn("coffee", cached)

    def test_matrix_after_batch_insert(self):
        repository.create_bundle(
            name="Matrix Pack",
            language_codes=["en", "de"],
            bundle_id="b-matrix",
            conn=self.conn,
        )
        repository.add_batch_entries_with_translations(
            bundle_id="b-matrix",
            batch_items=[
                {"en": "train", "de": "Zug"},
                {"en": "station", "de": "Bahnhof"},
            ],
            conn=self.conn,
        )
        matrix = repository.get_bundle_matrix("b-matrix", conn=self.conn)
        self.assertIsNotNone(matrix)
        self.assertEqual(len(matrix["entries"]), 2)

    def test_sanitize_translation_repetitions(self):
        from backend.app.engine.translator import sanitize_translation

        res = sanitize_translation("Ball ball ball ball ball ball ball ball", "ball")
        self.assertEqual(res, "Ball")

        res = sanitize_translation("parça parça parça parça parça parça parça", "piece")
        self.assertEqual(res, "parça")

        res = sanitize_translation("Takip Takip Takip", "followed")
        self.assertEqual(res, "Takip")

        res = sanitize_translation("on on on on", "ten")
        self.assertEqual(res, "on")

        res = sanitize_translation("ziyareti ziyaret ziyaret ziyaret ziyaret", "visit")
        self.assertEqual(res, "ziyareti")

        res = sanitize_translation("Masa masası", "table")
        self.assertEqual(res, "Masa")

        res = sanitize_translation("işaret işareti", "mark")
        self.assertEqual(res, "işaret")

        res = sanitize_translation("Hallo.", "Hello")
        self.assertEqual(res, "Hallo")

        res = sanitize_translation("Merhaba Merhaba", "Hello")
        self.assertEqual(res, "Merhaba")

        res = sanitize_translation("Merhaba Merhaba.", "Hello")
        self.assertEqual(res, "Merhaba")

        res = sanitize_translation("Hallo.", "Hello.")
        self.assertEqual(res, "Hallo.")

        res = sanitize_translation("Hoe gaat het.", "How are you?")
        self.assertEqual(res, "Hoe gaat het?")

        sentence = "Bugün hava çok güzel."
        self.assertEqual(sanitize_translation(sentence, "The weather is very nice today."), sentence)


if __name__ == "__main__":
    unittest.main()
