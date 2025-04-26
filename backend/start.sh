#!/bin/bash
set -e

# Vent på databasen
echo "Venter på at databasen er klar..."
sleep 5

# Kør Alembic migrationer
echo "Kører database migrationer..."
cd /app
alembic upgrade head

# Kør applikationen
echo "Starter FastAPI applikationen..."
python -c "import torch; print(\"PyTorch version:\", torch.__version__)"
python -c "import doctr; print(\"DocTR version:\", doctr.__version__)"
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload 