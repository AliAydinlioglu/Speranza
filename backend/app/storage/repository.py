import sqlite3
import uuid
from contextlib import contextmanager
from typing import Generator
from backend.app.storage.database import get_db

SCHEMA_DDL = """
CREATE TABLE IF NOT EXISTS bundles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    style_id TEXT
);

CREATE TABLE IF NOT EXISTS bundle_languages (
    bundle_id TEXT NOT NULL,
    lang_code TEXT NOT NULL,
    display_order INTEGER NOT NULL,
    PRIMARY KEY (bundle_id, lang_code),
    FOREIGN KEY (bundle_id) REFERENCES bundles (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS entries (
    id TEXT PRIMARY KEY,
    bundle_id TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bundle_id) REFERENCES bundles (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS translations (
    id TEXT PRIMARY KEY,
    entry_id TEXT NOT NULL,
    lang_code TEXT NOT NULL,
    text TEXT NOT NULL,
    UNIQUE(entry_id, lang_code),
    FOREIGN KEY (entry_id) REFERENCES entries (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_bundle_languages_order ON bundle_languages(bundle_id, display_order);
CREATE INDEX IF NOT EXISTS idx_translations_entry ON translations(entry_id);
"""


@contextmanager
def _connection_context(conn: sqlite3.Connection | None) -> Generator[sqlite3.Connection, None, None]:
    if conn is not None:
        yield conn
    else:
        with get_db() as db:
            yield db


def init_db(conn: sqlite3.Connection | None = None) -> None:
    with _connection_context(conn) as db:
        db.executescript(SCHEMA_DDL)
        try:
            db.execute("ALTER TABLE bundles ADD COLUMN style_id TEXT;")
        except sqlite3.OperationalError:
            pass


def create_bundle(
    name: str,
    language_codes: list[str],
    bundle_id: str | None = None,
    style_id: str | None = None,
    conn: sqlite3.Connection | None = None,
) -> dict:
    actual_id = bundle_id or str(uuid.uuid4())
    with _connection_context(conn) as db:
        db.execute(
            "INSERT INTO bundles (id, name, style_id) VALUES (?, ?, ?);",
            (actual_id, name, style_id),
        )
        for order, lang_code in enumerate(language_codes):
            db.execute(
                "INSERT INTO bundle_languages (bundle_id, lang_code, display_order) VALUES (?, ?, ?);",
                (actual_id, lang_code, order),
            )
    return {
        "id": actual_id,
        "name": name,
        "languages": language_codes,
        "style_id": style_id,
    }


def get_bundle(
    bundle_id: str,
    conn: sqlite3.Connection | None = None,
) -> dict | None:
    with _connection_context(conn) as db:
        bundle_row = db.execute(
            "SELECT id, name, created_at, style_id FROM bundles WHERE id = ?;",
            (bundle_id,),
        ).fetchone()
        if not bundle_row:
            return None

        lang_rows = db.execute(
            "SELECT lang_code FROM bundle_languages WHERE bundle_id = ? ORDER BY display_order ASC;",
            (bundle_id,),
        ).fetchall()

        return {
            "id": bundle_row["id"],
            "name": bundle_row["name"],
            "created_at": bundle_row["created_at"],
            "languages": [r["lang_code"] for r in lang_rows],
            "style_id": bundle_row["style_id"] if "style_id" in bundle_row.keys() else None,
        }


def get_bundle_by_name(
    name: str,
    conn: sqlite3.Connection | None = None,
) -> dict | None:
    with _connection_context(conn) as db:
        bundle_row = db.execute(
            "SELECT id, name, created_at, style_id FROM bundles WHERE name = ?;",
            (name,),
        ).fetchone()
        if not bundle_row:
            return None

        lang_rows = db.execute(
            "SELECT lang_code FROM bundle_languages WHERE bundle_id = ? ORDER BY display_order ASC;",
            (bundle_row["id"],),
        ).fetchall()

        return {
            "id": bundle_row["id"],
            "name": bundle_row["name"],
            "created_at": bundle_row["created_at"],
            "languages": [r["lang_code"] for r in lang_rows],
            "style_id": bundle_row["style_id"] if "style_id" in bundle_row.keys() else None,
        }


def list_bundles(
    conn: sqlite3.Connection | None = None,
) -> list[dict]:
    with _connection_context(conn) as db:
        bundle_rows = db.execute(
            "SELECT id, name, created_at, style_id FROM bundles ORDER BY created_at DESC;",
        ).fetchall()

        results = []
        for b in bundle_rows:
            lang_rows = db.execute(
                "SELECT lang_code FROM bundle_languages WHERE bundle_id = ? ORDER BY display_order ASC;",
                (b["id"],),
            ).fetchall()
            count_row = db.execute(
                "SELECT COUNT(*) AS count FROM entries WHERE bundle_id = ?;",
                (b["id"],),
            ).fetchone()
            item_count = count_row["count"] if count_row else 0

            results.append({
                "id": b["id"],
                "name": b["name"],
                "created_at": b["created_at"],
                "languages": [r["lang_code"] for r in lang_rows],
                "item_count": item_count,
                "style_id": b["style_id"] if "style_id" in b.keys() else None,
            })
        return results


def delete_bundle(
    bundle_id: str,
    conn: sqlite3.Connection | None = None,
) -> bool:
    with _connection_context(conn) as db:
        cursor = db.execute(
            "DELETE FROM bundles WHERE id = ?;",
            (bundle_id,),
        )
        return cursor.rowcount > 0


def set_bundle_languages(
    bundle_id: str,
    language_codes: list[str],
    conn: sqlite3.Connection | None = None,
) -> list[str]:
    with _connection_context(conn) as db:
        db.execute(
            "DELETE FROM bundle_languages WHERE bundle_id = ?;",
            (bundle_id,),
        )
        for order, lang_code in enumerate(language_codes):
            db.execute(
                "INSERT INTO bundle_languages (bundle_id, lang_code, display_order) VALUES (?, ?, ?);",
                (bundle_id, lang_code, order),
            )
    return language_codes


def get_bundle_languages(
    bundle_id: str,
    conn: sqlite3.Connection | None = None,
) -> list[str]:
    with _connection_context(conn) as db:
        rows = db.execute(
            "SELECT lang_code FROM bundle_languages WHERE bundle_id = ? ORDER BY display_order ASC;",
            (bundle_id,),
        ).fetchall()
        return [r["lang_code"] for r in rows]


def create_entry(
    bundle_id: str,
    entry_id: str | None = None,
    conn: sqlite3.Connection | None = None,
) -> str:
    actual_id = entry_id or str(uuid.uuid4())
    with _connection_context(conn) as db:
        db.execute(
            "INSERT INTO entries (id, bundle_id) VALUES (?, ?);",
            (actual_id, bundle_id),
        )
    return actual_id


def upsert_translation(
    entry_id: str,
    lang_code: str,
    text: str,
    translation_id: str | None = None,
    conn: sqlite3.Connection | None = None,
) -> dict:
    actual_id = translation_id or str(uuid.uuid4())
    with _connection_context(conn) as db:
        db.execute(
            """
            INSERT INTO translations (id, entry_id, lang_code, text)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(entry_id, lang_code) DO UPDATE SET text = excluded.text;
            """,
            (actual_id, entry_id, lang_code, text),
        )
    return {
        "id": actual_id,
        "entry_id": entry_id,
        "lang_code": lang_code,
        "text": text,
    }


def add_entry_with_translations(
    bundle_id: str,
    translations: dict[str, str],
    entry_id: str | None = None,
    conn: sqlite3.Connection | None = None,
) -> dict:
    actual_entry_id = entry_id or str(uuid.uuid4())
    with _connection_context(conn) as db:
        db.execute(
            "INSERT INTO entries (id, bundle_id) VALUES (?, ?);",
            (actual_entry_id, bundle_id),
        )
        for lang_code, text in translations.items():
            trans_id = str(uuid.uuid4())
            db.execute(
                """
                INSERT INTO translations (id, entry_id, lang_code, text)
                VALUES (?, ?, ?, ?)
                ON CONFLICT(entry_id, lang_code) DO UPDATE SET text = excluded.text;
                """,
                (trans_id, actual_entry_id, lang_code, text),
            )
    return {
        "id": actual_entry_id,
        "bundle_id": bundle_id,
        "translations": translations,
    }


def get_entry(
    entry_id: str,
    conn: sqlite3.Connection | None = None,
) -> dict | None:
    with _connection_context(conn) as db:
        entry_row = db.execute(
            "SELECT id, bundle_id, created_at FROM entries WHERE id = ?;",
            (entry_id,),
        ).fetchone()
        if not entry_row:
            return None

        trans_rows = db.execute(
            "SELECT lang_code, text FROM translations WHERE entry_id = ?;",
            (entry_id,),
        ).fetchall()

        return {
            "id": entry_row["id"],
            "bundle_id": entry_row["bundle_id"],
            "created_at": entry_row["created_at"],
            "translations": {r["lang_code"]: r["text"] for r in trans_rows},
        }


def get_entry_translations(
    entry_id: str,
    conn: sqlite3.Connection | None = None,
) -> dict[str, str]:
    with _connection_context(conn) as db:
        rows = db.execute(
            "SELECT lang_code, text FROM translations WHERE entry_id = ?;",
            (entry_id,),
        ).fetchall()
        return {r["lang_code"]: r["text"] for r in rows}


