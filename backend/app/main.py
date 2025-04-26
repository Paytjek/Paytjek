from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
import json
import os
from datetime import datetime, timedelta
from typing import List
import logging
import sys

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import text, select as sql_select    # Tilføjet sql_select alias

# Import config og database
from app.config import settings
from app.db import get_db, Base

# Import modeller
from app.models import User, Payslip, Shift

# Import routers
from app.routers.users import router as users_router
from app.routers.shifts import router as shifts_router

# Import utils for ICS-håndtering
from app.utils.ics_import import fetch_ics, ical_to_shifts

# Pydantic schemata
from pydantic import BaseModel, EmailStr, Field
from app.schemas import ProfileRead, UserBase as UserBaseSchema, UserCreate as UserCreateSchema, UserRead as UserReadSchema

# --- NYT ENDPOINT --- #
app = FastAPI(title=settings.PROJECT_NAME)

# Sæt logging niveau til DEBUG
logging.basicConfig(level=logging.DEBUG)

@app.get("/db-info")
async def db_info(session: AsyncSession = Depends(get_db)):
    """
    Returnerer hvilket host, port og database-navn 
    som AsyncSession er forbundet til – så vi kan se, 
    at vi rammer Supabase og ikke lokal Postgres.
    """
    try:
        result = await session.execute(text("""
            SELECT
              inet_server_addr()   AS host,
              inet_server_port()   AS port,
              current_database()   AS db
        """))
        host, port, db = result.one()
        return {"host": host, "port": port, "database": db}
    except Exception as e:
        logging.error(f"Fejl i /db-info: {e}")
        raise HTTPException(status_code=500, detail="Kunne ikke hente DB-info")

# ---------- App og CORS ---------- #
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- Root & health ---------- #
@app.get("/")
async def root():
    return {"status": "API er online", "version": "0.1.0"}

@app.get("/health")
async def health():
    return {"status": "ok"}

# ---------- Frontend-user endpoints ---------- #
@app.get("/api/v1/users", response_model=List[ProfileRead])
async def get_users(db: AsyncSession = Depends(get_db)):
    try:
        # Eksplicit specificere kolonner
        stmt = sql_select(
            User.id,
            User.username,
            User.full_name,
            User.phone,
            User.ics_url,
            User.workplace,
            User.is_active,
            User.created_at
        )
        result = await db.execute(stmt)
        users = result.all()

        profiles = []
        for user in users:
            profiles.append(ProfileRead(
                user_id=user.username,
                name=user.full_name,
                workplace=user.workplace or "",
                language="da",
                ics_url=user.ics_url
            ))
        return profiles
    except Exception as e:
        logging.error(f"Fejl ved hentning af brugere: {e}")
        raise HTTPException(500, f"Kunne ikke hente brugere: {e}")

@app.get("/api/v1/users/{user_id}")
async def get_user(user_id: str, db: AsyncSession = Depends(get_db)):
    try:
        # Eksplicit specificere kolonner
        stmt = sql_select(
            User.id,
            User.username,
            User.full_name,
            User.phone,
            User.ics_url,
            User.workplace,
            User.is_active,
            User.created_at
        ).where(User.username == user_id)
        result = await db.execute(stmt)
        user = result.first()
        
        if not user:
            raise HTTPException(404, f"Bruger {user_id} ikke fundet")
        return ProfileRead(
            user_id=user.username,
            name=user.full_name,
            workplace=user.workplace or "",
            language="da",
            ics_url=user.ics_url
        )
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Fejl ved hentning af bruger: {e}")
        raise HTTPException(500, f"Kunne ikke hente bruger: {e}")

