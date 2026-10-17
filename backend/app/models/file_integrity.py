from sqlalchemy import Column, Integer, String

from app.database import Base


class FileIntegrity(Base):
    __tablename__ = "file_integrity"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    file_id = Column(
        String(50),
        unique=True,
        nullable=False,
        index=True,
    )

    file_name = Column(
        String(255),
        nullable=False,
    )

    path = Column(
        String(500),
        nullable=False,
    )

    endpoint = Column(
        String(100),
        nullable=False,
    )

    user = Column(
        String(100),
        nullable=False,
    )

    process = Column(
        String(150),
        nullable=False,
    )

    status = Column(
        String(50),
        nullable=False,
    )

    hash_before = Column(
        String(100),
        nullable=False,
    )

    hash_after = Column(
        String(100),
        nullable=False,
    )

    last_modified = Column(
        String(100),
        nullable=False,
    )

    size = Column(
        String(50),
        nullable=False,
    )