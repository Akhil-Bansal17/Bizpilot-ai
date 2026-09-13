import logging
from typing import Any

from fastapi import Request, status
from fastapi.responses import JSONResponse

logger = logging.getLogger(__name__)


class AppException(Exception):
    """Base application exception for BizPilot AI."""

    def __init__(
        self,
        message: str = "An unexpected error occurred.",
        code: str = "internal_error",
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        details: dict[str, Any] | None = None,
    ):

        super().__init__(message)
        self.message = message
        self.code = code
        self.status_code = status_code
        self.details = details or {}


class NotFoundException(AppException):
    def __init__(self, message: str = "Resource not found."):
        super().__init__(
            message=message,
            code="not_found",
            status_code=status.HTTP_404_NOT_FOUND,
        )


class BadRequestException(AppException):
    def __init__(self, message: str = "Invalid request parameters."):
        super().__init__(
            message=message,
            code="bad_request",
            status_code=status.HTTP_400_BAD_REQUEST,
        )


class DatabaseException(AppException):
    def __init__(self, message: str = "Database operation failed."):
        super().__init__(
            message=message,
            code="database_error",
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        )


class ServiceUnavailableException(AppException):
    def __init__(self, message: str = "Service unavailable."):
        super().__init__(
            message=message,
            code="service_unavailable",
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        )


async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    """Global handler for domain & application exceptions."""
    logger.error("AppException occurred: %s (code: %s)", exc.message, exc.code)
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": exc.code,
                "message": exc.message,
            }
        },
    )


async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Global fallback handler for unhandled exceptions."""
    logger.exception("Unhandled Exception: %s", str(exc))
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": {
                "code": "internal_error",
                "message": "Something went wrong.",
            }
        },
    )
