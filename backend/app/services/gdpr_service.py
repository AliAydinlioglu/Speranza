from datetime import datetime, timezone
import sqlite3
from backend.app.core.models import (
    GDPRExportBundle,
    GDPRExportEntry,
    GDPRExportResponse,
    GDPRPolicyResponse,
    GDPRPurgeResponse,
)
from backend.app.storage import repository


def export_all_user_data(conn: sqlite3.Connection | None = None) -> GDPRExportResponse:
    raw_bundles = repository.list_bundles(conn=conn)
    bundles: list[GDPRExportBundle] = []
    total_entries_count = 0

    for b in raw_bundles:
        matrix = repository.get_bundle_matrix(b["id"], conn=conn)
        entries: list[GDPRExportEntry] = []
        if matrix and "entries" in matrix:
            for e in matrix["entries"]:
                entries.append(
                    GDPRExportEntry(
                        id=e["id"],
                        created_at=e.get("created_at"),
                        translations=e.get("translations", {}),
                    )
                )
                total_entries_count += 1
        bundles.append(
            GDPRExportBundle(
                id=b["id"],
                name=b["name"],
                created_at=b.get("created_at"),
                languages=b.get("languages", []),
                entries=entries,
            )
        )

    return GDPRExportResponse(
        export_timestamp=datetime.now(timezone.utc).isoformat(),
        application="Speranza",
        schema_version="1.0.0",
        gdpr_article="Articles 15 & 20 (Right of Access and Right to Data Portability)",
        total_bundles=len(bundles),
        total_entries=total_entries_count,
        bundles=bundles,
    )


def purge_all_user_data(conn: sqlite3.Connection | None = None) -> GDPRPurgeResponse:
    stats = repository.purge_all_data(conn=conn)
    return GDPRPurgeResponse(
        status="purged",
        purged_at=datetime.now(timezone.utc).isoformat(),
        message=f"All stored user data permanently erased. Purged {stats['deleted_bundles']} bundles and {stats['deleted_entries']} entries.",
    )


def get_privacy_policy() -> GDPRPolicyResponse:
    return GDPRPolicyResponse(
        application="Speranza Private Multi-Target Translator",
        compliance="EU General Data Protection Regulation (GDPR) 2016/679",
        data_storage="100% Local on-premises SQLite database inside user-controlled container. No external transmission.",
        data_retention="Translations processed in memory and never logged to disk. Saved vocabulary packs persist until deleted by user.",
        telemetry="Zero telemetry, zero remote error reporting, zero third-party analytics.",
        cookies="Zero advertising or tracking cookies. Client state (audio mute) is kept strictly in local browser storage.",
        rights=[
            "Right of Access (Article 15)",
            "Right to Rectification (Article 16)",
            "Right to Erasure / Right to be Forgotten (Article 17)",
            "Right to Restriction of Processing (Article 18)",
            "Right to Data Portability (Article 20)",
        ],
    )
