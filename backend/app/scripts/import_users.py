#!/usr/bin/env python
"""
Script to import dummy users from a JSON file into the database.
"""
import json
import sys
import os
import asyncio
from pathlib import Path

# Add parent directory to path to allow imports from app
sys.path.append(str(Path(__file__).parent.parent.parent))

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db import Base, engine, AsyncSessionLocal
from app.models import User


async def import_users_from_json(json_file_path):
    """Import users from a JSON file into the database."""
    
    # Load the JSON data
    try:
        with open(json_file_path, 'r', encoding='utf-8') as f:
            users_data = json.load(f)
    except FileNotFoundError:
        print(f"Error: File {json_file_path} not found.")
        return
    except json.JSONDecodeError:
        print(f"Error: File {json_file_path} is not a valid JSON file.")
        return
    
    print(f"Importing {len(users_data)} users from {json_file_path}...")
    
    async with engine.begin() as conn:
        # If you need to create tables (uncomment if needed)
        # await conn.run_sync(Base.metadata.create_all)
        
        async with AsyncSessionLocal() as session:
            for user_data in users_data:
                # Check if user already exists by username
                username = user_data["user_id"]
                result = await session.execute(select(User).where(User.username == username))
                existing_user = result.scalar_one_or_none()
                
                if existing_user:
                    print(f"User {username} already exists, skipping...")
                    continue
                
                # Create new user
                new_user = User(
                    username=username,
                    full_name=user_data["name"],
                    # Phone is optional in the model
                    phone=None,
                    # Use the fields from the JSON
                    ics_url=user_data.get("ics_url"),
                    workplace=user_data.get("workplace"),
                    is_active=True
                )
                
                session.add(new_user)
                print(f"Added user: {username} ({user_data['name']})")
            
            # Commit all changes
            await session.commit()
    
    print("User import completed.")


if __name__ == "__main__":
    # Path to the JSON file (use relative path from script)
    json_file_path = os.path.join(Path(__file__).parent.parent, "dummyUsers.json")
    
    # Run the async function
    asyncio.run(import_users_from_json(json_file_path)) 