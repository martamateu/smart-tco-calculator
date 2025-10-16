"""
Data access layer - provides static material and region catalogs.
Loads REAL data from:
- Mendeley Global Electricity Dataset (DOI: 10.17632/s54n4tyyz4.3)
- Materials Project API (semiconductors_comprehensive.json)
- ENTSO-E live energy prices (energy_prices_live.json)
"""

from typing import List, Dict, Optional, Any
import json
from pathlib import Path
from datetime import datetime, timedelta
from backend.models.schemas import Material, Region
import logging

logger = logging.getLogger(__name__)


# ============================================================================
# LOAD REAL ENERGY PRICES FROM CACHE
# ============================================================================

def check_energy_prices_availability() -> Dict[str, Any]:
    """
    Check if energy prices are available and fresh.
    Checks both ENTSO-E and EIA caches.
    
    Returns:
        Dict with status, age_hours, last_update, and is_expired
    """
    entsoe_cache_path = Path(__file__).parent.parent / "data" / "cache" / "energy_prices_live.json"
    eia_cache_path = Path(__file__).parent.parent / "data" / "eia_prices_cache.json"
    
    # Check both caches and use the freshest one
    caches = []
    
    # Check ENTSO-E cache
    if entsoe_cache_path.exists():
        try:
            with open(entsoe_cache_path, 'r') as f:
                data = json.load(f)
            last_update = datetime.fromisoformat(data['metadata']['last_update'])
            age_hours = (datetime.now() - last_update).total_seconds() / 3600
            caches.append({
                'source': 'ENTSO-E',
                'age_hours': age_hours,
                'last_update': data['metadata']['last_update'],
                'is_expired': age_hours > 24
            })
        except Exception:
            pass
    
    # Check EIA cache
    if eia_cache_path.exists():
        try:
            with open(eia_cache_path, 'r') as f:
                data = json.load(f)
            last_update = datetime.fromisoformat(data['last_updated'])
            age_hours = (datetime.now() - last_update).total_seconds() / 3600
            caches.append({
                'source': 'EIA',
                'age_hours': age_hours,
                'last_update': data['last_updated'],
                'is_expired': age_hours > 24
            })
        except Exception:
            pass
    
    if not caches:
        return {
            "status": "missing",
            "is_expired": True,
            "age_hours": None,
            "last_update": None,
            "message": "Energy prices cache not found"
        }
    
    # Use the freshest cache for status reporting
    freshest = min(caches, key=lambda x: x['age_hours'])
    
    return {
        "status": "expired" if freshest['is_expired'] else "healthy",
        "is_expired": freshest['is_expired'],
        "age_hours": round(freshest['age_hours'], 1),
        "last_update": freshest['last_update'],
        "source": freshest['source'],
        "message": f"Energy prices ({freshest['source']}) are {freshest['age_hours']:.1f}h old" if freshest['is_expired'] else f"Energy prices ({freshest['source']}) are up to date"
    }


def _load_energy_prices_cache() -> Dict[str, Dict]:
    """
    Load REAL energy prices from API cache (EIA, Eurostat, etc.)
    Returns: {region_code: {price_eur_kwh, price_usd_kwh, source, period}}
    """
    cache_path = Path(__file__).parent.parent / "data" / "cache" / "energy_prices_live.json"
    
    if not cache_path.exists():
        print("⚠️  Energy prices cache not found - using fallback prices")
        return {}
    
    try:
        with open(cache_path, 'r') as f:
            data = json.load(f)
        
        # Check cache age (TTL 24 hours)
        last_update = datetime.fromisoformat(data['metadata']['last_update'])
        age_hours = (datetime.now() - last_update).total_seconds() / 3600
        
        if age_hours > 24:
            print(f"⚠️  Energy prices cache expired ({age_hours:.1f}h old) - consider refreshing")
        
        # Build lookup dict by region_code
        prices_by_region = {}
        for entry in data['prices']:
            key = entry.get('region_code') or entry.get('country')
            prices_by_region[key] = {
                'price_eur_kwh': entry['price_eur_kwh'],
                'price_usd_kwh': entry['price_usd_kwh'],
                'source': entry['source'],
                'period': entry.get('period', 'unknown'),
                'is_fallback': entry.get('is_fallback', False),
                'fallback_reason': entry.get('fallback_reason', None)
            }
        
        print(f"✅ Loaded {len(prices_by_region)} energy prices from cache (age: {age_hours:.1f}h)")
        return prices_by_region
        
    except Exception as e:
        print(f"❌ Error loading energy prices cache: {e}")
        return {}


