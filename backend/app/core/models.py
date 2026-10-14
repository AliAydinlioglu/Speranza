try:
    from pydantic import BaseModel, Field
except ImportError:
    class BaseModel:
        def __init__(self, **kwargs):
            for k, v in kwargs.items():
                setattr(self, k, v)

    def Field(default=None, default_factory=None):
        if default_factory is not None:
            return default_factory()
        return default


class LanguageMetadata(BaseModel):
    code: str
    name: str
    is_installed: bool


class InstallLanguageRequest(BaseModel):
    from_code: str
    to_code: str


class InstallLanguageResponse(BaseModel):
    status: str
    from_code: str
    to_code: str


class TranslateRequest(BaseModel):
    text: str
    source_lang: str
    target_langs: list[str]


class TranslateResponse(BaseModel):
    translations: dict[str, str]


class BundleCreateRequest(BaseModel):
    name: str
    languages: list[str]


class BundleSummary(BaseModel):
    id: str
    name: str
    created_at: str | None = None
    languages: list[str] = Field(default_factory=list)
    item_count: int = 0


class EntryDetail(BaseModel):
    id: str
    created_at: str | None = None
    translations: dict[str, str] = Field(default_factory=dict)


class BundleDetail(BaseModel):
    id: str
    name: str
    created_at: str | None = None
    languages: list[str] = Field(default_factory=list)
    entries: list[EntryDetail] = Field(default_factory=list)


class EntryCreateRequest(BaseModel):
    source_lang: str
    text: str


class EntryResponse(BaseModel):
    id: str
    bundle_id: str
    created_at: str | None = None
    translations: dict[str, str] = Field(default_factory=dict)


class GDPRExportEntry(BaseModel):
    id: str
    created_at: str | None = None
    translations: dict[str, str] = Field(default_factory=dict)


class GDPRExportBundle(BaseModel):
    id: str
    name: str
    created_at: str | None = None
    languages: list[str] = Field(default_factory=list)
    entries: list[GDPRExportEntry] = Field(default_factory=list)


class GDPRExportResponse(BaseModel):
    export_timestamp: str
    application: str = "Speranza"
    schema_version: str = "1.0.0"
    gdpr_article: str = "Articles 15 & 20 (Right of Access and Right to Data Portability)"
    total_bundles: int = 0
    total_entries: int = 0
    bundles: list[GDPRExportBundle] = Field(default_factory=list)


class GDPRPurgeResponse(BaseModel):
    status: str
    purged_at: str
    message: str


class GDPRPolicyResponse(BaseModel):
    application: str
    compliance: str
    data_storage: str
    data_retention: str
    telemetry: str
    cookies: str
    rights: list[str] = Field(default_factory=list)
