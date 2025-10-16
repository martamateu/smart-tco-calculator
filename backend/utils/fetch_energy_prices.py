"""
Fetch REAL electricity prices from ENTSO-E Transparency Platform.
Updates energy_prices_live.json cache with latest market data.

ENTSO-E API Documentation: https://transparency.entsoe.eu/content/static_content/Static%20content/web%20api/Guide.html
"""

import os
import json
import requests
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import xml.etree.ElementTree as ET
import time


# ENTSO-E Area Codes (EIC codes for EU countries/regions)
# Updated Oct 2025: Using bidding zone codes instead of control area codes
ENTSO_AREAS = {
    "Germany": "10Y1001A1001A82H",  # DE-LU bidding zone (historical, pre-2018 split)
    "France": "10YFR-RTE------C",
    "Italy": "10Y1001A1001A73I",    # IT-North zone (was 10YIT-GRTN-----B - control area)
    "Spain": "10YES-REE------0",
    "Netherlands": "10YNL----------L",
    "Poland": "10YPL-AREA-----S",
    "Belgium": "10YBE----------2",
    "Austria": "10YAT-APG------L",
    "Czech Republic": "10YCZ-CEPS-----N",
    "Denmark": "10YDK-1--------W",  # DK1 West (was 10Y1001A1001A65H - combined, need to handle DK2 separately)
    "Finland": "10YFI-1--------U",
    "Greece": "10YGR-HTSO-----Y",
    "Hungary": "10YHU-MAVIR----U",
    "Ireland": "10YIE-1001A00010",
    "Portugal": "10YPT-REN------W",
    "Romania": "10YRO-TEL------P",
    "Sweden": "10YSE-1--------K",
    "Slovakia": "10YSK-SEPS-----K",
    "Slovenia": "10YSI-ELES-----O",
}


def fetch_entsoe_day_ahead_prices(api_key: str, area_code: str, start_date: datetime, end_date: datetime, retry: int = 0, max_retries: int = 3) -> Tuple[List[float], Optional[str]]:
    """
    Fetch day-ahead electricity market prices from ENTSO-E with retry logic.
    
    Args:
        api_key: ENTSO-E API security token
        area_code: EIC area code (e.g., "10Y1001A1001A83F" for Germany)
        start_date: Start datetime (UTC)
        end_date: End datetime (UTC)
        retry: Current retry attempt
        max_retries: Maximum number of retries
    
    Returns:
        Tuple of (List of hourly prices in EUR/MWh, error message if failed)
    """
    url = "https://web-api.tp.entsoe.eu/api"
    
    params = {
        "securityToken": api_key,
        "documentType": "A44",  # Day-ahead prices
        "in_Domain": area_code,
        "out_Domain": area_code,
        "periodStart": start_date.strftime("%Y%m%d%H00"),
        "periodEnd": end_date.strftime("%Y%m%d%H00"),
    }
    
    try:
        response = requests.get(url, params=params, timeout=15)
        response.raise_for_status()
        
        # Parse XML response
        root = ET.fromstring(response.content)
        
        # Extract prices (EUR/MWh)
        prices = []
        ns = {'ns': 'urn:iec62325.351:tc57wg16:451-3:publicationdocument:7:3'}
        
        for timeseries in root.findall('.//ns:TimeSeries', ns):
            for point in timeseries.findall('.//ns:Point', ns):
                price_element = point.find('ns:price.amount', ns)
                if price_element is not None:
                    prices.append(float(price_element.text))
        
        if prices:
            return prices, None
        else:
            error_msg = "No price data in response"
            if retry < max_retries:
                print(f"🔄 Retry {retry + 1}/{max_retries}...", end=" ")
                time.sleep(2)  # Wait 2 seconds before retry
                return fetch_entsoe_day_ahead_prices(api_key, area_code, start_date, end_date, retry + 1, max_retries)
            return [], error_msg
    
    except requests.exceptions.Timeout as e:
        error_msg = f"Timeout ({e})"
        if retry < max_retries:
            print(f"🔄 Retry {retry + 1}/{max_retries}...", end=" ")
            time.sleep(2)
            return fetch_entsoe_day_ahead_prices(api_key, area_code, start_date, end_date, retry + 1, max_retries)
        return [], error_msg
    
    except Exception as e:
        error_msg = str(e)
        if retry < max_retries:
            print(f"🔄 Retry {retry + 1}/{max_retries}...", end=" ")
            time.sleep(2)
            return fetch_entsoe_day_ahead_prices(api_key, area_code, start_date, end_date, retry + 1, max_retries)
        return [], error_msg


def calculate_industrial_price(day_ahead_prices: List[float]) -> float:
    """
    Calculate industrial electricity price from day-ahead market prices.
    
    Industrial price = Average day-ahead price + Network fees + Taxes
    Typical markup: ~40% for industrial consumers (network, distribution, taxes)
    
    Args:
        day_ahead_prices: Hourly prices in EUR/MWh
    
    Returns:
        Industrial price in EUR/kWh
    """
    if not day_ahead_prices:
        return None
    
    # Average day-ahead price (EUR/MWh)
    avg_market_price = sum(day_ahead_prices) / len(day_ahead_prices)
    
    # Convert to EUR/kWh
    market_price_kwh = avg_market_price / 1000
    
    # Add typical industrial markup (40%: network fees, distribution, taxes)
    # Source: Eurostat industrial electricity price structure 2024
    industrial_price = market_price_kwh * 1.40
    
    return round(industrial_price, 4)


def load_previous_cache(cache_path: Path) -> Dict:
    """Load previous cache for fallback prices."""
    try:
        if cache_path.exists():
            with open(cache_path, 'r') as f:
                return json.load(f)
    except Exception as e:
        print(f"⚠️  Could not load previous cache: {e}")
    return {"prices": []}


def get_fallback_price(region: str, previous_cache: Dict) -> Optional[Dict]:
    """Get fallback price from previous cache or OECD estimates."""
    # Try previous cache first
    for price_data in previous_cache.get("prices", []):
        if price_data.get("region_code") == region or price_data.get("country") == region:
            fallback = price_data.copy()
            fallback["fallback_reason"] = "Using cached price from previous update"
            fallback["is_fallback"] = True
            return fallback
    
    # OECD fallback estimates (2024 Q3 industrial prices)
    oecd_estimates = {
        "Germany": 0.1520,
        "France": 0.1150,
        "Italy": 0.1890,
        "Spain": 0.1240,
        "Netherlands": 0.1450,
        "Poland": 0.1680,
        "Belgium": 0.1380,
        "Austria": 0.1520,
        "Czech Republic": 0.1580,
        "Denmark": 0.0920,
        "Finland": 0.0880,
        "Greece": 0.1650,
        "Hungary": 0.1720,
        "Ireland": 0.1580,
        "Portugal": 0.1320,
        "Romania": 0.1790,
        "Sweden": 0.0780,
        "Slovakia": 0.1610,
        "Slovenia": 0.1680,
    }
    
    if region in oecd_estimates:
        price_eur = oecd_estimates[region]
        return {
            "price_eur_kwh": price_eur,
            "price_usd_kwh": round(price_eur * 1.08, 4),
            "source": "OECD Energy Prices Database (2024 Q3 estimate)",
            "period": "2024 Q3",
            "is_fallback": True,
            "fallback_reason": "ENTSO-E API unavailable, using OECD estimate"
        }
    
    return None


