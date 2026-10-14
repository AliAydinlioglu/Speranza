from fastapi import APIRouter
from backend.app.api.routes import bundles, gdpr, health, languages, translate

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(languages.router)
api_router.include_router(translate.router)
api_router.include_router(bundles.router)
api_router.include_router(gdpr.router)
