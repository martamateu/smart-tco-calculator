"""
Extract USA Industrial Electricity Prices from Day-Ahead ISO Market Data
Maps ISO regions to states: CAISO→Arizona, ERCOT→Texas, NYISO→New York, PJM→Ohio
"""

import pandas as pd
from pathlib import Path
from datetime import datetime, timedelta
import numpy as np

# ISO to State mapping for TCO calculator regions
ISO_TO_STATE = {
    'CAISO': 'Arizona',      # CAISO covers California + parts of Arizona (TSMC fab)
    'ERCOT': 'Texas',        # Texas grid (Samsung fab)
    'NYISO': 'New York',     # New York state (Micron fab)
    'PJM': 'Ohio',           # PJM covers Ohio (Intel fab) + 12 other states
}

# Conversion factor wholesale to industrial (USA competitive markets)
USA_CONVERSION_FACTOR = 1.40  # Lower than EU due to competitive markets

# Carbon intensity by state (g CO2/kWh) - 2024 data
CARBON_INTENSITY = {
    'Arizona': 352,   # Mix of gas + coal + solar
    'Texas': 421,     # Heavy gas + wind
    'New York': 253,  # Gas + nuclear + hydro
    'Ohio': 612,      # Coal-heavy state
}

def extract_usa_prices(base_dir: Path):
    """Extract latest 12-month average from USA ISO data"""
    
    results = []
    cutoff_date = datetime.now() - timedelta(days=365)  # 12 months ago
    
    usa_dir = base_dir / "USA"
    if not usa_dir.exists():
        print(f"❌ USA directory not found: {usa_dir}")
        return pd.DataFrame()
    
    # Process each ISO
    for iso_name, state_name in ISO_TO_STATE.items():
        iso_dir = usa_dir / iso_name
        
        if not iso_dir.exists():
            print(f"⚠️  {iso_name} directory not found")
            continue
        
        # Get CSV files for 2024-2025
        csv_files = sorted(iso_dir.glob("USA_*.csv"))
        recent_files = [f for f in csv_files if '2024' in f.name or '2025' in f.name]
        
        if not recent_files:
            print(f"⚠️  No recent data for {iso_name}")
            continue
        
        try:
            # Read and concatenate
            df_list = []
            for file in recent_files:
                try:
                    df = pd.read_csv(file)
                    df_list.append(df)
                except Exception as e:
                    print(f"  ⚠️  Error reading {file.name}: {e}")
            
            if not df_list:
                continue
            
            df = pd.concat(df_list, ignore_index=True)
            
            # Parse timestamp
            df['Timestamp'] = pd.to_datetime(df['Timestamp'])
            
            # Filter to last 12 months
            df = df[df['Timestamp'] >= cutoff_date]
            
            if df.empty:
                print(f"⚠️  No recent data (last 12 months) for {iso_name}")
                continue
            
            # Get price columns (exclude Timestamp)
            price_cols = [col for col in df.columns if col != 'Timestamp']
            
            if not price_cols:
                print(f"⚠️  No price columns found for {iso_name}")
                continue
            
            # Calculate average across all zones, handling NaN and zeros
            prices_df = df[price_cols].replace(0, np.nan)
            avg_price = prices_df.mean().mean()  # Average of all zones and times
            
            if pd.isna(avg_price):
                print(f"⚠️  No valid prices for {iso_name}")
                continue
            
            results.append({
                'iso': iso_name,
                'state': state_name,
                'wholesale_usd_mwh': avg_price,
                'data_points': len(df),
                'zones': len(price_cols),
                'start_date': df['Timestamp'].min(),
                'end_date': df['Timestamp'].max()
            })
            
            print(f"✅ {iso_name:10} → {state_name:12} Wholesale: ${avg_price:7.2f}/MWh | "
                  f"{len(df):6} points | {len(price_cols)} zones")
            
        except Exception as e:
            print(f"❌ Error processing {iso_name}: {e}")
    
    return pd.DataFrame(results)

