# Database-opsætning for Paytjek

Kære kollega,

Her er en kort beskrivelse af den database-opsætning, vi har implementeret for Paytjek-projektet:

## Database-konfiguration
- Vi bruger PostgreSQL 16 som vores primære database
- Forbindelsen er konfigureret via en connection string i miljøvariablerne
- Database-URL: `postgresql+asyncpg://postgres.nxxwutvbhuvzcpbjkexp:!33Cille0707@aws-0-eu-no.com:5432/postgres`

## Docker-opsætning
- I udviklingsmiljøet kører vi en lokal PostgreSQL container via docker-compose
- I produktionsmiljøet forbinder vi til en ekstern AWS-baseret database
- Miljøvariablerne er konfigureret i .env-filen for produktion

## Sikkerhed
- Database-credentials er adskilt fra kodebasen og er kun tilgængelige via miljøvariabler
- Ingen credentials gemmes direkte i kildekoden eller commits

## API-integration
- Backend API'en bruger asyncpg til at forbinde til databasen
- Vi bruger SQLAlchemy som ORM for at interagere med databasen
- REST-endpoints eksponerer data fra databasen til frontend-applikationen

## Migrationer
- Database-skemaet kan opdateres via migrationsscripts

Lad mig vide hvis du har spørgsmål eller brug for yderligere detaljer!

Mvh,
Theis 