def list_entries_for_bundle(
    bundle_id: str,
    conn: sqlite3.Connection | None = None,
) -> list[dict]:
    with _connection_context(conn) as db:
        entry_rows = db.execute(
            "SELECT id, bundle_id, created_at FROM entries WHERE bundle_id = ? ORDER BY created_at DESC, rowid DESC;",
            (bundle_id,),
        ).fetchall()

        results = []
        for entry in entry_rows:
            trans_rows = db.execute(
                "SELECT lang_code, text FROM translations WHERE entry_id = ?;",
                (entry["id"],),
            ).fetchall()
            results.append({
                "id": entry["id"],
                "bundle_id": entry["bundle_id"],
                "created_at": entry["created_at"],
                "translations": {r["lang_code"]: r["text"] for r in trans_rows},
            })
        return results


def delete_entry(
    entry_id: str,
    conn: sqlite3.Connection | None = None,
) -> bool:
    with _connection_context(conn) as db:
        cursor = db.execute(
            "DELETE FROM entries WHERE id = ?;",
            (entry_id,),
        )
        return cursor.rowcount > 0


def get_bundle_matrix(
    bundle_id: str,
    conn: sqlite3.Connection | None = None,
) -> dict | None:
    bundle = get_bundle(bundle_id, conn=conn)
    if not bundle:
        return None

    entries = list_entries_for_bundle(bundle_id, conn=conn)
    return {
        "id": bundle["id"],
        "name": bundle["name"],
        "created_at": bundle["created_at"],
        "languages": bundle["languages"],
        "entries": entries,
        "style_id": bundle.get("style_id"),
    }


def purge_all_data(conn: sqlite3.Connection | None = None) -> dict:
    with _connection_context(conn) as db:
        trans_count_row = db.execute("SELECT COUNT(*) AS count FROM translations;").fetchone()
        entry_count_row = db.execute("SELECT COUNT(*) AS count FROM entries;").fetchone()
        bundle_count_row = db.execute("SELECT COUNT(*) AS count FROM bundles;").fetchone()

        trans_count = trans_count_row["count"] if trans_count_row else 0
        entry_count = entry_count_row["count"] if entry_count_row else 0
        bundle_count = bundle_count_row["count"] if bundle_count_row else 0

        db.execute("DELETE FROM translations;")
        db.execute("DELETE FROM entries;")
        db.execute("DELETE FROM bundle_languages;")
        db.execute("DELETE FROM bundles;")

    try:
        with _connection_context(conn) as db:
            db.execute("VACUUM;")
    except Exception:
        pass

    return {
        "deleted_bundles": bundle_count,
        "deleted_entries": entry_count,
        "deleted_translations": trans_count,
    }


def get_existing_phrases_in_bundle(
    bundle_id: str,
    lang_code: str,
    conn: sqlite3.Connection | None = None,
) -> set[str]:
    with _connection_context(conn) as db:
        rows = db.execute(
            """
            SELECT LOWER(TRIM(t.text)) AS phrase
            FROM translations t
            JOIN entries e ON t.entry_id = e.id
            WHERE e.bundle_id = ? AND t.lang_code = ?;
            """,
            (bundle_id, lang_code),
        ).fetchall()
        return {r["phrase"] for r in rows if r["phrase"]}


def find_cached_translations(
    source_phrases: list[str],
    source_lang: str,
    target_langs: list[str],
    conn: sqlite3.Connection | None = None,
) -> dict[str, dict[str, str]]:
    cached: dict[str, dict[str, str]] = {}
    if not source_phrases or not target_langs:
        return cached

    with _connection_context(conn) as db:
        for phrase in source_phrases:
            cleaned = phrase.strip()
            if not cleaned:
                continue
            rows = db.execute(
                """
                SELECT t2.lang_code, t2.text
                FROM translations t1
                JOIN translations t2 ON t1.entry_id = t2.entry_id
                WHERE LOWER(TRIM(t1.text)) = LOWER(TRIM(?))
                  AND t1.lang_code = ?;
                """,
                (cleaned, source_lang),
            ).fetchall()
            if rows:
                lang_dict: dict[str, str] = {}
                for r in rows:
                    if r["lang_code"] in target_langs:
                        lang_dict[r["lang_code"]] = r["text"]
                if lang_dict:
                    cached[cleaned.lower()] = lang_dict
    return cached


def add_batch_entries_with_translations(
    bundle_id: str,
    batch_items: list[dict[str, str]],
    conn: sqlite3.Connection | None = None,
) -> list[str]:
    created_entry_ids: list[str] = []
    with _connection_context(conn) as db:
        for trans_map in batch_items:
            entry_id = str(uuid.uuid4())
            db.execute(
                "INSERT INTO entries (id, bundle_id) VALUES (?, ?);",
                (entry_id, bundle_id),
            )
            for lang_code, text in trans_map.items():
                trans_id = str(uuid.uuid4())
                db.execute(
                    """
                    INSERT INTO translations (id, entry_id, lang_code, text)
                    VALUES (?, ?, ?, ?)
                    ON CONFLICT(entry_id, lang_code) DO UPDATE SET text = excluded.text;
                    """,
                    (trans_id, entry_id, lang_code, text),
                )
            created_entry_ids.append(entry_id)
    return created_entry_ids

