import html
import io
import json
from pathlib import Path
import re
from collections import Counter
import zipfile

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent
SEEDS_DIR = Path(__file__).resolve().parent.parent / "data" / "seeds"

DEFAULT_STOPWORDS = {
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are",
    "aren't", "as", "at", "be", "because", "been", "before", "being", "below", "between", "both",
    "but", "by", "can", "can't", "cannot", "could", "couldn't", "did", "didn't", "do", "does",
    "doesn't", "doing", "don't", "down", "during", "each", "few", "for", "from", "further", "had",
    "hadn't", "has", "hasn't", "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her",
    "here", "here's", "hers", "herself", "him", "himself", "his", "how", "how's", "i", "i'd",
    "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't", "it", "it's", "its", "itself",
    "let's", "me", "more", "most", "mustn't", "my", "myself", "no", "nor", "not", "of", "off",
    "on", "once", "only", "or", "other", "ought", "our", "ours", "ourselves", "out", "over",
    "own", "same", "shan't", "she", "she'd", "she'll", "she's", "should", "shouldn't", "so",
    "some", "such", "than", "that", "that's", "the", "their", "theirs", "them", "themselves",
    "then", "there", "there's", "these", "they", "they'd", "they'll", "they're", "they've",
    "this", "those", "through", "to", "too", "under", "until", "up", "very", "was", "wasn't",
    "we", "we'd", "we'll", "we're", "we've", "were", "weren't", "what", "what's", "when",
    "when's", "where", "where's", "which", "while", "who", "who's", "whom", "why", "why's",
    "with", "won't", "would", "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your",
    "yours", "yourself", "yourselves"
}

FALLBACK_ENGLISH_WORDS = [
    "time", "year", "people", "way", "day", "man", "thing", "woman", "life", "child",
    "world", "school", "state", "family", "student", "group", "country", "problem", "hand", "part",
    "place", "case", "week", "company", "system", "program", "question", "work", "government", "number",
    "night", "point", "home", "water", "room", "mother", "area", "money", "story", "fact",
    "month", "lot", "right", "study", "book", "eye", "job", "word", "business", "issue",
    "side", "kind", "head", "house", "service", "friend", "father", "power", "hour", "game",
    "line", "end", "member", "law", "car", "city", "community", "name", "president", "team",
    "minute", "idea", "kid", "body", "information", "back", "parent", "face", "others", "level",
    "office", "door", "health", "person", "art", "war", "history", "party", "result", "change",
    "morning", "reason", "research", "girl", "guy", "moment", "air", "teacher", "force", "education",
    "foot", "boy", "age", "policy", "process", "music", "market", "sense", "nation", "plan",
    "college", "interest", "death", "experience", "effect", "use", "class", "control", "care", "field",
    "development", "role", "effort", "rate", "heart", "drug", "show", "leader", "light", "voice",
    "wife", "police", "mind", "price", "report", "decision", "view", "relationship", "town", "road",
    "arm", "difference", "value", "building", "action", "model", "season", "society", "tax", "director",
    "position", "player", "agree", "record", "paper", "space", "ground", "form", "event", "official",
    "matter", "center", "couple", "site", "project", "activity", "star", "table", "need", "court",
    "american", "oil", "situation", "cost", "industry", "figure", "street", "image", "phone", "data",
    "picture", "practice", "piece", "land", "product", "doctor", "wall", "patient", "worker", "news",
    "test", "movie", "north", "love", "support", "technology", "step", "baby", "computer", "type",
    "attention", "film", "republican", "tree", "source", "organization", "hair", "look", "century", "evidence",
    "window", "brother", "culture", "station", "meeting", "hospital", "travel", "safety", "machine", "signal"
]


