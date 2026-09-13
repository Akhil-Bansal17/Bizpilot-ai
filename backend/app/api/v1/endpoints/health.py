from fastapi import APIRouter, Response, status
from pydantic import BaseModel

from app.core.config import settings
from app.db.session import check_db_connection

router = APIRouter()


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str


class DBHealthResponse(BaseModel):
    status: str
    database: str


@router.get("/health", response_model=HealthResponse, status_code=status.HTTP_200_OK)
def get_health():
    """Basic service health check endpoint."""
    return HealthResponse(
        status="ok",
        service="bizpilot-ai-backend",
        version=settings.VERSION,
    )


@router.get("/health/db", response_model=DBHealthResponse)
def get_db_health(response: Response):
    """Database connectivity health check endpoint."""
    is_reachable = check_db_connection()
    if is_reachable:
        return DBHealthResponse(
            status="ok",
            database="reachable",
        )
    else:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        return DBHealthResponse(
            status="degraded",
            database="unreachable",
        )
