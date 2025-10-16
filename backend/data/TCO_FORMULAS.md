# 📐 TCO Calculator - Mathematical Formulas Documentation

## 🎯 Purpose

This document provides the **exact mathematical formulas** used in the Smart TCO Calculator for:
1. **Instant TCO Calculation** (for current year)
2. **5-Year Scenario Projections** (baseline, optimistic, pessimistic)
3. **Data Sources** for each variable

**Last Updated**: October 14, 2025  
**Maintained By**: Smart TCO Calculator Team

---

## 1️⃣ INSTANT TCO CALCULATION

### Formula Overview

The Total Cost of Ownership (TCO) is calculated using two methods:

- **Method A: Random Forest ML Model** (primary, when sufficient training data exists)
- **Method B: Formula-based** (fallback, for transparency and validation)

---

### Method A: Random Forest ML Model

**File**: `backend/models/tco_random_forest.pkl` (46 MB)  
**Training Data**: 10,000+ synthetic scenarios generated from JRC semiconductor reports  
**Features**: Material properties, regional costs, volume, time horizon  
**Output**: Total TCO prediction

**When Used**:
- User requests instant TCO calculation via `/api/tco/predict`
- Sufficient feature data available
- Model confidence > 0.85

**Why ML?**:
- Captures non-linear relationships between variables
- Trained on validated JRC manufacturing data
- Fast inference (< 100ms)

---

### Method B: Formula-based TCO Calculation

**Used for**: Validation, transparency, and when ML model unavailable

#### **Complete Formula:**

```
TCO_total = (Chip_Cost + Energy_Cost + Carbon_Tax + Maintenance_Cost + Supply_Chain_Risk) - Subsidy_Amount
```

Where:

```
Chip_Cost = chip_unit_cost × volume
Energy_Cost = energy_consumption_per_chip × device_lifetime_hours × volume × energy_price_per_kwh
Carbon_Tax = carbon_footprint_per_chip × volume × carbon_tax_rate
Maintenance_Cost = Chip_Cost × 0.10  (10% of chip cost)
Supply_Chain_Risk = Chip_Cost × risk_factor  (0-15% depending on region)
Subsidy_Amount = (Chip_Cost + Energy_Cost + Carbon_Tax + Maintenance_Cost) × subsidy_rate
```

---

### Variable Definitions & Sources

#### **chip_unit_cost** (EUR per chip)
- **Source**: Materials Project API + JRC semiconductor cost reports
- **Example**: SiC power chip = €2.50, GaN RF chip = €15.00
- **File**: `backend/data/semiconductors_comprehensive.json`

#### **volume** (chips per year)
- **Source**: User input
- **Typical Range**: 10,000 - 10,000,000 chips/year

#### **energy_consumption_per_chip** (mW)
- **Source**: Material properties from semiconductors database
- **Example**: SiC: 250 mW, GaN: 180 mW, Si: 500 mW
- **File**: `backend/data/semiconductors_comprehensive.json`

#### **device_lifetime_hours** (hours)
- **Formula**: `years × 365 days × 24 hours`
- **Default**: 5 years = 43,800 hours
- **Assumption**: 24/7 operation (worst-case for industrial use)

#### **energy_price_per_kwh** (EUR/kWh)
- **Primary Source**: ENTSO-E Transparency Platform (EU, 19 countries)
- **Secondary Source**: EIA API (USA)
- **Fallback**: OECD Energy Prices 2024
- **Update Frequency**: Daily (if ENTSO-E available), otherwise monthly
- **File**: `backend/data/energy_prices_live.json`
- **Last Updated**: Oct 14, 2025 11:17:52

#### **carbon_footprint_per_chip** (kg CO2e)
- **Source**: Material-specific carbon intensity data
- **Example**: SiC: 0.8 kg CO2e, GaN: 0.6 kg CO2e
- **References**: JRC Life Cycle Assessment reports
- **File**: `backend/data/material_properties.csv`

#### **carbon_tax_rate** (EUR/tonne CO2)
- **EU**: €90/tonne (EU ETS, 2025)
- **USA**: $0/tonne (no federal carbon tax)
- **Other**: Country-specific (see CARBON_TAX_SOURCES.md)
- **File**: `backend/services/data_access.py` → REGIONS_DB

#### **risk_factor** (0.00 - 0.15)
- **Definition**: Supply chain disruption risk premium
- **Factors**: Geopolitical stability, single-source dependency, lead times
- **Example**: Taiwan = 0.12 (high geopolitical risk), Germany = 0.03 (low risk)
- **File**: Regional risk assessments (calculated based on expert analysis)

