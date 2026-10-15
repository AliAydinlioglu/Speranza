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
    style_id: str | None = None


class BundleLanguagesUpdateRequest(BaseModel):
    languages: list[str] = Field(default_factory=list)


class BundleSummary(BaseModel):
    id: str
    name: str
    created_at: str | None = None
    languages: list[str] = Field(default_factory=list)
    item_count: int = 0
    style_id: str | None = None


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
    style_id: str | None = None


class EntryCreateRequest(BaseModel):
    source_lang: str
    text: str


class EntryResponse(BaseModel):
    id: str
    bundle_id: str
    created_at: str | None = None
    translations: dict[str, str] = Field(default_factory=dict)


class CorpusCandidateItem(BaseModel):
    text: str
    frequency: int = 1


class CorpusPreviewResponse(BaseModel):
    source: str
    total_candidates: int
    candidates: list[CorpusCandidateItem] = Field(default_factory=list)


class CorpusAnalyzeTextRequest(BaseModel):
    text: str
    mode: str = "words"
    top_n: int | str | None = 50
    filter_stopwords: bool = True
    min_length: int = 3


class BulkGenerateRequest(BaseModel):
    bundle_name: str | None = None
    bundle_id: str | None = None
    languages: list[str]
    source_lang: str = "en"
    phrases: list[str]
    style_id: str | None = None


class BulkTaskStatus(BaseModel):
    id: str
    bundle_id: str | None = None
    bundle_name: str | None = None
    status: str
    total_items: int = 0
    processed_items: int = 0
    progress_percent: int = 0
    current_phrase: str | None = None
    skipped_duplicates: int = 0
    error: str | None = None
