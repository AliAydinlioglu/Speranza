```markdown
# SUBSYSTEM SPEC: System Architecture, Engine & Storage

## 1. Container & Cross-Platform Matrix
- **Linux (Fedora GNOME/Cinnamon):** Rootless Podman via `podman compose`. Named volumes prevent SELinux `:Z` flag permission errors.
- **Windows 11:** Podman Desktop or Docker Desktop.
- **Line Endings:** Force LF across all files via `.gitattributes` (`* text=auto eol=lf`).
- **Container User:** Run as non-root `appuser` (UID `1000`).
```

## 2. Storage Layer (SQLite in WAL Mode)
Default database path: `/app/data/bundles.db`.

```sql
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;
PRAGMA synchronous = NORMAL;

CREATE TABLE IF NOT EXISTS bundles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

```

## 3. Translation Engine (`argostranslate`)

* **Discovery & Installation:** Update package index via `argostranslate.package.update_package_index()` and verify local cache before downloading.
* **Pivot Logic:**
1. Identity match (`target == source`): return original string.
2. Direct pair exists: execute directly.
3. Pivot: Translate `source -> en`, then translate `en -> target_i`.


* **Async Execution:** Heavy inference must always run in `asyncio.to_thread`.

## 4. REST API Contract

All endpoints prefixed with `/api`:

* `GET /health` -> `{"status": "healthy"}`
* `GET /api/languages` -> Array of available and installed language codes.
* `POST /api/languages/install` -> Body: `{"from_code": "en", "to_code": "nl"}`.
* `POST /api/translate` -> Body: `{"text": "...", "source_lang": "en", "target_langs": ["nl", "de"]}`.
* `GET /api/bundles` -> List bundles with language lists and item counts.
* `POST /api/bundles` -> Create a bundle pack with target languages.
* `GET /api/bundles/{id}` -> Fetch bundle translation matrix.
* `POST /api/bundles/{id}/entries` -> Add entry in one language, auto-translate remaining.
* `DELETE /api/bundles/{id}/entries/{entry_id}` -> Remove entry.
* `DELETE /api/bundles/{id}` -> Remove pack.
* `GET /api/corpus/wordfreq` -> Frequency preset word list (`source_lang`, `limit`, `rank_offset`).
* `GET /api/corpus/categories` -> Available seed sentence categories.
* `GET /api/corpus/sentences` -> Curated seed sentences by category and limit.
* `POST /api/corpus/analyze/text` -> Extract keywords or sentences from raw text input.
* `POST /api/corpus/analyze/file` -> Parse `.txt` or `.epub` document into candidate items.
* `POST /api/bundles/bulk-generate` -> Dispatch asynchronous background bulk translation task.
* `GET /api/bundles/bulk-tasks/{task_id}` -> Poll bulk task telemetry and progress metrics.

## 5. Phased Roadmap

1. **Phase 1:** Dockerfile/Containerfile, `compose.yaml`, SQLite initialization, and CRUD repository.
2. **Phase 2:** Package manager and pivot translation engine wrapped in background threads.
3. **Phase 3:** FastAPI routes, static mounting, and error handlers.
4. **Phase 4:** Terminal UI integration (refer to `.agent/ui-specification.md`).
5. **Phase 5:** End-to-end container persistence and reboot verification.