@app.get("/api/v1/users/{user_id}/shifts")
async def get_user_shifts(user_id: str, db: AsyncSession = Depends(get_db)):
    print(f"DEBUG: get_user_shifts kaldt for bruger {user_id}", file=sys.stderr)
    try:
        # Eksplicit specificere kolonner
        stmt = sql_select(
            User.id,
            User.username,
            User.full_name,
            User.ics_url,
            User.workplace
        ).where(User.username == user_id)
        result = await db.execute(stmt)
        user = result.first()
        
        if not user:
            print(f"DEBUG: Bruger {user_id} ikke fundet i databasen", file=sys.stderr)
            logging.error(f"Bruger {user_id} ikke fundet")
            raise HTTPException(404, f"Bruger {user_id} ikke fundet")

        print(f"DEBUG: Bruger {user_id} fundet. ICS URL: {user.ics_url}", file=sys.stderr)

        if not user.ics_url:
            print(f"DEBUG: Bruger {user_id} har ingen ICS URL - returnerer dummy data", file=sys.stderr)
            logging.warning(f"Bruger {user_id} har ingen ICS URL – returnerer dummy-data")
            now = datetime.now()
            return [
                {"id": "dummy1",
                 "title": "Dagvagt (Dummy)",
                 "start": (now + timedelta(days=1)).isoformat(),
                 "end": (now + timedelta(days=1, hours=8)).isoformat()},
                {"id": "dummy2",
                 "title": "Aftenvagt (Dummy)",
                 "start": (now + timedelta(days=3)).isoformat(),
                 "end": (now + timedelta(days=3, hours=8)).isoformat()}
            ]

        print(f"DEBUG: Kalder fetch_ics med URL: {user.ics_url}", file=sys.stderr)
        logging.info(f"Henter ICS-data for {user_id} fra {user.ics_url}")
        
        # For at sikre at logning fungerer korrekt
        print(f"DEBUGGING: Forsøger at hente ICS fra URL: {user.ics_url}")
        
        # Hent ICS data med vores opdaterede funktion
        ics_data = await fetch_ics(user.ics_url)
        
        # Log resultatet
        if ics_data:
            print(f"DEBUG: ICS data hentet succesfuldt. Længde: {len(ics_data)} bytes", file=sys.stderr)
            print(f"DEBUGGING: ICS data hentet succesfuldt, længde: {len(ics_data)} bytes")
            logging.info(f"ICS-data hentet, {len(ics_data)} bytes")
        else:
            print(f"DEBUG: Kunne ikke hente ICS data fra {user.ics_url}", file=sys.stderr)
            print("DEBUGGING: Kunne ikke hente ICS data, ics_data er None")
            logging.error(f"Kunne ikke hente ICS fra {user.ics_url}, data er None")
            
            # Test direkte HTTP adgang til URL for at se om den er tilgængelig
            print(f"DEBUG: Tester direkte HTTP adgang til URL: {user.ics_url}", file=sys.stderr)
            
            # Returnér dummy-data i stedet for at fejle
            now = datetime.now()
            return [
                {"id": "dummy-error-1",
                 "title": "ERROR: Kunne ikke hente kalenderdata",
                 "start": now.isoformat(),
                 "end": (now + timedelta(hours=1)).isoformat()},
            ]

        try:
            print(f"DEBUG: Kalder ical_to_shifts med {len(ics_data)} bytes data", file=sys.stderr)
            shifts = await ical_to_shifts(ics_data)
            print(f"DEBUG: ical_to_shifts returnerede {len(shifts)} vagter", file=sys.stderr)
            print(f"DEBUGGING: Konverterede {len(shifts)} vagter fra ICS data")
            
            # Gem debug data
            debug_path = os.path.join(os.path.dirname(__file__), "calendar_data_debug.json")
            with open(debug_path, "w", encoding="utf-8") as f:
                json.dump(shifts, f, ensure_ascii=False, indent=2)
                
            return shifts
        except Exception as parse_error:
            print(f"DEBUG: Fejl ved parsing af ICS data: {parse_error}", file=sys.stderr)
            logging.error(f"Fejl ved parsing af ICS data: {parse_error}")
            print(f"DEBUGGING: Fejl ved parsing af ICS data: {parse_error}")
            # Returnér fejlbesked som en vagt
            now = datetime.now()
            return [
                {"id": "parse-error",
                 "title": f"ERROR: Kunne ikke parse kalenderdata: {str(parse_error)}",
                 "start": now.isoformat(),
                 "end": (now + timedelta(hours=1)).isoformat()},
            ]
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"DEBUG: Generel fejl ved hentning af vagter: {e}", file=sys.stderr)
        logging.error(f"Fejl ved hentning af vagter: {e}")
        print(f"DEBUGGING: Generel fejl ved hentning af vagter: {e}")
        raise HTTPException(500, f"Kunne ikke hente vagter: {e}")

# Inkluder routers (efter de specifikke ruter for at undgå konflikter)
app.include_router(users_router)
app.include_router(shifts_router)

# ---------- DB‐CRUD endpoints ---------- #
@app.get("/api/v1/db/users", response_model=List[UserReadSchema])
async def get_all_users(db: AsyncSession = Depends(get_db)):
    try:
        # Eksplicit specificere kolonner
        stmt = sql_select(
            User.id,
            User.username,
            User.full_name,
            User.phone,
            User.ics_url,
            User.workplace,
            User.is_active,
            User.created_at
        )
        result = await db.execute(stmt)
        return result.all()
    except Exception as e:
        logging.error(f"Fejl ved hentning af DB-brugere: {e}")
        raise HTTPException(500, f"Kunne ikke hente brugere: {e}")

@app.post("/api/v1/db/users", response_model=UserReadSchema, status_code=status.HTTP_201_CREATED)
async def create_user(user: UserCreateSchema, db: AsyncSession = Depends(get_db)):
    try:
        db_user = User(
            username=user.username,
            full_name=user.full_name,
            phone=user.phone,
            ics_url=user.ics_url,
            workplace=user.workplace
        )
        db.add(db_user)
        await db.commit()
        await db.refresh(db_user)
        return db_user
    except Exception as e:
        await db.rollback()
        logging.error(f"Fejl ved oprettelse af DB-bruger: {e}")
        raise HTTPException(500, f"Kunne ikke oprette bruger: {e}")

@app.get("/api/v1/db/users/{user_id}", response_model=UserReadSchema)
async def get_user_by_id(user_id: int, db: AsyncSession = Depends(get_db)):
    try:
        # Eksplicit specificere kolonner
        stmt = sql_select(
            User.id,
            User.username,
            User.full_name,
            User.phone,
            User.ics_url,
            User.workplace,
            User.is_active,
            User.created_at
        ).where(User.id == user_id)
        result = await db.execute(stmt)
        user = result.first()
        
        if not user:
            raise HTTPException(404, f"Bruger med ID {user_id} ikke fundet")
        return user
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Fejl ved hentning af DB-bruger: {e}")
        raise HTTPException(500, f"Kunne ikke hente bruger: {e}")

# Upload-endpoint tilføjes senere, når afhængigheder er på plads
