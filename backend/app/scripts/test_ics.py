#!/usr/bin/env python
"""
Test script for ICS functionality.
"""
import asyncio
import aiohttp
import sys
from pathlib import Path

# Add parent directory to path to allow imports from app
sys.path.append(str(Path(__file__).parent.parent.parent))

from app.utils.ics_import import fetch_ics, ical_to_shifts

async def test_ics_url(url):
    """Test fetching and parsing of an ICS URL."""
    print(f"Testing ICS URL: {url}")
    
    try:
        # Test direct fetch with aiohttp
        print("\nTesting direct fetch with aiohttp...")
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as response:
                print(f"Status: {response.status}")
                if response.status == 200:
                    content = await response.text()
                    print(f"Content preview: {content[:100]}...")
                else:
                    print(f"Failed to fetch: {response.reason}")
        
        # Test using the fetch_ics function
        print("\nTesting fetch_ics function...")
        ics_data = await fetch_ics(url)
        if ics_data:
            print(f"ICS data preview: {ics_data[:100]}...")
            
            # Test parsing using ical_to_shifts
            print("\nTesting ical_to_shifts function...")
            shifts = await ical_to_shifts(ics_data)
            
            print(f"Found {len(shifts)} shifts")
            if shifts:
                print("First shift:", shifts[0])
            else:
                print("No shifts found in the ICS data")
        else:
            print("Failed to fetch ICS data")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    # Default URL to test
    test_url = "https://regionhovedstaden.allocate-cloud.de/EmployeeOnlineHealth/REGHLIVE/ical/d861d240-60c6-459e-a5cc-fbac98b0079f"
    
    # If a URL is provided as an argument, use that instead
    if len(sys.argv) > 1:
        test_url = sys.argv[1]
    
    # Run the test
    asyncio.run(test_ics_url(test_url)) 