from collections.abc import Generator

from sqlalchemy.orm import Session

from app.db.session import get_db_session


def get_db() -> Generator[Session, None, None]:
    """Dependency injection provider yielding SQLAlchemy database session."""
    yield from get_db_session()
