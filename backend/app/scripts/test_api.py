#!/usr/bin/env python
"""
Script to test the API and verify that user data is fetched correctly.
"""
import sys
import asyncio
import json
import requests
from pathlib import Path

# Add parent directory to path to allow imports from app
sys.path.append(str(Path(__file__).parent.parent.parent))

def test_users_api():
    """Test the users API endpoint"""
    try:
        # Test the users API
        response = requests.get("http://localhost:8000/api/v1/users")
        if response.status_code != 200:
            print(f"Error: API returned status code {response.status_code}")
            return
        
        try:
            data = response.json()
            print("API Response:", json.dumps(data, indent=2))
            
            # Check if ICS URLs are present
            has_ics_url = False
            for user in data:
                if user.get("ics_url"):
                    has_ics_url = True
                    print(f"User {user.get('name')} has ICS URL: {user.get('ics_url')}")
            
            if not has_ics_url:
                print("WARNING: No users have ICS URLs in the API response!")
            
        except json.JSONDecodeError:
            print("Error: Could not parse API response as JSON")
            print("Response:", response.text)
    
    except Exception as e:
        print(f"Error connecting to API: {e}")

def test_specific_user():
    """Test fetching a specific user"""
    try:
        # Test fetching a specific user
        username = "mille-ganderup"
        response = requests.get(f"http://localhost:8000/api/v1/users/{username}")
        if response.status_code != 200:
            print(f"Error: API returned status code {response.status_code}")
            return
        
        try:
            user = response.json()
            print(f"User data for {username}:", json.dumps(user, indent=2))
            
            # Check if ICS URL is present
            if user.get("ics_url"):
                print(f"User has ICS URL: {user.get('ics_url')}")
            else:
                print("WARNING: User does not have an ICS URL in the API response!")
            
        except json.JSONDecodeError:
            print("Error: Could not parse API response as JSON")
            print("Response:", response.text)
    
    except Exception as e:
        print(f"Error connecting to API: {e}")

if __name__ == "__main__":
    print("Testing users API endpoint...")
    test_users_api()
    print("\nTesting specific user endpoint...")
    test_specific_user() 