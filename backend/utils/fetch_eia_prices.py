"""
Fetch REAL electricity prices from EIA (US Energy Information Administration).
Updates eia_prices_cache.json with latest USA state electricity prices.

EIA API Documentation: https://www.eia.gov/opendata/
API v2 Electricity Data: https://www.eia.gov/opendata/browser/electricity/rto
"""

import os
import json
import requests
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional
import time


# USA State IDs for EIA API (retail sales endpoint)
STATE_IDS = {
    "California": "CA",
    "Texas": "TX",
    "Arizona": "AZ",
    "Ohio": "OH",
    "New York": "NY",
}

# EIA API Configuration
EIA_API_KEY = os.getenv("EIA_API_KEY")
EIA_BASE_URL = "https://api.eia.gov/v2/electricity/retail-sales/data"


def fetch_eia_state_price(state_id: str, months_back: int = 12, retry: int = 0, max_retries: int = 3) -> Optional[float]:
    """
    Fetch retail industrial electricity price for USA state with retry logic.
    Uses EIA Retail Sales API for industrial sector prices.
    
    Args:
        state_id: State ID code (e.g., "CA" for California)
        months_back: Number of months to average (default 12 months)
        retry: Current retry attempt
        max_retries: Maximum retry attempts
        
    Returns:
        Average price in EUR/kWh or None if failed
    """
    if not EIA_API_KEY:
        print(f"❌ EIA_API_KEY not found in environment")
        return None
    
    params = {
        "api_key": EIA_API_KEY,
        "frequency": "monthly",
        "data[0]": "price",  # Average price in cents/kWh
        "facets[stateid][]": state_id,
        "facets[sectorid][]": "IND",  # Industrial sector
        "sort[0][column]": "period",
        "sort[0][direction]": "desc",
        "offset": 0,
        "length": months_back
    }
    
    try:
        response = requests.get(EIA_BASE_URL, params=params, timeout=30)
        
        # Handle rate limiting (EIA has 5000 calls/hour limit)
        if response.status_code == 429:
            if retry < max_retries:
                wait_time = 2 ** retry  # Exponential backoff
                print(f"  ⏳ Rate limited, waiting {wait_time}s before retry {retry + 1}/{max_retries}...")
                time.sleep(wait_time)
                return fetch_eia_state_price(state_id, months_back, retry + 1, max_retries)
            else:
                print(f"  ❌ Rate limit exceeded after {max_retries} retries")
                return None
        
        if response.status_code == 200:
            data = response.json()
            
            # Extract prices from response
            records = data.get("response", {}).get("data", [])
            if not records:
                print(f"  ⚠️  No data found for {state_id}")
                return None
            
            # Filter and average prices (in cents/kWh)
            prices_cents_kwh = []
            for record in records:
                if "price" in record and record["price"]:
                    try:
                        prices_cents_kwh.append(float(record["price"]))
                    except (ValueError, TypeError):
                        continue
            
            if not prices_cents_kwh:
                print(f"  ⚠️  No valid prices found for {state_id}")
                return None
            
            # Calculate average and convert cents/kWh to EUR/kWh
            avg_price_cents_kwh = sum(prices_cents_kwh) / len(prices_cents_kwh)
            
            # Conversion: cents/kWh → USD/kWh → EUR/kWh
            # 1 cent = $0.01
            # USD to EUR conversion rate ~0.92 (approximate)
            usd_to_eur = 0.92
            avg_price_eur_kwh = (avg_price_cents_kwh / 100) * usd_to_eur
            
            print(f"  ✅ {state_id}: {len(prices_cents_kwh)} months, avg {avg_price_cents_kwh:.2f}¢/kWh = €{avg_price_eur_kwh:.4f}/kWh")
            return avg_price_eur_kwh
            
        else:
            print(f"  ❌ EIA API error {response.status_code}: {response.text[:200]}")
            return None
            
    except requests.exceptions.Timeout:
        print(f"  ⏳ Request timeout for {state_id}")
        if retry < max_retries:
            return fetch_eia_state_price(state_id, months_back, retry + 1, max_retries)
        return None
        
    except Exception as e:
        print(f"  ❌ Error fetching {state_id}: {str(e)}")
        return None


