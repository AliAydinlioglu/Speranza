from pydantic import BaseModel, Field


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
    languages: list[str]
    item_count: int = 0


class EntryDetail(BaseModel):
    id: str
    created_at: str | None = None
    translations: dict[str, str]


class BundleDetail(BaseModel):
    id: str
    name: str
    created_at: str | None = None
    languages: list[str]
    entries: list[EntryDetail] = Field(default_factory=list)


class EntryCreateRequest(BaseModel):
    source_lang: str
    text: str


class EntryResponse(BaseModel):
    id: str
    bundle_id: str
    created_at: str | None = None
    translations: dict[str, str]
