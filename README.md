# Speranza

A self-hosted, 100% offline multi-language translator and vocabulary management web application with a retro analog hardware interface.

[![Podman](https://img.shields.io/badge/container-Rootless%20Podman-892CA0?logo=podman&logoColor=white)](https://podman.io/)
[![Docker](https://img.shields.io/badge/docker-compatible-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![Argos Translate](https://img.shields.io/badge/NLP-Argos%20Translate%20(Offline)-FF6B33)](https://www.argosopentech.com/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

---

## What is this project?

**Speranza** is a private, self-hosted web app that translates text into multiple languages at the same time and lets you manage shared vocabulary lists.

Unlike Google Translate, DeepL, or cloud translation services:
- **It runs 100% locally on your own machine.** No text is ever sent over the internet or logged by third parties.
- **No API keys, accounts, or subscriptions required.**
- **CPU-friendly:** Neural translation runs locally via [Argos Translate](https://www.argosopentech.com/) (OpenNMT / CTranslate2), requiring no GPU.
- **Smart English Pivot:** To translate between languages without downloading hundreds of individual model pairs, it routes translations through English (`Source -> English -> Target Languages`).

---

## UI & Design Context

If you open the app, you'll immediately notice it doesn't look like a standard modern SaaS tool.

The interface is built as a love letter to **1970s and 1980s retro hardware and cassette-futurism** (inspired by retro sci-fi aesthetics and games like *ARC Raiders*). Instead of flat white cards and generic dropdowns, the UI feels like sitting in front of a weathered piece of analog equipment.
---

## What can you do with it?

### 1. Multi-Target Live Translation
Type or paste text into the input terminal and select multiple destination languages (e.g., Dutch, Spanish, German, French). Speranza translates into all selected languages simultaneously in real time.

### 2. Vocabulary Packs (Bundle Matrix)
Create custom vocabulary lists (like travel phrases, gaming callouts, or study decks) containing multiple languages:
- When you add a new word or sentence in *any* of the pack's languages, Speranza automatically translates it and fills in the rest of the matrix.
- You can review all translations side-by-side in a clean table and delete entries whenever needed.
- Each pack is saved to an internal SQLite database and represented visually as a cassette tape.

---

## How to Run It

Speranza is fully containerized. You do **not** need Python, Node.js, or any compilers installed on your host system.

### Prerequisites
Install either:
- **[Podman](https://podman.io/)** (with `podman-compose`) — *recommended, especially on Linux/Fedora*
- **[Docker](https://www.docker.com/)** (with `docker compose`)

### Option A: Using Podman (Rootless)

```bash
# 1. Clone the repo
git clone https://github.com/AliAydinlioglu/Speranza.git
cd Speranza

# 2. Build and start the container in the background
podman compose up -d --build

# 3. View live logs
podman compose logs -f

# 4. Stop the container
podman compose down
```

### Option B: Using Docker

```bash
# 1. Clone the repo
git clone https://github.com/AliAydinlioglu/Speranza.git
cd Speranza

# 2. Build and start
docker compose up -d --build

# 3. View live logs
docker compose logs -f

# 4. Stop the container
docker compose down
```

### Accessing the Web App
Once the container starts, open your browser and go to:
**[http://localhost:8000](http://localhost:8000)**

You can also check the health endpoint:
```bash
curl http://localhost:8000/health
# {"status":"healthy"}
```

---

## Data Persistence & Volumes

Everything you create is saved across container restarts using two named volumes defined in `compose.yaml`:

| Volume Name | Container Path | What It Stores |
| :--- | :--- | :--- |
| `translator_db` | `/app/data` | SQLite database file (`bundles.db`) with your saved packs and vocabulary entries. |
| `translator_models` | `/home/appuser/.local/share/argos-translate` | Downloaded Argos Translate neural language packages so models don't re-download on every start. |

---

## Tech Stack

- **Backend**: Python 3.11, [FastAPI](https://fastapi.tiangolo.com/), Uvicorn (running under a non-root `appuser`).
- **Storage**: SQLite 3 with WAL (Write-Ahead Logging) mode enabled for safe concurrent access.
- **Translation Engine**: [Argos Translate](https://github.com/argosopentech/argos-translate) wrapped in non-blocking worker threads (`asyncio.to_thread`).
- **Frontend**: Jinja2 HTML templates, Tailwind CSS, Vanilla JavaScript (ES6 modules, zero build step, no npm dependencies).
- **Audio & Visuals**: Native HTML5 Canvas 2D and Web Audio API.

---

## REST API Overview

In addition to the web UI, Speranza exposes a clean REST API under `/api`:

### System
- `GET /health` — Check if the service is up.

### Languages
- `GET /api/languages` — List available languages and check whether their model packages are downloaded.
- `POST /api/languages/install` — Trigger installation of a language model pair.
  ```json
  { "from_code": "en", "to_code": "nl" }
  ```

### Translation
- `POST /api/translate` — Translate text to multiple languages.
  ```json
  {
    "text": "Meeting at the rendezvous point.",
    "source_lang": "en",
    "target_langs": ["nl", "de", "es"]
  }
  ```
  Response:
  ```json
  {
    "source_lang": "en",
    "translations": {
      "nl": "Vergadering op het ontmoetingspunt.",
      "de": "Treffen am Treffpunkt.",
      "es": "Reunión en el punto de encuentro."
    }
  }
  ```

### Vocabulary Packs
- `GET /api/bundles` — List all vocabulary packs and their language codes.
- `POST /api/bundles` — Create a new pack:
  ```json
  {
    "name": "Travel Basics",
    "languages": ["en", "es", "it"]
  }
  ```
- `GET /api/bundles/{id}` — Get the full matrix of phrases and translations for a pack.
- `POST /api/bundles/{id}/entries` — Add a word/sentence to a pack; auto-translates to all other languages in that pack:
  ```json
  {
    "source_lang": "en",
    "text": "Where is the train station?"
  }
  ```
- `DELETE /api/bundles/{id}/entries/{entry_id}` — Delete an entry.

---

## License

MIT License. See [LICENSE](LICENSE) for details.
