import threading
import time
import uuid

_lock = threading.Lock()
_tasks: dict[str, dict] = {}


def create_task(
    bundle_id: str | None = None,
    bundle_name: str | None = None,
    total_items: int = 0,
    skipped_duplicates: int = 0,
) -> str:
    task_id = str(uuid.uuid4())
    with _lock:
        _tasks[task_id] = {
            "id": task_id,
            "bundle_id": bundle_id,
            "bundle_name": bundle_name,
            "status": "processing",
            "total_items": total_items,
            "processed_items": 0,
            "progress_percent": 0,
            "current_phrase": None,
            "skipped_duplicates": skipped_duplicates,
            "error": None,
            "created_at": time.time(),
            "updated_at": time.time(),
        }
    return task_id


def update_progress(
    task_id: str,
    processed_items: int,
    current_phrase: str | None = None,
) -> None:
    with _lock:
        if task_id in _tasks:
            t = _tasks[task_id]
            if t["status"] == "completed":
                return
            t["processed_items"] = processed_items
            total = t["total_items"]
            t["progress_percent"] = min(100, int((processed_items / total) * 100)) if total > 0 else 100
            if current_phrase:
                t["current_phrase"] = current_phrase
            t["updated_at"] = time.time()


def complete_task(task_id: str, bundle_id: str | None = None) -> None:
    with _lock:
        if task_id in _tasks:
            t = _tasks[task_id]
            t["status"] = "completed"
            t["processed_items"] = t["total_items"]
            t["progress_percent"] = 100
            t["current_phrase"] = None
            if bundle_id:
                t["bundle_id"] = bundle_id
            t["updated_at"] = time.time()


def fail_task(task_id: str, error: str) -> None:
    with _lock:
        if task_id in _tasks:
            t = _tasks[task_id]
            t["status"] = "failed"
            t["error"] = error
            t["updated_at"] = time.time()


def get_task(task_id: str) -> dict | None:
    with _lock:
        task = _tasks.get(task_id)
        if task:
            return dict(task)
        return None