# ============================================================================
# LOAD MENDELEY GLOBAL ELECTRICITY DATA
# ============================================================================

def _load_mendeley_regions() -> List[dict]:
    """
    Load regions from Mendeley Global Electricity Dataset
    DOI: 10.17632/s54n4tyyz4.3
    Returns: List of region dictionaries with real data
    """
    mendeley_path = Path(__file__).parent.parent / "data" / "global_electricity_data_2025.json"
    
    if not mendeley_path.exists():
        logger.warning("⚠️  Mendeley dataset not found, using hardcoded fallback")
        return []
    
    try:
        with open(mendeley_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Country to flag emoji mapping
        FLAG_MAP = {
            'Poland': '🇵🇱', 'Germany': '🇩🇪', 'France': '🇫🇷', 'Italy': '🇮🇹',
            'Spain': '🇪🇸', 'Netherlands': '🇳🇱', 'Sweden': '🇸🇪', 'Belgium': '🇧🇪',
            'Denmark': '🇩🇰',
            'Taiwan': '🇹🇼', 'South Korea': '🇰🇷', 'United States': '🇺🇸',
            'China': '🇨🇳', 'Japan': '🇯🇵',
            'California': '🌴', 'Texas': '🤠', 'Arizona': '🌵', 
            'Ohio': '🏭', 'New York': '🗽'
        }
        
        regions = []
        mendeley_period = data.get('period', '12-month average')
        mendeley_last_updated = data.get('last_updated', '2025-10-14')
        mendeley_version = data.get('version', '3')
        
        for region_data in data.get('regions', []):
            country = region_data['country']
            flag = FLAG_MAP.get(country, '🌍')
            
            # Convert Mendeley format to our Region schema
            region = {
                "code": country,
                "name": f"{flag} {country}",
                "energy_cost": region_data['price_eur_kwh'],
                "carbon_tax": region_data.get('carbon_tax_eur_ton', 0.0),
                "subsidy_rate": region_data.get('subsidy_rate', 0.0),
                "subsidy_source": region_data.get('data_source', 'Mendeley Data'),
                "chips_act_eligible": region_data.get('subsidy_rate', 0) > 0,
                "mendeley_data": region_data,  # Keep original for reference
                # Add Mendeley dataset metadata (for static data display)
                "energy_source": f"Mendeley Dataset v{mendeley_version} (DOI: 10.17632/s54n4tyyz4.3)",
                "energy_data_period": mendeley_period,
                "energy_data_last_updated": mendeley_last_updated,
                "is_static_data": True
            }
            regions.append(region)
        
        logger.info(f"✅ Loaded {len(regions)} regions from Mendeley dataset (DOI: {data.get('doi')})")
        return regions
        
    except Exception as e:
        logger.error(f"❌ Error loading Mendeley dataset: {e}")
        return []


def _update_regions_with_entsoe(regions: List[dict]) -> List[dict]:
    """
    Update EU region prices with live ENTSO-E data if available
    
    Args:
        regions: List of region dicts from Mendeley
    
    Returns:
        Updated regions with live EU prices where available
    """
    # EU countries covered by ENTSO-E
    EU_COUNTRIES = ['Germany', 'France', 'Italy', 'Spain', 'Netherlands', 
                   'Poland', 'Belgium', 'Sweden', 'Austria', 'Denmark',
                   'Finland', 'Greece', 'Hungary', 'Ireland', 'Portugal',
                   'Romania', 'Czech Republic', 'Slovakia', 'Slovenia']
    
    # Load ENTSO-E cache
    entsoe_prices = _load_energy_prices_cache()
    
    if not entsoe_prices:
        logger.info("ℹ️  No ENTSO-E cache available, using Mendeley prices only")
        return regions
    
    updated_count = 0
    for region in regions:
        if region['code'] in EU_COUNTRIES and region['code'] in entsoe_prices:
            old_price = region['energy_cost']
            new_price = entsoe_prices[region['code']]['price_eur_kwh']
            entsoe_country_data = entsoe_prices[region['code']]
            
            # Use the actual source from the cache (respects fallback sources)
            actual_source = entsoe_country_data.get('source', 'ENTSO-E Transparency Platform')
            is_fallback = entsoe_country_data.get('is_fallback', False)
            period = entsoe_country_data.get('period', 'Last 7 days')
            
            if abs(old_price - new_price) > 0.001:  # Only log if changed
                change_pct = ((new_price - old_price) / old_price) * 100
                logger.info(f"  🔄 {region['code']:<15} €{old_price:.4f} → €{new_price:.4f} ({change_pct:+.1f}%)")
                region['energy_cost'] = new_price
                region['live_price_updated'] = True
                region['energy_source'] = actual_source
                region['is_fallback'] = is_fallback
                region['is_static_data'] = is_fallback  # Fallback = static data
                region['energy_data_period'] = period
                updated_count += 1
            else:
                # Even if price didn't change, update the source info
                region['energy_source'] = actual_source
                region['is_fallback'] = is_fallback
                region['is_static_data'] = is_fallback  # Fallback = static data
                region['energy_data_period'] = period
    
    if updated_count > 0:
        logger.info(f"✅ Updated {updated_count}/{len(regions)} regions with live energy prices")
    
    return regions


def _update_regions_with_eia(regions: List[dict]) -> List[dict]:
    """
    Update USA state prices with live EIA data if available
    
    Args:
        regions: List of region dicts from Mendeley
    
    Returns:
        Updated regions with live USA state prices where available
    """
    # USA states covered by EIA
    USA_STATES = ['California', 'Texas', 'Arizona', 'Ohio', 'New York']
    
    # Load EIA cache
    eia_cache_path = Path(__file__).parent.parent / "data" / "eia_prices_cache.json"
    
    if not eia_cache_path.exists():
        logger.info("ℹ️  No EIA cache available, using Mendeley prices only")
        return regions
    
    try:
        with open(eia_cache_path, 'r', encoding='utf-8') as f:
            eia_cache = json.load(f)
        
        eia_prices = eia_cache.get('prices', {})
        if not eia_prices:
            logger.info("ℹ️  EIA cache empty")
            return regions
        
        updated_count = 0
        eia_period = eia_cache.get('data_period', '12-month rolling average')
        
        for region in regions:
            if region['code'] in USA_STATES and region['code'] in eia_prices:
                old_price = region['energy_cost']
                new_price = eia_prices[region['code']]['price_eur_kwh']
                eia_state_data = eia_prices[region['code']]
                
                if abs(old_price - new_price) > 0.001:  # Only log if changed
                    change_pct = ((new_price - old_price) / old_price) * 100
                    logger.info(f"  🔄 {region['code']:<15} €{old_price:.4f} → €{new_price:.4f} ({change_pct:+.1f}%)")
                    region['energy_cost'] = new_price
                    region['live_price_updated'] = True
                    region['energy_source'] = f"EIA Retail Sales API ({eia_state_data['state_id']}, Industrial Sector)"
                    region['energy_data_age'] = eia_cache.get('last_updated', 'Unknown')
                    region['energy_data_period'] = eia_period
                    region['is_static_data'] = False  # EIA is live data
                    region['is_fallback'] = False
                    updated_count += 1
                else:
                    # Even if price didn't change, update the source info
                    region['energy_source'] = f"EIA Retail Sales API ({eia_state_data['state_id']}, Industrial Sector)"
                    region['energy_data_age'] = eia_cache.get('last_updated', 'Unknown')
                    region['energy_data_period'] = eia_period
                    region['is_static_data'] = False  # EIA is live data
                    region['is_fallback'] = False
        
        if updated_count > 0:
            logger.info(f"✅ Updated {updated_count}/{len(regions)} USA states with live EIA prices")
        
        return regions
        
    except Exception as e:
        logger.error(f"❌ Error loading EIA cache: {e}")
        return regions


# ============================================================================
# LOAD REAL MATERIALS DATA
# ============================================================================

def _load_materials_from_json() -> List[dict]:
    """Load real semiconductor data from Materials Project JSON (FAST)"""
    json_path = Path(__file__).parent.parent / "data" / "semiconductors_comprehensive.json"
    
    if not json_path.exists():
        # Fallback to basic materials if comprehensive data not available
        return _get_fallback_materials()
    
    with open(json_path, 'r') as f:
        data = json.load(f)
    
    materials = []
    for row in data:
        # Map JSON fields to API schema
        materials.append({
            "id": row["id"],
            "name": row["name"],
            "category": row["category"],
            "chip_cost": float(row["chip_cost_eur"]),
            "energy_consumption": float(row["energy_consumption_w"]),
            "carbon_footprint": float(row["carbon_footprint_kg"]),
            "trl": int(row["trl"]),
            "maturity": "Commercial" if row["trl"] >= 8 else ("Pilot" if row["trl"] >= 6 else "Lab"),
            "manufacturers": _get_manufacturers(row["id"]),
            "applications": _get_applications(row["category"]),
            "band_gap": float(row.get("band_gap_ev", 1.0)),  # For ML model
            "density": float(row.get("density_g_cm3", 4.0))  # For ML model
        })
    
    return materials


def _get_manufacturers(material_id: str) -> List[str]:
    """Get typical manufacturers for each material"""
    mfg_map = {
        "si": ["Intel", "TSMC", "Samsung", "GlobalFoundries"],
        "sic": ["Wolfspeed", "STMicroelectronics", "Infineon", "ON Semiconductor"],
        "gan": ["GaN Systems", "Infineon", "Navitas", "EPC"],
        "gaas": ["Skyworks", "Qorvo", "Broadcom"],
        "inp": ["IQE", "Sumitomo"],
        "ge": ["AXT", "Umicore"],
        "c": ["Element Six", "Applied Diamond"],
        "aln": ["Kyocera", "CoorsTek"],
        "zno": ["American Elements", "Cermet"],
        "cdte": ["First Solar", "Hanergy"],
    }
    return mfg_map.get(material_id, ["Research Stage"])


def _get_applications(category: str) -> List[str]:
    """Get typical applications by category"""
    app_map = {
        "Traditional Semiconductor": ["CPUs", "Memory", "General logic", "Consumer electronics"],
        "Wide-bandgap Semiconductor": ["EV inverters", "Power supplies", "Solar inverters", "Industrial motors"],
        "III-V Compound": ["RF amplifiers", "LEDs", "Solar cells", "High-speed comm"],
        "III-Nitride Wide-bandgap": ["Fast chargers", "5G base stations", "Data centers", "Aerospace"],
        "II-VI Compound": ["LEDs", "Photodetectors", "Solar cells", "Lasers"],
        "2D Transition Metal Dichalcogenide": ["Flexible electronics", "Sensors", "Transistors", "Research"],
        "Ultra-wide Bandgap": ["Extreme environments", "High power", "High temperature", "Research"]
    }
    return app_map.get(category, ["Emerging applications", "Research"])


def _get_fallback_materials() -> List[dict]:
    """Fallback materials if CSV not available"""
    return [
    {
        "id": "si",
        "name": "Si (Silicon)",
        "category": "Traditional Semiconductor",
        "chip_cost": 0.50,
        "energy_consumption": 5.0,
        "carbon_footprint": 0.25,
        "trl": 9,
        "maturity": "Commercial",
        "manufacturers": ["Intel", "TSMC", "Samsung", "GlobalFoundries"],
        "applications": ["CPUs", "Memory", "General logic", "Consumer electronics"]
    },
    {
        "id": "sic",
        "name": "SiC (Silicon Carbide)",
        "category": "Wide-bandgap Semiconductor",
        "chip_cost": 0.80,
        "energy_consumption": 2.5,
        "carbon_footprint": 0.08,
        "trl": 9,
        "maturity": "Commercial",
        "manufacturers": ["Wolfspeed", "STMicroelectronics", "Infineon", "ON Semiconductor"],
        "applications": ["EV inverters", "Power supplies", "Solar inverters", "Industrial motors"]
    },
    {
        "id": "gan",
        "name": "GaN (Gallium Nitride)",
        "category": "Wide-bandgap Semiconductor",
        "chip_cost": 1.20,
        "energy_consumption": 2.0,
        "carbon_footprint": 0.06,
        "trl": 8,
        "maturity": "Commercial",
        "manufacturers": ["GaN Systems", "Infineon", "Navitas", "EPC"],
        "applications": ["Fast chargers", "5G base stations", "Data centers", "Aerospace"]
    },
    {
        "id": "gaas",
        "name": "GaAs (Gallium Arsenide)",
        "category": "III-V Semiconductor",
        "chip_cost": 1.50,
        "energy_consumption": 3.5,
        "carbon_footprint": 0.12,
        "trl": 9,
        "maturity": "Commercial",
        "manufacturers": ["Skyworks", "Qorvo", "Broadcom"],
        "applications": ["RF components", "Satellite", "Optical devices", "Mobile phones"]
    },
    {
        "id": "igzo",
        "name": "IGZO (Indium Gallium Zinc Oxide)",
        "category": "Oxide Semiconductor",
        "chip_cost": 0.70,
        "energy_consumption": 0.5,
        "carbon_footprint": 0.05,
        "trl": 8,
        "maturity": "Commercial",
        "manufacturers": ["Sharp", "LG Display", "Samsung Display"],
        "applications": ["Display backplanes", "Wearables", "IoT sensors", "Low-power logic"]
    },
    {
        "id": "cnt",
        "name": "CNT-FET (Carbon Nanotube Transistor)",
        "category": "Emerging Nanomaterial",
        "chip_cost": 3.00,
        "energy_consumption": 0.3,
        "carbon_footprint": 0.02,
        "trl": 6,
        "maturity": "Prototype",
        "manufacturers": ["IBM Research", "MIT", "Stanford"],
        "applications": ["Ultra-low power IoT", "Flexible electronics", "Research"]
    },
    {
        "id": "mos2",
        "name": "MoS₂ (Molybdenum Disulfide)",
        "category": "2D Material",
        "chip_cost": 2.50,
        "energy_consumption": 0.4,
        "carbon_footprint": 0.03,
        "trl": 4,
        "maturity": "Laboratory",
        "manufacturers": ["Research institutions"],
        "applications": ["Flexible electronics", "Photodetectors", "Future computing"]
    }
]


# ============================================================================
# REGIONS CATALOG
# ============================================================================

# Load regions dynamically from Mendeley dataset + ENTSO-E + EIA live prices
# This replaces the old 32-region hardcoded array with validated data
REGIONS_DB = _update_regions_with_eia(_update_regions_with_entsoe(_load_mendeley_regions()))


# ============================================================================
# UPDATE REGIONS WITH LIVE ENERGY PRICES
# ============================================================================

def _update_regions_with_live_prices(regions: List[dict]) -> List[dict]:
    """
    Update region energy costs with REAL prices from API cache
    Falls back to original prices if cache unavailable
    """
    live_prices = _load_energy_prices_cache()
    
    if not live_prices:
        return regions  # Use original fallback prices
    
    # Region code mapping (ENTSO-E uses full country names, we use codes)
    code_to_country = {
        'Germany': ['Germany', 'DE'],
        'France': ['France', 'FR'], 
        'Italy': ['Italy', 'IT'],
        'Spain': ['Spain', 'ES'],
        'Netherlands': ['Netherlands', 'NL'],
        'Poland': ['Poland', 'PL'],
        'Belgium': ['Belgium', 'BE'],
        'Austria': ['Austria', 'AT'],
        'Czech Republic': ['Czech Republic', 'CZ'],
        'Finland': ['Finland', 'FI'],
        'Greece': ['Greece', 'GR'],
        'Hungary': ['Hungary', 'HU'],
        'Portugal': ['Portugal', 'PT'],
        'Romania': ['Romania', 'RO'],
        'Slovakia': ['Slovakia', 'SK'],
        'Slovenia': ['Slovenia', 'SI'],
        # Non-EU regions keep original
        'Arizona': ['Arizona', 'AZ'],
        'Texas': ['Texas', 'TX'],
        'Ohio': ['Ohio', 'OH'],
        'New York': ['New York', 'NY'],
        'Taiwan': ['Taiwan', 'TW'],
        'South Korea': ['South Korea', 'KR'],
        'China': ['China', 'CN'],
        'Japan': ['Japan', 'JP'],
        'Singapore': ['Singapore', 'SG'],
        'India': ['India', 'IN']
    }
    
    updated = 0
    for region in regions:
        region_code = region['code']
        
        # Try to find matching price from cache
        matched_price = None
        if region_code in code_to_country:
            # Check all possible names for this region
            for name in code_to_country[region_code]:
                if name in live_prices:
                    matched_price = live_prices[name]
                    break
        
        if matched_price:
            old_price = region['energy_cost']
            new_price = matched_price['price_eur_kwh']
            region['energy_cost'] = new_price
            region['energy_source'] = matched_price['source']
            region['energy_period'] = matched_price.get('period', 'N/A')
            region['is_fallback'] = matched_price.get('is_fallback', False)
            region['fallback_reason'] = matched_price.get('fallback_reason', None)
            
            diff_pct = ((new_price - old_price) / old_price * 100) if old_price > 0 else 0
            if abs(diff_pct) > 5:  # Log significant changes
                fallback_indicator = " [FALLBACK]" if region['is_fallback'] else ""
                print(f"  🔄 {region_code:15s} €{old_price:.4f} → €{new_price:.4f} ({diff_pct:+.1f}%){fallback_indicator}")
            
            updated += 1
    
    if updated > 0:
        print(f"✅ Updated {updated}/{len(regions)} regions with live energy prices")
    
    return regions


# ============================================================================
# ACCESS FUNCTIONS
# ============================================================================

def get_materials_catalog() -> List[Material]:
    """Get all available materials from real Materials Project data"""
    materials_data = _load_materials_from_json()
    return [Material(**m) for m in materials_data]


def get_regions_catalog() -> List[Region]:
    """Get all available regions with LIVE energy prices from API cache"""
    regions_with_live_prices = _update_regions_with_live_prices(REGIONS_DB)
    return [Region(**r) for r in regions_with_live_prices]


def get_material_by_id(material_id: str) -> Material:
    """Get a specific material by ID"""
    materials = get_materials_catalog()
    material = next((m for m in materials if m.id == material_id), None)
    
    if not material:
        raise ValueError(f"Material '{material_id}' not found")
    
    return material


def get_region_by_code(region_code: str) -> Region:
    """Get a specific region by code"""
    regions = get_regions_catalog()
    region = next((r for r in regions if r.code == region_code), None)
    
    if not region:
        raise ValueError(f"Region '{region_code}' not found")
    
    return region
