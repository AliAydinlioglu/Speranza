import io
import unittest
import zipfile
from backend.app.services import corpus_service, task_service


class TestCorpusService(unittest.TestCase):
    def test_wordfreq_preset_fallback(self):
        items = corpus_service.get_wordfreq_candidates("en", top_n=20, rank_start=0)
        self.assertEqual(len(items), 20)
        self.assertIn("text", items[0])
        self.assertIsInstance(items[0]["text"], str)

    def test_sentence_categories_and_presets(self):
        categories = corpus_service.get_sentence_categories()
        self.assertIn("everyday", categories)
        self.assertIn("travel", categories)

        sentences = corpus_service.get_seed_sentences(category="travel", count=10)
        self.assertTrue(1 <= len(sentences) <= 10)
        self.assertIn("text", sentences[0])

    def test_extract_from_text_words(self):
        sample_text = (
            "The neural engine processes language data efficiently. "
            "The engine translates language data across multiple targets."
        )
        words = corpus_service.extract_from_text(
            sample_text,
            mode="words",
            top_n=5,
            filter_stopwords=True,
            min_length=3,
        )
        texts = [w["text"] for w in words]
        self.assertIn("language", texts)
        self.assertIn("engine", texts)
        self.assertNotIn("the", texts)

    def test_extract_from_text_sentences(self):
        sample_text = (
            "Where is the nearest train station? "
            "How much does a one-way ticket cost? "
            "Yes. "
            "This is a longer sentence with more words that should be included properly in the list."
        )
        sentences = corpus_service.extract_from_text(
            sample_text,
            mode="sentences",
            top_n=10,
        )
        self.assertTrue(len(sentences) >= 2)
        texts = [s["text"] for s in sentences]
        self.assertTrue(any("station" in t for t in texts))
        self.assertNotIn("Yes.", texts)

    def test_extract_text_from_epub(self):
        buf = io.BytesIO()
        with zipfile.ZipFile(buf, "w") as z:
            z.writestr("chapter1.xhtml", "<html><body><p>Hello world from EPUB book.</p></body></html>")
        extracted = corpus_service.extract_text_from_epub(buf.getvalue())
        self.assertIn("Hello world from EPUB book", extracted)

    def test_task_service_lifecycle(self):
        task_id = task_service.create_task(
            bundle_id="b-test",
            bundle_name="Test Pack",
            total_items=10,
            skipped_duplicates=2,
        )
        task = task_service.get_task(task_id)
        self.assertEqual(task["status"], "processing")
        self.assertEqual(task["total_items"], 10)
        self.assertEqual(task["skipped_duplicates"], 2)

        task_service.update_progress(task_id, processed_items=5, current_phrase="Hello")
        task = task_service.get_task(task_id)
        self.assertEqual(task["processed_items"], 5)
        self.assertEqual(task["progress_percent"], 50)
        self.assertEqual(task["current_phrase"], "Hello")

        task_service.complete_task(task_id, bundle_id="b-test")
        task = task_service.get_task(task_id)
        self.assertEqual(task["status"], "completed")
        self.assertEqual(task["progress_percent"], 100)


if __name__ == "__main__":
    unittest.main()