def convert_to_industrial(df):
    """Convert wholesale USD/MWh to industrial EUR/kWh"""
    
    # Currency conversion USD to EUR (Oct 2025 rate)
    USD_TO_EUR = 0.92
    
    # Convert to EUR/kWh industrial
    df['industrial_eur_kwh'] = (df['wholesale_usd_mwh'] * USD_TO_EUR / 1000) * USA_CONVERSION_FACTOR
    
    # Add carbon intensity
    df['carbon_intensity'] = df['state'].map(CARBON_INTENSITY)
    
    return df

def main():
    base_dir = Path(__file__).parent / "data" / "Day-Ahead_Electricity_Price_Data"
    
    if not base_dir.exists():
        print(f"❌ Directory not found: {base_dir}")
        return
    
    print("=" * 80)
    print("🇺🇸 USA ELECTRICITY PRICE EXTRACTION")
    print("=" * 80)
    print(f"📁 Source: {base_dir / 'USA'}")
    print(f"📅 Period: Last 12 months (Oct 2024 - Sep 2025)")
    print(f"🔄 Conversion: Wholesale (USD/MWh) × {USA_CONVERSION_FACTOR} → Industrial (EUR/kWh)")
    print()
    
    # Extract wholesale prices
    print("📊 Extracting USA ISO data...")
    print("-" * 80)
    df = extract_usa_prices(base_dir)
    
    if df.empty:
        print("❌ No USA data extracted")
        return
    
    print()
    print("=" * 80)
    print("🏭 Converting to industrial prices...")
    print("-" * 80)
    df = convert_to_industrial(df)
    
    # Prepare output
    output_df = df[[
        'state', 'industrial_eur_kwh', 'carbon_intensity',
        'wholesale_usd_mwh', 'iso', 'zones',
        'start_date', 'end_date', 'data_points'
    ]].copy()
    
    output_df = output_df.rename(columns={
        'state': 'region',
        'industrial_eur_kwh': 'electricity_eur_per_kwh',
        'carbon_intensity': 'carbon_intensity_g_per_kwh'
    })
    
    # Add metadata
    output_df['year'] = 2025
    output_df['source'] = 'USA ISO Day-Ahead Market Data (12-month avg Oct 2024-Sep 2025)'
    output_df['last_verified'] = datetime.now().strftime('%Y-%m-%d')
    output_df['data_quality'] = 'high'
    
    # Save to CSV
    output_file = Path(__file__).parent / "data" / "usa_industrial_electricity_2025.csv"
    output_df.to_csv(output_file, index=False)
    
    print()
    print("=" * 80)
    print("📊 PRECIOS INDUSTRIALES USA (12-month avg):")
    print("=" * 80)
    print()
    
    sorted_df = output_df.sort_values('electricity_eur_per_kwh')
    
    for _, row in sorted_df.iterrows():
        print(f"🇺🇸 {row['region']:12} €{row['electricity_eur_per_kwh']:.4f}/kWh  "
              f"(CO₂: {row['carbon_intensity_g_per_kwh']:.0f} g/kWh) - ISO: {row['iso']}")
    
    print()
    print(f"✅ Archivo generado: {output_file}")
    print(f"✅ Total estados USA: {len(output_df)}")
    print()
    
    # Compare with EIA 2024 values
    print("=" * 80)
    print("📊 COMPARACIÓN CON EIA 2024:")
    print("=" * 80)
    print()
    print("Valores anteriores (EIA 2024): ~€0.08/kWh (todos los estados)")
    print()
    for _, row in sorted_df.iterrows():
        change = ((row['electricity_eur_per_kwh'] - 0.08) / 0.08) * 100
        print(f"  {row['region']:12} €0.08 → €{row['electricity_eur_per_kwh']:.4f} "
              f"({change:+.1f}%)")
    print()
    print("=" * 80)

if __name__ == "__main__":
    main()
