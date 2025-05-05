FROM python:3.10-slim

WORKDIR /app

# Installer systembibilioteker der kræves af doctr og andre afhængigheder
RUN apt-get update && apt-get install -y \
    build-essential \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    poppler-utils \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libpangoft2-1.0-0 \
    libharfbuzz0b \
    libcairo2 \
    libfontconfig1 \
    && rm -rf /var/lib/apt/lists/*

# Sæt miljøvariabel så DocTR bruger PyTorch
ENV USE_TORCH=1
ENV PYTHONPATH=/app

# Installerer PyTorch og torchvision FØRST, før doctr
RUN pip install --no-cache-dir torch==2.0.1 torchvision==0.15.2 --index-url https://download.pytorch.org/whl/cpu

# Verificér at PyTorch er installeret korrekt
RUN python -c "import torch; print('PyTorch er installeret korrekt:', torch.__version__)"

# Nu installerer vi resten af dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install email-validator for Pydantic's EmailStr 
RUN pip install --no-cache-dir email-validator

# Opret temp_uploads mappen
RUN mkdir -p /app/temp_uploads

# Kopier alle filer
COPY . .

# Installer Alembic (hvis ikke allerede i requirements.txt)
RUN pip install --no-cache-dir alembic

# Sikrer at mappen er skrivbar
RUN chmod 777 /app/temp_uploads

# Start script
CMD ["sh", "-c", "echo 'Venter på at databasen er klar...' && sleep 5 && echo 'Kører database migrationer...' && cd /app && alembic upgrade head && echo 'Starter FastAPI applikationen...' && python -c 'import torch; print(\"PyTorch version:\", torch.__version__)' && python -c 'import doctr; print(\"DocTR version:\", doctr.__version__)' && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"]
