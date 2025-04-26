import os
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

# Get database URL from environment or use default for local development
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://paytjek:hemmelig@localhost:5432/paytjek_db")

# Set up async engine and session
engine = create_async_engine(DATABASE_URL, future=True)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

# Base class for models
Base = declarative_base()

# Dependency function for FastAPI
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