def get_wordfreq_candidates(lang: str = "en", top_n: int = 100, rank_start: int = 0) -> list[dict]:
    words: list[str] = []
    try:
        import wordfreq
        full_list = wordfreq.top_n_list(lang, top_n + rank_start)
        words = full_list[rank_start : rank_start + top_n]
    except Exception:
        words = []

    if not words:
        available = FALLBACK_ENGLISH_WORDS[rank_start : rank_start + top_n]
        if not available and rank_start > 0:
            available = FALLBACK_ENGLISH_WORDS[:top_n]
        words = available

    return [{"text": w, "frequency": 1} for w in words]


def get_sentence_categories() -> list[str]:
    seed_file = SEEDS_DIR / "sentences_en.json"
    if not seed_file.exists():
        return ["everyday", "travel", "dining", "work", "emergency"]
    try:
        data = json.loads(seed_file.read_text(encoding="utf-8"))
        categories = sorted({item.get("category", "general") for item in data})
        return categories
    except Exception:
        return ["everyday", "travel", "dining", "work", "emergency"]


def get_seed_sentences(category: str | None = None, count: int = 50) -> list[dict]:
    seed_file = SEEDS_DIR / "sentences_en.json"
    if not seed_file.exists():
        return []

    try:
        data = json.loads(seed_file.read_text(encoding="utf-8"))
    except Exception:
        return []

    filtered = data
    if category and category.lower() != "all":
        filtered = [item for item in data if item.get("category") == category.lower()]

    candidates = filtered[:count]
    return [{"text": item["text"], "frequency": 1} for item in candidates]


def extract_from_text(
    text: str,
    mode: str = "words",
    top_n: int | str | None = 50,
    filter_stopwords: bool = True,
    min_length: int = 3,
) -> list[dict]:
    if not text or not text.strip():
        return []

    is_unlimited = False
    parsed_top_n = 50
    if top_n is None:
        is_unlimited = True
    elif isinstance(top_n, str) and top_n.strip().upper() == "ALL":
        is_unlimited = True
    else:
        try:
            val = int(top_n)
            if val > 5000 or val <= 0:
                is_unlimited = True
            else:
                parsed_top_n = val
        except (ValueError, TypeError):
            is_unlimited = True

    if mode == "sentences":
        raw_sentences = re.split(r"(?<=[.!?])\s+", text)
        cleaned_sentences: list[str] = []
        seen = set()

        for s in raw_sentences:
            s_clean = re.sub(r"\s+", " ", s).strip()
            words_in_s = s_clean.split()
            if 4 <= len(words_in_s) <= 14:
                lower_key = s_clean.lower()
                if lower_key not in seen:
                    seen.add(lower_key)
                    cleaned_sentences.append(s_clean)
            if not is_unlimited and len(cleaned_sentences) >= parsed_top_n:
                break

        return [{"text": s, "frequency": 1} for s in cleaned_sentences]

    tokens = re.findall(r"\b[A-Za-z]+(?:'[A-Za-z]+)?\b", text)
    filtered_tokens: list[str] = []

    for t in tokens:
        lower_t = t.lower()
        if len(lower_t) < min_length:
            continue
        if filter_stopwords and lower_t in DEFAULT_STOPWORDS:
            continue
        filtered_tokens.append(lower_t)

    counter = Counter(filtered_tokens)
    most_common = counter.most_common() if is_unlimited else counter.most_common(parsed_top_n)

    return [{"text": word, "frequency": count} for word, count in most_common]


def extract_text_from_epub(file_bytes: bytes) -> str:
    extracted_parts: list[str] = []
    with zipfile.ZipFile(io.BytesIO(file_bytes)) as z:
        for filename in z.namelist():
            lower_name = filename.lower()
            if lower_name.endswith((".html", ".xhtml", ".htm")):
                try:
                    content_bytes = z.read(filename)
                    raw_html = content_bytes.decode("utf-8", errors="ignore")
                    text_no_tags = re.sub(r"<[^>]+>", " ", raw_html)
                    cleaned = html.unescape(text_no_tags)
                    extracted_parts.append(cleaned)
                except Exception:
                    continue
    return " ".join(extracted_parts)