#### **subsidy_rate** (0.00 - 0.50)
- **Source**: Government semiconductor incentive programs
- **EU**: 0.25-0.40 (EU Chips Act, Regulation 2023/1781)
- **USA**: 0.25-0.35 (CHIPS Act 2022, Public Law 117-167)
- **Asia**: 0.25-0.50 (country-specific programs)
- **Verification**: See `SUBSIDY_SOURCES.md` for documented rates
- **⚠️ Placeholder**: 0.05 for countries without documented programs

---

### Example Calculation

**Scenario**: 100,000 SiC power chips, Germany, 5 years

**Inputs**:
- chip_unit_cost = €2.50
- volume = 100,000
- energy_consumption = 250 mW = 0.00025 kW
- years = 5 → device_lifetime_hours = 43,800 hours
- energy_price = €0.178/kWh (Germany ENTSO-E)
- carbon_footprint = 0.8 kg CO2e
- carbon_tax = €90/tonne
- risk_factor = 0.03
- subsidy_rate = 0.40 (EU Chips Act)

**Calculation**:

```
Chip_Cost = €2.50 × 100,000 = €250,000

Energy_Cost = 0.00025 kW × 43,800 hours × 100,000 chips × €0.178/kWh
            = 0.00025 × 43,800 × 100,000 × 0.178
            = €194,850

Carbon_Tax = 0.8 kg × 100,000 chips × €90/tonne ÷ 1000 kg/tonne
           = 80,000 kg × €0.09/kg
           = €7,200

Maintenance = €250,000 × 0.10 = €25,000

Supply_Chain_Risk = €250,000 × 0.03 = €7,500

Total_Before_Subsidy = €250,000 + €194,850 + €7,200 + €25,000 + €7,500
                     = €484,550

Subsidy_Amount = €484,550 × 0.40 = €193,820

TCO_total = €484,550 - €193,820 = €290,730
```

**Cost per chip**: €290,730 ÷ 100,000 = **€2.91 per chip**

---

## 2️⃣ 5-YEAR SCENARIO PROJECTIONS

### Purpose

Project how TCO components (energy costs, subsidies) will evolve over 5 years under different scenarios.

---

### Scenario Types

1. **BASELINE**: Current trends continue (conservative)
2. **OPTIMISTIC**: Favorable conditions (best case)
3. **PESSIMISTIC**: Adverse conditions (worst case)

---

### Projection Formulas

#### **File**: `backend/routers/scenarios.py` → `_generate_scenarios()`

For each year `t` (where t = 0 to 4):

---

#### **BASELINE SCENARIO**

**Energy Cost Growth**: 2% annually
```
energy_cost(t) = base_energy_cost × (1.02^t)
```
- **Rationale**: Historical EU energy market trend (ENTSO-E 2015-2024 avg)
- **Source**: ENTSO-E historical day-ahead prices

**Subsidy Rate Decline**: 2% annually
```
subsidy_rate(t) = base_subsidy_rate × (0.98^t)
```
- **Rationale**: EU Chips Act funding tapers after initial deployment
- **Source**: EU Chips Act disbursement schedule (2023-2030)

**Carbon Tax**: Stable
```
carbon_tax(t) = base_carbon_tax
```
- **Rationale**: EU ETS trajectory is legally defined (€90-95/tonne 2025-2029)
- **Source**: EU ETS Phase IV Directive 2003/87/EC

---

#### **OPTIMISTIC SCENARIO**

**Energy Cost Decline**: 3% annually
```
energy_cost(t) = base_energy_cost × (0.97^t)
```
- **Rationale**: Renewable energy expansion reduces wholesale prices
- **Source**: IEA World Energy Outlook 2024 (renewables scenario)

**Subsidy Rate Increase**: 5% annually (capped at 50%)
```
subsidy_rate(t) = min(0.50, base_subsidy_rate × (1.05^t))
```
- **Rationale**: Government programs expand in response to geopolitical pressures
- **Cap**: 50% maximum (exceeds historical subsidy rates)

**Carbon Tax Reduction**: 20% lower
```
carbon_tax(t) = base_carbon_tax × 0.80
```
- **Rationale**: Carbon capture technology adoption reduces effective tax burden

---

#### **PESSIMISTIC SCENARIO**

**Energy Cost Increase**: 5% annually
```
energy_cost(t) = base_energy_cost × (1.05^t)
```
- **Rationale**: Supply disruptions, fossil fuel dependency
- **Source**: ENTSO-E 2021-2022 energy crisis data

**Subsidy Rate Decline**: 10% annually
```
subsidy_rate(t) = base_subsidy_rate × (0.90^t)
```
- **Rationale**: Budget constraints reduce government support
- **Source**: Historical subsidy program sunset patterns

**Carbon Tax Increase**: 20% higher
```
carbon_tax(t) = base_carbon_tax × 1.20
```
- **Rationale**: Stricter climate regulations (EU Green Deal targets)
- **Source**: European Commission Impact Assessment SWD(2021) 601

