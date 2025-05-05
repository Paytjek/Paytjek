from fastapi import APIRouter, HTTPException
import httpx
from urllib.parse import unquote

router = APIRouter(prefix="/api/v1/calendar")

@router.get("/proxy")
async def proxy_calendar(url: str):
    """Proxy endpoint for at hente ICS data fra eksterne kilder"""
    try:
        # Decode URL hvis den er encoded
        decoded_url = unquote(url)
        
        async with httpx.AsyncClient() as client:
            response = await client.get(decoded_url)
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Failed to fetch calendar data: {response.text}"
                )
            
            # Verificer at det er ICS data
            content = response.text
            if not content.startswith("BEGIN:VCALENDAR"):
                raise HTTPException(
                    status_code=400,
                    detail="Invalid ICS data received"
                )
            
            return content
            
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching calendar data: {str(e)}"
        ) 