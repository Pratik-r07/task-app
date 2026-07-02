import os


class Config:
    """Base configuration, loaded from environment variables."""

    DB_HOST = os.environ.get("DB_HOST", "localhost")
    DB_PORT = os.environ.get("DB_PORT", "5432")
    DB_NAME = os.environ.get("DB_NAME", "taskdb")
    DB_USER = os.environ.get("DB_USER", "postgres")
    DB_PASSWORD = os.environ.get("DB_PASSWORD", "postgres")

    SQLALCHEMY_DATABASE_URI = (
        f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Comma-separated list of allowed origins for CORS, e.g. "http://localhost:5173"
    CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "http://localhost:5173").split(",")