---

### Annual Cost Calculation (Scenarios)

For each scenario and year:

```
annual_cost(t) = _calculate_annual_cost(
    material,
    volume,
    energy_cost(t),
    subsidy_rate(t),
    carbon_tax(t)
)
```

Where `_calculate_annual_cost()` uses the **Method B formula** above.

---

### Why Formulas Instead of ML for Projections?

**Reasons**:

1. **Regulatory Certainty**: EU Chips Act policies are legally defined (2023-2030)
2. **Transparency**: Stakeholders can audit and replicate projections
3. **Explainability**: Industrial decision-makers require clear rationale
4. **Stability**: ML models trained on historical data may not capture policy shifts
5. **Validation**: Formulas can be directly cross-referenced with JRC reports

**ML Model Limitations for Long-Term Projections**:
- Trained on 2019-2024 data (doesn't include recent policy changes)
- Cannot predict political decisions (e.g., subsidy extensions)
- Introduces uncertainty intervals that complicate procurement decisions

---

## 3️⃣ DATA SOURCE HIERARCHY

### Priority Order (when multiple sources available):

1. **Live APIs** (highest priority)
   - ENTSO-E Transparency Platform (EU energy)
   - EIA API (USA energy)
   
2. **Updated Cache** (< 24 hours old)
   - `backend/data/energy_prices_live.json`
   
3. **OECD Fallback** (if API fails)
   - `backend/data/oecd_energy_prices.csv`
   
4. **Hardcoded Estimates** (last resort)
   - Documented in `data_access.py` with ⚠️ warnings

---

## 4️⃣ VALIDATION & TESTING

### Cross-Validation Sources

1. **JRC Reports**:
   - JRC133736 (semiconductor manufacturing costs)
   - JRC133850 (energy consumption profiles)
   - JRC141323 (carbon footprint assessments)

2. **Industry Benchmarks**:
   - SEMI Market Data
   - IC Insights cost models
   - Yole Développement TCO analyses

3. **Government Filings**:
   - Intel/TSMC/Samsung SEC 10-K reports
   - EU State Aid notifications
   - CHIPS Act recipient disclosures

---

## 5️⃣ UNCERTAINTY & DISCLAIMERS

### Known Limitations

1. **Subsidy Rates**:
   - ⚠️ Countries marked with 0.05 (5%) have **no documented sources**
   - Actual rates may be 0% or higher (requires government transparency)
   - See `SUBSIDY_SOURCES.md` for verified programs only

2. **Supply Chain Risk**:
   - Qualitative expert assessment (not quantitative model)
   - Subject to geopolitical changes

3. **Carbon Tax Projections**:
   - Assumes current policy trajectories
   - May not reflect sudden regulatory changes

4. **Energy Price Volatility**:
   - Day-ahead market prices can fluctuate 20-50% monthly
   - We use 12-month rolling averages to smooth volatility

---

## 6️⃣ FORMULA CHANGE LOG

| Date | Change | Rationale |
|------|--------|-----------|
| Oct 14, 2025 | Added subsidy_source field to regions | Transparency for countries without documented programs |
| Oct 10, 2025 | Updated carbon_tax to €90/tonne (EU) | EU ETS Phase IV latest auction price |
| Sep 15, 2025 | Added 14 new EU countries | EU expansion of Chips Act to all member states |
| Aug 20, 2025 | Switched EU energy source to ENTSO-E | More accurate than OECD estimates |
| Jul 10, 2025 | Updated device_lifetime_hours assumption | Changed from 3 years to 5 years (industry standard) |

---

## 7️⃣ REFERENCES

### Academic Papers
1. European Commission (2023). "EU Chips Act: Impact Assessment." SWD(2022) 147 final
2. JRC (2023). "Semiconductor Manufacturing Costs in Europe." JRC133736_01.pdf
3. Brookings Institution (2022). "CHIPS Act Economic Analysis"

### Data Sources
1. ENTSO-E Transparency Platform: https://transparency.entsoe.eu/
2. EIA Electricity Data Browser: https://www.eia.gov/electricity/data.php
3. Materials Project API: https://materialsproject.org/
4. EU ETS Carbon Price: https://www.eex.com/en/market-data/environmentals/eua-primary-auction

### Government Documents
1. EU Chips Act: Regulation (EU) 2023/1781
2. CHIPS Act 2022: Public Law 117-167
3. EU ETS Directive: 2003/87/EC (amended)

---

## 📧 Contact

For questions about formulas or to report discrepancies:
- **Issue Tracker**: GitHub repository
- **Email**: tco-calculator@example.com
- **Documentation**: See `/backend/data/` folder for all source files

---

**Version**: 1.0.0  
**Last Reviewed**: October 14, 2025