def fetch_all_eu_prices(api_key: str, cache_path: Path) -> Dict[str, Dict]:
    """
    Fetch electricity prices for all EU regions with retry and fallback logic.
    
    Returns:
        {region_name: {price_eur_kwh, price_usd_kwh, source, period, is_fallback?, fallback_reason?}}
    """
    results = {}
    
    # Load previous cache for fallback
    previous_cache = load_previous_cache(cache_path)
    
    # Get last 7 days of data for average
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=7)
    
    print(f"📊 Fetching ENTSO-E prices ({start_date.date()} to {end_date.date()})...\n")
    
    failed_regions = []
    
    for region, area_code in ENTSO_AREAS.items():
        print(f"   Fetching {region:20s} ({area_code})...", end=" ")
        
        prices, error = fetch_entsoe_day_ahead_prices(api_key, area_code, start_date, end_date)
        
        if prices:
            industrial_price = calculate_industrial_price(prices)
            
            if industrial_price:
                # Convert EUR to USD (approximate rate: 1 EUR = 1.08 USD)
                price_usd = industrial_price * 1.08
                
                results[region] = {
                    "price_eur_kwh": industrial_price,
                    "price_usd_kwh": round(price_usd, 4),
                    "source": "ENTSO-E Transparency Platform Day-Ahead Prices",
                    "period": f"{start_date.date()} to {end_date.date()}",
                    "market_price_eur_mwh": round(sum(prices) / len(prices), 2),
                    "data_points": len(prices),
                    "is_fallback": False
                }
                print(f"✅ €{industrial_price:.4f}/kWh")
            else:
                print(f"⚠️  No valid price", end=" ")
                fallback = get_fallback_price(region, previous_cache)
                if fallback:
                    results[region] = fallback
                    print(f"→ Using fallback: €{fallback['price_eur_kwh']:.4f}/kWh")
                    failed_regions.append(region)
                else:
                    print(f"→ No fallback available")
                    failed_regions.append(region)
        else:
            print(f"❌ Failed ({error})", end=" ")
            fallback = get_fallback_price(region, previous_cache)
            if fallback:
                results[region] = fallback
                print(f"→ Using fallback: €{fallback['price_eur_kwh']:.4f}/kWh")
                failed_regions.append(region)
            else:
                print(f"→ No fallback available")
                failed_regions.append(region)
    
    # Summary
    if failed_regions:
        print(f"\n⚠️  {len(failed_regions)} regions used fallback data: {', '.join(failed_regions)}")
    
    return results


def update_energy_cache(api_key: str, output_path: Path = None):
    """
    Fetch latest prices and update cache file.
    
    Args:
        api_key: ENTSO-E API security token
        output_path: Path to energy_prices_live.json (default: backend/data/cache/)
    """
    if not output_path:
        output_path = Path(__file__).parent.parent / "data" / "cache" / "energy_prices_live.json"
    
    # Ensure cache directory exists
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Fetch EU prices with retry and fallback
    eu_prices = fetch_all_eu_prices(api_key, output_path)
    
    # Build output structure
    cache_data = {
        "metadata": {
            "last_update": datetime.now().isoformat(),
            "source": "ENTSO-E Transparency Platform API",
            "api_url": "https://transparency.entsoe.eu/",
            "ttl_hours": 24,
            "regions_covered": len(eu_prices)
        },
        "prices": []
    }
    
    # Add EU prices
    for region, data in eu_prices.items():
        cache_data["prices"].append({
            "region_code": region,
            "country": region,
            **data
        })
    
    # Write to file
    with open(output_path, 'w') as f:
        json.dump(cache_data, f, indent=2)
    
    print(f"\n✅ Cache updated: {output_path}")
    print(f"   Regions: {len(eu_prices)}")
    print(f"   Last update: {cache_data['metadata']['last_update']}")


if __name__ == "__main__":
    # Load API key from environment
    api_key = os.getenv("ENTSOE_API_KEY")
    
    if not api_key:
        print("❌ ENTSOE_API_KEY not found in environment")
        print("   Set it with: export ENTSOE_API_KEY=your-token-here")
        exit(1)
    
    print("🔌 ENTSO-E Energy Price Fetcher")
    print("=" * 80)
    print(f"API Key: {api_key[:10]}...{api_key[-4:]}")
    print()
    
    # Update cache
    update_energy_cache(api_key)
    
    print("\n✅ Energy prices updated successfully!")
    print("   Backend will automatically use these prices on next restart.")
