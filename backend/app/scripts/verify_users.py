#!/usr/bin/env python
"""
Script to verify users in the database.
"""
import sys
import asyncio
from pathlib import Path

# Add parent directory to path to allow imports from app
sys.path.append(str(Path(__file__).parent.parent.parent))

from sqlalchemy.future import select

from app.db import AsyncSessionLocal
from app.models import User


async def verify_users():
    """Query the database and print out all users to verify they were imported."""
    
    async with AsyncSessionLocal() as session:
        # Query all users
        result = await session.execute(select(User))
        users = result.scalars().all()
        
        if not users:
            print("No users found in the database.")
            return
        
        print(f"Found {len(users)} users in the database:")
        print("-" * 60)
        for user in users:
            print(f"ID: {user.id}")
            print(f"Username: {user.username}")
            print(f"Full Name: {user.full_name}")
            print(f"Workplace: {user.workplace}")
            print(f"ICS URL: {user.ics_url}")
            print(f"Active: {user.is_active}")
            print(f"Created: {user.created_at}")
            print("-" * 60)


if __name__ == "__main__":
    # Run the async function
    asyncio.run(verify_users()) 