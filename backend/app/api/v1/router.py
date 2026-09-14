from fastapi import APIRouter

from app.api.v1.endpoints import auth, businesses, health

api_v1_router = APIRouter()

# Include endpoint sub-routers
api_v1_router.include_router(health.router, tags=["Health"])
api_v1_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_v1_router.include_router(
    businesses.router, prefix="/businesses", tags=["Businesses"]
)