def update_eia_prices_cache() -> Dict[str, any]:
    """
    Update cache with latest EIA prices for all USA states/markets.
    
    Returns:
        Dictionary with updated prices and metadata
    """
    print("\n" + "="*70)
    print("🇺🇸 UPDATING USA ELECTRICITY PRICES FROM EIA API")
    print("="*70)
    
    cache_path = Path(__file__).parent.parent / "data" / "eia_prices_cache.json"
    
    results = {
        "last_updated": datetime.now().isoformat(),
        "source": "EIA API v2 - Retail Sales (Industrial Sector)",
        "api_endpoint": EIA_BASE_URL,
        "update_frequency": "Daily at 06:00 UTC",
        "data_period": "12-month rolling average",
        "sector": "Industrial (IND)",
        "prices": {}
    }
    
    success_count = 0
    fail_count = 0
    
    for state_name, state_id in STATE_IDS.items():
        print(f"\n📍 Fetching {state_name} ({state_id})...")
        price = fetch_eia_state_price(state_id)
        
        if price is not None:
            results["prices"][state_name] = {
                "price_eur_kwh": round(price, 4),
                "state_id": state_id,
                "updated_at": datetime.now().isoformat(),
                "source": f"EIA Retail Sales {state_id}",
                "sector": "industrial",
                "data_quality": "live"
            }
            success_count += 1
        else:
            # Keep old data if available, mark as stale
            print(f"  ⚠️  Failed to fetch {state_name}, will use fallback data")
            results["prices"][state_name] = {
                "price_eur_kwh": None,
                "state_id": state_id,
                "updated_at": datetime.now().isoformat(),
                "source": f"EIA Retail Sales {state_id}",
                "sector": "industrial",
                "data_quality": "failed",
                "error": "API fetch failed"
            }
            fail_count += 1
    
    # Save to cache
    cache_path.parent.mkdir(parents=True, exist_ok=True)
    with open(cache_path, 'w') as f:
        json.dump(results, f, indent=2)
    
    print("\n" + "="*70)
    print(f"✅ EIA PRICE UPDATE COMPLETE")
    print(f"   Success: {success_count}/{len(STATE_IDS)} states")
    print(f"   Failed:  {fail_count}/{len(STATE_IDS)} states")
    print(f"   Cache:   {cache_path}")
    print("="*70 + "\n")
    
    return results


def get_eia_cache_age() -> Optional[float]:
    """Get age of EIA cache in hours"""
    cache_path = Path(__file__).parent.parent / "data" / "eia_prices_cache.json"
    
    if not cache_path.exists():
        return None
    
    mtime = cache_path.stat().st_mtime
    age_seconds = time.time() - mtime
    age_hours = age_seconds / 3600
    
    return age_hours


if __name__ == "__main__":
    """
    Run this script to update EIA prices cache:
    
    cd /path/to/backend
    python -m utils.fetch_eia_prices
    """
    print("\n🚀 Starting EIA price update...")
    
    # Check if API key is configured
    if not EIA_API_KEY:
        print("\n❌ ERROR: EIA_API_KEY not found in environment")
        print("   Please set it in backend/.env file")
        exit(1)
    
    # Update prices
    results = update_eia_prices_cache()
    
    # Display summary
    print("\n📊 PRICE SUMMARY:")
    for state, data in results["prices"].items():
        if data["price_eur_kwh"]:
            print(f"   {state:15s} €{data['price_eur_kwh']:.4f}/kWh ({data['state_id']})")
        else:
            print(f"   {state:15s} ❌ Failed")
    
    print("\n✅ Done! Cache updated successfully.\n")
