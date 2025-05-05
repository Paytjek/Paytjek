# Paytjek

Dette projekt kører med Docker og Docker Compose, som containeriserer både frontend og backend applikationer.

## Forudsætninger

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Miljøvariabler

Opret en `.env` fil i rodmappen med:

```
DATABASE_URL=postgresql+asyncpg://username:password@host:port/database
MISTRAL_API_KEY=your_mistral_api_key_here
```

**Bemærk:** Kontakt teamet for de faktiske database credentials og API nøgler. Commit aldrig credentials til version control.

## Udviklingsmiljø

For at starte udviklingsmiljøet med hot reload og live updates:

```bash
# Start udviklingsmiljøet
docker-compose up --build -d
```

Tjenesterne vil være tilgængelige på:
- Frontend: http://localhost:8080
- Backend API: http://localhost:8000

### Udviklingsfunktioner
- **Hot Reload**: Frontend ændringer opdages automatisk og opdateres i browseren
- **Volume Mounts**: Lokale filændringer reflekteres øjeblikkeligt i containere
- **Live Updates**: Ingen behov for at genbygge eller genstarte containere for kodeændringer

### Arbejde med Udviklingsmiljøet

1. **Lave Ændringer**:
   - Rediger filer i dit lokale workspace
   - Ændringer reflekteres automatisk i de kørende containere
   - Frontend opdateringer vises øjeblikkeligt i browseren
   - Backend opdateringer kræver et kort øjeblik til at genindlæse

2. **Se Logs**:
   ```bash
   # Frontend logs
   docker logs paytjek-frontend-1

   # Backend logs
   docker logs paytjek-backend-1
   ```

3. **Genstarte Tjenester**:
   ```bash
   # Genstart en specifik tjeneste
   docker-compose restart frontend
   docker-compose restart backend

   # Fuld genbygning og genstart
   docker-compose down && docker-compose up --build -d
   ```

## Produktions Deployment

For at bygge og starte applikationen i produktionsmode:

```bash
# Byg Docker images
docker-compose -f docker-compose.prod.yml build

# Start containere
docker-compose -f docker-compose.prod.yml up -d
```

Tjenesterne vil være tilgængelige på:
- Frontend: http://localhost:8080
- Backend API: http://localhost:8000

For at stoppe containere:

```bash
docker-compose -f docker-compose.prod.yml down
```

## Fejlfinding

### Almindelige Problemer

1. **Hot Reload Virker Ikke**:
   - Sørg for at du bruger udviklingsmiljøet (`docker-compose.yml`)
   - Tjek at volume mounts virker korrekt
   - Verificer at Vite kører i udviklingsmode

2. **Database Forbindelsesproblemer**:
   - Verificer at `.env` filen indeholder korrekte database credentials
   - Tjek at databasen er tilgængelig fra backend containeren
   - Brug `/db-info` endpointet til at verificere forbindelsen

3. **Filrettighedsproblemer**:
   - Hvis du støder på rettighedsfejl, prøv:
     ```bash
     docker-compose down
     docker-compose up --build -d
     ```

4. **Encoding Problemer**:
   ```bash
   echo DATABASE_URL=your_database_url > .env.new
   echo MISTRAL_API_KEY=your_mistral_api_key >> .env.new
   del .env
   move .env.new .env
   ```

### Kalender Data Problemer
- Sørg for at backend er forbundet til Supabase databasen
- Verificer at `VITE_API_URL` i `docker-compose.prod.yml` er sat til `http://localhost:8000`
- Tjek at Calendar API endpoint returnerer JSON data
