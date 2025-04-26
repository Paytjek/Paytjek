import os
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

# Henter din URL fra .env eller brug en default for lokal udvikling
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://paytjek:hemmelig@localhost:5432/paytjek_db")

# Asynkron engine + session
engine = create_async_engine(DATABASE_URL, future=True)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

# Base‑klasse til modeller
Base = declarative_base()

# Dependency‑funktion til FastAPI
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
