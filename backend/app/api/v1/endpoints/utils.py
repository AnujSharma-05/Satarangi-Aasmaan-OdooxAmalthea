import httpx
from fastapi import FastAPI, APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Dict

# Pydantic Schemas (Data Validation Models)
class CountryInfo(BaseModel):
    """
    Defines the structure for the response of the /countries endpoint.
    """
    name: str
    currency_code: str

# API Router
# All endpoints in this file will be prefixed with /api/v1/utils
router = APIRouter(prefix="/api/v1/utils")

# API Constants from the problem statement
COUNTRIES_API_URL = "https://restcountries.com/v3.1/all?fields=name,currencies"
EXCHANGE_RATE_API_URL = "https://api.exchangerate-api.com/v4/latest/"


# API Endpoints
@router.get("/countries", response_model=List[CountryInfo])
async def get_countries_and_currencies():
    """
    Returns a sorted list of all countries with their primary currency code.
    This is the most efficient way to populate the signup dropdown menu.
    """
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(COUNTRIES_API_URL)
            response.raise_for_status()  # Raises an exception for 4xx/5xx responses
            data = response.json()
            
            countries_info = []
            for country in data:
                # Ensure the currencies field exists and is not empty before processing
                if "currencies" in country and country["currencies"]:
                    # Get the first currency code from the currencies object (e.g., "USD")
                    currency_code = next(iter(country["currencies"]))
                    countries_info.append({
                        "name": country["name"]["common"],
                        "currency_code": currency_code
                    })
            
            # Sort the final list alphabetically by country name
            countries_info.sort(key=lambda x: x['name'])
            return countries_info
            
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=e.response.status_code, detail="Error fetching data from RestCountries API.")
        except httpx.RequestError:
            raise HTTPException(status_code=503, detail="Service unavailable: Could not connect to RestCountries API.")

@router.get("/convert-currency", response_model=Dict)
async def convert_currency(
    amount: float,
    base_currency: str = Query(..., description="The currency to convert from (e.g., USD)"),
    target_currency: str = Query(..., description="The currency to convert to (e.g., INR)")
):
    """
    Converts an amount from a base currency to a target currency using real-time exchange rates.
    """
    url = f"{EXCHANGE_RATE_API_URL}{base_currency.upper()}"
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url)
            response.raise_for_status()
            
            data = response.json()
            rates = data.get("rates")
            
            if not rates or target_currency.upper() not in rates:
                raise HTTPException(status_code=404, detail=f"Target currency '{target_currency}' not found for base '{base_currency}'.")
            
            conversion_rate = rates[target_currency.upper()]
            converted_amount = amount * conversion_rate
            
            return {
                "original_amount": amount,
                "base_currency": base_currency.upper(),
                "target_currency": target_currency.upper(),
                "conversion_rate": conversion_rate,
                "converted_amount": round(converted_amount, 2)
            }
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=e.response.status_code, detail="Error fetching data from ExchangeRate API.")
        except httpx.RequestError:
            raise HTTPException(status_code=503, detail="Service unavailable: Could not connect to ExchangeRate API.")
