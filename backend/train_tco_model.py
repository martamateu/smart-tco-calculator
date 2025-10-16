#!/usr/bin/env python3
"""
Train Random Forest Regressor for TCO Prediction
Genera datos sintéticos basados en propiedades reales de semiconductores
y entrena un modelo ML para reemplazar las fórmulas simples
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error
import joblib
from pathlib import Path
import json

# Cargar materiales reales
def load_real_materials():
    json_path = Path(__file__).parent / "data" / "semiconductors_comprehensive.json"
    with open(json_path) as f:
        return json.load(f)

# Cargar precios reales de energía ENTSO-E 2024-2025
def load_real_energy_prices():
    json_path = Path(__file__).parent / "data" / "global_electricity_data_2025.json"
    with open(json_path) as f:
        data = json.load(f)
        # Extraer precios, carbon tax y carbon intensity de las regiones
        prices = []
        carbon_taxes = []
        carbon_intensities = []
        for region in data['regions']:
            prices.append(region['price_eur_kwh'])
            carbon_taxes.append(region['carbon_tax_eur_ton'])
            carbon_intensities.append(region['carbon_intensity_g_kwh'])
        return prices, carbon_taxes, carbon_intensities

# Generar datos sintéticos de entrenamiento
def generate_training_data(n_samples=10000):
    """
    Genera samples sintéticos basados en propiedades reales de semiconductores
    Features: band_gap, density, volume (log), years, energy_cost, carbon_tax, subsidy_rate, trl
    Target: total_cost_of_ownership
    """
    
    materials = load_real_materials()
    real_energy_prices, real_carbon_taxes, real_carbon_intensities = load_real_energy_prices()
    
    # Extraer rangos reales
    band_gaps = [m['band_gap_ev'] for m in materials]
    densities = [m['density_g_cm3'] for m in materials]
    trls = [m['trl'] for m in materials]
    base_costs = [m['chip_cost_eur'] for m in materials]
    
    data = []
    
    for _ in range(n_samples):
        # Sample material properties (basado en distribución real)
        band_gap = np.random.choice(band_gaps) + np.random.normal(0, 0.3)
        density = np.random.choice(densities) + np.random.normal(0, 0.5)
        trl = np.random.choice(trls)
        base_cost = np.random.choice(base_costs)
        
        # Production parameters
        volume = np.random.lognormal(11, 2)  # 10K - 1M chips (log-normal distribution)
        years = np.random.randint(1, 11)  # 1-10 years
        
        # Regional parameters (basado en datos reales Mendeley 2025)
        idx = np.random.randint(0, len(real_energy_prices))
        energy_cost = real_energy_prices[idx]  # EUR/kWh from Mendeley dataset
        carbon_tax = real_carbon_taxes[idx]  # EUR/ton from real data
        carbon_intensity = real_carbon_intensities[idx]  # g CO2/kWh from IEA
        subsidy_rate = np.random.choice([0.25, 0.30, 0.32, 0.33, 0.35, 0.38, 0.40])
        
        # ===== CALCULAR TCO USANDO FÓRMULAS REALISTAS Y BALANCEADAS =====
        
        # 1. Capital Costs (CAPEX) - Escalado logarítmico (economías de escala)
        unit_cost = base_cost * (1 + 0.04 * (9 - trl))
        # CAPEX escala log: duplicar volumen NO duplica CAPEX (shared equipment)
        capex_scale_factor = np.log10(volume + 1) * 80000
        material_cost = unit_cost * capex_scale_factor
        
        # 2. Operational Costs (OPEX) - Energy is DOMINANT (50-60% of TCO)
        # Realistic fab energy consumption per chip
        if band_gap > 3.0:  # Wide bandgap (SiC, GaN)
            energy_per_chip_kwh = 100  # kWh per chip
        elif band_gap > 2.0:  # Medium bandgap
            energy_per_chip_kwh = 200  # kWh per chip
        elif band_gap > 1.0:  # Silicon-like (7nm, 5nm)
            energy_per_chip_kwh = 300  # kWh per chip
        else:  # Narrow bandgap - 3nm, 2nm nodes
            energy_per_chip_kwh = 450  # kWh per chip
        
        # Energy scales with volume but with diminishing returns (efficiency)
        volume_efficiency = 1 - (0.15 * np.log10(max(1, volume / 50000)))
        volume_efficiency = max(0.7, min(1.0, volume_efficiency))
        energy_cost_total = energy_per_chip_kwh * volume * energy_cost * years * volume_efficiency
        
        # 3. Carbon Costs - Based on REAL grid carbon intensity
        carbon_emissions_kg = energy_per_chip_kwh * volume * (carbon_intensity / 1000.0) * years
        carbon_cost_total = carbon_emissions_kg * (carbon_tax / 1000.0)
        
        # 4. Subsidies - Applied to both CAPEX and first-year OPEX
        subsidy_amount = (material_cost * 0.6 + energy_cost_total * 0.2) * subsidy_rate
        
        # 5. Maintenance & Depreciation - Basados en OPEX no solo CAPEX
        total_fab_cost = material_cost + energy_cost_total
        maintenance_cost = total_fab_cost * 0.03 * years  # 3% anual de CAPEX+Energy
        depreciation = material_cost * (1 - np.exp(-0.15 * years))  # exponential decay
        
        # TOTAL COST OF OWNERSHIP
        tco = (material_cost + energy_cost_total + carbon_cost_total + 
               maintenance_cost + depreciation - subsidy_amount)
        
        # Agregar variabilidad realista (±5%) - Reducida porque ahora usamos datos reales
        tco *= np.random.uniform(0.95, 1.05)
        
        data.append({
            'band_gap_ev': band_gap,
            'density_g_cm3': density,
            'trl': trl,
            'volume_log': np.log10(volume),
            'years': years,
            'energy_cost_eur_kwh': energy_cost,
            'carbon_tax_eur_ton': carbon_tax,
            'subsidy_rate': subsidy_rate,
            'base_cost_eur': base_cost,
            'tco_eur': max(tco, 0)  # No negative TCO
        })
    
    return pd.DataFrame(data)


def train_model():
    print("🤖 Training Random Forest Regressor for TCO Prediction\n")
    
    # 0. Cargar precios de energía reales para metadata
    real_energy_prices, real_carbon_taxes, real_carbon_intensities = load_real_energy_prices()
    
    # 1. Generar datos
    print("📊 Generating training data...")
    df = generate_training_data(n_samples=20000)
    print(f"   Generated {len(df)} samples")
    print(f"   TCO range: €{df['tco_eur'].min():.2f} - €{df['tco_eur'].max():.2f}")
    print(f"   Mean TCO: €{df['tco_eur'].mean():.2f}\n")
    
    # 2. Preparar features y target
    feature_cols = [
        'band_gap_ev', 'density_g_cm3', 'trl', 'volume_log', 'years',
        'energy_cost_eur_kwh', 'carbon_tax_eur_ton', 'subsidy_rate', 'base_cost_eur'
    ]
    
    X = df[feature_cols]
    y = df['tco_eur']
    
    # 3. Split train/test
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # 4. Entrenar Random Forest
    print("🌳 Training Random Forest...")
    model = RandomForestRegressor(
        n_estimators=200,
        max_depth=25,
        min_samples_split=10,
        min_samples_leaf=4,
        max_features='sqrt',
        random_state=42,
        n_jobs=-1,
        verbose=1
    )
    
    model.fit(X_train, y_train)
    
    # 5. Evaluar
    print("\n📈 Evaluating model...")
    y_pred_train = model.predict(X_train)
    y_pred_test = model.predict(X_test)
    
    r2_train = r2_score(y_train, y_pred_train)
    r2_test = r2_score(y_test, y_pred_test)
    mae_test = mean_absolute_error(y_test, y_pred_test)
    rmse_test = np.sqrt(mean_squared_error(y_test, y_pred_test))
    
    print(f"\n✅ Training Metrics:")
    print(f"   R² (train): {r2_train:.4f}")
    print(f"   R² (test):  {r2_test:.4f}")
    print(f"   MAE (test): €{mae_test:.2f}")
    print(f"   RMSE (test): €{rmse_test:.2f}")
    
    # 6. Feature importance
    print(f"\n🔍 Feature Importance:")
    feature_importance = pd.DataFrame({
        'feature': feature_cols,
        'importance': model.feature_importances_
    }).sort_values('importance', ascending=False)
    
    for _, row in feature_importance.iterrows():
        print(f"   {row['feature']:20s}: {row['importance']:.4f}")
    
    # 7. Guardar modelo
    model_path = Path(__file__).parent / "models" / "tco_random_forest.pkl"
    model_path.parent.mkdir(exist_ok=True)
    
    joblib.dump(model, model_path)
    print(f"\n💾 Model saved to: {model_path}")
    
    # 8. Guardar metadata
    metadata = {
        'model_type': 'RandomForestRegressor',
        'n_estimators': 200,
        'r2_train': float(r2_train),
        'r2_test': float(r2_test),
        'mae_test': float(mae_test),
        'rmse_test': float(rmse_test),
        'features': feature_cols,
        'training_samples': len(df),
        'training_data_source': 'Mendeley Global Day-Ahead Electricity Price Dataset (DOI: 10.17632/s54n4tyyz4.3) + IEA Grid Carbon Intensity Database 2024',
        'energy_price_range': f"€{min(real_energy_prices):.3f} - €{max(real_energy_prices):.3f}/kWh",
        'carbon_tax_range': f"€{min(real_carbon_taxes):.0f} - €{max(real_carbon_taxes):.0f}/tonne",
        'carbon_intensity_range': f"{min(real_carbon_intensities):.0f} - {max(real_carbon_intensities):.0f} g CO2/kWh",
        'training_date': pd.Timestamp.now().isoformat(),
        'doi': '10.17632/s54n4tyyz4.3',
        'feature_importance': feature_importance.to_dict('records')
    }
    
    metadata_path = model_path.with_suffix('.json')
    with open(metadata_path, 'w') as f:
        json.dump(metadata, f, indent=2)
    
    print(f"📋 Metadata saved to: {metadata_path}")
    
    # 9. Test con ejemplo real
    print(f"\n🧪 Testing with real example (SiC in Germany, 100K chips, 5 years):")
    example = pd.DataFrame([{
        'band_gap_ev': 1.75,  # SiC real
        'density_g_cm3': 3.23,  # SiC real
        'trl': 9,  # SiC commercial
        'volume_log': np.log10(100000),
        'years': 5,
        'energy_cost_eur_kwh': 0.178,  # Germany ENTSO-E 2024-2025
        'carbon_tax_eur_ton': 80.0,  # EU
        'subsidy_rate': 0.40,  # Germany EU Chips Act
        'base_cost_eur': 0.80  # SiC cost
    }])
    
    predicted_tco = model.predict(example)[0]
    print(f"   Predicted TCO: €{predicted_tco:,.2f}")
    print(f"   Energy Price Used: €0.178/kWh (Germany ENTSO-E 2024-2025)")
    
    return model, metadata


if __name__ == "__main__":
    model, metadata = train_model()
    print("\n✅ Random Forest model training complete!")
    print(f"   🎯 R² Score: {metadata['r2_test']:.4f}")
    print(f"   📊 Ready to replace formulas with ML predictions")
