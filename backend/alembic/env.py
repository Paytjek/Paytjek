import os
import sys
from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool
from alembic import context
from dotenv import load_dotenv

# Sørg for at /app (din backend-mappe) er på sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Load miljøvariabler fra .env i projektroden
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

# Alembic config-objekt
config = context.config

# Hent din asynkrone URL og strip "+asyncpg" for at få en sync-URL
raw_url = os.getenv("DATABASE_URL")
if not raw_url:
    raise RuntimeError("DATABASE_URL is not set – tjek din .env og docker-compose")
sync_url = raw_url.replace("+asyncpg", "")

# Sæt den synkrone URL i Alembic
config.set_main_option("sqlalchemy.url", sync_url)

# Importér metadata og modeller (alle dine modeller skal være registreret under Base)
from db import Base
import models   # <-- Dette sikrer, at User, PaySlip og Shift registreres på Base.metadata
target_metadata = Base.metadata

# Setup logging
fileConfig(config.config_file_name)

def run_migrations_offline():
    """Kør migrationer uden DB‑forbindelse."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online():
    """Kør migrationer med DB‑forbindelse."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata
        )
        with context.begin_transaction():
            context.run_migrations()

# Vælg offline/online baseret på kørselstype
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
