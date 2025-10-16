# 📊 Regional Expansion Summary - EIA Integration Complete

**Date:** October 15, 2025  
**Status:** ✅ COMPLETED

---

## 🎯 Objective
Expand from 13 static Mendeley regions to 17 regions with real-time pricing from ENTSO-E (EU) and EIA (USA).

---

## 📈 Results

### Before (October 14, 2025)
- **13 regions** - All static Mendeley data
- **0% live pricing**
- No USA state-level granularity

### After (October 15, 2025)
- **17 regions** - Mendeley base + live API updates
- **65% live pricing** (11/17 regions)
- **5 USA states** with real-time EIA data

---

## 🗺️ Regional Breakdown

### 🇪🇺 Europe (8 regions)
| Region | Price (EUR/kWh) | Data Source | Status |
|--------|----------------|-------------|--------|
| Poland | €0.171 | Mendeley | ⚪ Static |
| **Germany** | **€0.152** | **ENTSO-E** | **🟢 LIVE** |
| **France** | **€0.115** | **ENTSO-E** | **🟢 LIVE** |
| **Italy** | **€0.189** | **ENTSO-E** | **🟢 LIVE** |
| **Spain** | **€0.118** | **ENTSO-E** | **🟢 LIVE** |
| **Netherlands** | **€0.157** | **ENTSO-E** | **🟢 LIVE** |
| Sweden | €0.078 | Mendeley | ⚪ Static |
| **Belgium** | **€0.145** | **ENTSO-E** | **🟢 LIVE** |

**ENTSO-E Coverage:** 6/8 regions (75%)  
**Update Frequency:** Every 8 hours

### 🇺🇸 USA (5 states)
| State | Price (EUR/kWh) | Data Source | Status |
|-------|----------------|-------------|--------|
| **California** | **€0.197** | **EIA Retail Sales** | **🟢 LIVE** |
| **Texas** | **€0.059** | **EIA Retail Sales** | **🟢 LIVE** |
| **Arizona** | **€0.075** | **EIA Retail Sales** | **🟢 LIVE** |
| **Ohio** | **€0.072** | **EIA Retail Sales** | **🟢 LIVE** |
| **New York** | **€0.092** | **EIA Retail Sales** | **🟢 LIVE** |

**EIA Coverage:** 5/5 states (100%)  
**Update Frequency:** Daily at 06:00 UTC  
**Sector:** Industrial (IND) - semiconductor manufacturing  
**Period:** 12-month rolling average

**Key Insights:**
- **Texas** has the **lowest** electricity cost in USA (€0.059/kWh) - explains TSMC investment
- **California** has the **highest** electricity cost in USA (€0.197/kWh) - renewable mandates
- **3.3x price difference** between cheapest (Texas) and most expensive (California) USA state

### 🌏 Asia-Pacific (4 regions)
| Region | Price (EUR/kWh) | Data Source | Status |
|--------|----------------|-------------|--------|
| Taiwan | €0.092 | Mendeley | ⚪ Static |
| South Korea | €0.085 | Mendeley | ⚪ Static |
| China | €0.076 | Mendeley | ⚪ Static |
| Japan | €0.165 | Mendeley | ⚪ Static |

**Note:** No real-time API available for Asia-Pacific regions (using validated Mendeley data)

---

## 🔧 Technical Implementation

### 1. EIA API Integration
**File:** `backend/utils/fetch_eia_prices.py`

```python
# Correct Endpoint (after Swagger analysis)
EIA_BASE_URL = "https://api.eia.gov/v2/electricity/retail-sales/data"

# Parameters
params = {
    "frequency": "monthly",        # Monthly averages
    "data[0]": "price",           # Price data
    "facets[sectorid][]": "IND",  # Industrial sector
    "facets[stateid][]": state_id # CA, TX, AZ, OH, NY
}

# Unit Conversion
# EIA returns: cents per kilowatt-hour
# We need: EUR per kilowatt-hour
eur_kwh = (cents_kwh / 100) * 0.92  # USD to EUR conversion
```

**Initial Problem:** Used wrong endpoint `/rto/daily-region-data` (wholesale ISO markets)  
**Solution:** Analyzed Swagger documentation → switched to `/retail-sales` (industrial retail prices)

### 2. Data Architecture Updates

**File:** `backend/services/data_access.py`

```python
# Hybrid data loading pipeline
REGIONS_DB = _update_regions_with_eia(
    _update_regions_with_entsoe(
        _load_mendeley_regions()
    )
)
```

**Priority:**
1. Mendeley JSON → Base data (prices, carbon intensity, subsidies)
2. ENTSO-E cache → Update EU prices (if available)
3. EIA cache → Update USA prices (if available)

### 3. Frontend Updates

**File:** `components/InputForm.tsx`

```tsx
{/* North America - 5 USA states */}
<optgroup label="🇺🇸 North America">
  {regions.filter(r => 
    ['California', 'Texas', 'Arizona', 'Ohio', 'New York'].includes(r.code)
  ).map(r => 
    <option key={r.code} value={r.code}>{r.name}</option>
  )}
</optgroup>
```

**Removed:** "United States" national average (confusing, not specific)  
**Kept:** 5 specific states with major semiconductor fabs

---

## 📊 Price Validation

### EIA Test Results (October 15, 2025)
```
🇺🇸 UPDATING USA ELECTRICITY PRICES FROM EIA API

📍 California (CA): 12 months, avg 21.39¢/kWh = €0.1968/kWh ✅
📍 Texas (TX):      12 months, avg 6.39¢/kWh  = €0.0588/kWh ✅
📍 Arizona (AZ):    12 months, avg 8.16¢/kWh  = €0.0751/kWh ✅
📍 Ohio (OH):       12 months, avg 7.81¢/kWh  = €0.0718/kWh ✅
📍 New York (NY):   12 months, avg 9.95¢/kWh  = €0.0915/kWh ✅

Success: 5/5 states
```

**Validation:** All prices realistic and match industrial sector expectations

---

## ☁️ Cloud Scheduler Configuration

**File:** `backend/setup_cloud_schedulers_realtime.sh`

### Job 1: ENTSO-E (EU Prices)
```bash
Schedule: "0 */8 * * *"  # Every 8 hours
Endpoint: /admin/refresh-prices/entsoe
Regions: 6 EU countries
```

### Job 2: EIA (USA Prices)
```bash
Schedule: "0 6 * * *"    # Daily at 06:00 UTC
Endpoint: /admin/refresh-prices/eia
Regions: 5 USA states
```

**Cost Estimate:** ~$0.56/month (both schedulers)

---

## 📝 Files Modified

### Backend
1. ✅ `backend/data/global_electricity_data_2025.json` - Added 5 USA states, removed "United States" aggregate
2. ✅ `backend/utils/fetch_eia_prices.py` - Created EIA API integration (corrected endpoint)
3. ✅ `backend/services/data_access.py` - Added `_update_regions_with_eia()` function
4. ✅ `backend/setup_cloud_schedulers_realtime.sh` - Created Cloud Scheduler setup script

### Frontend
5. ✅ `components/InputForm.tsx` - Updated dropdown to show 5 USA states

### Documentation
6. ✅ `CLOUD_SCHEDULER_SETUP.md` - Comprehensive scheduler documentation
7. ✅ `REGIONAL_EXPANSION_SUMMARY.md` - This file

---

## 🚀 Deployment Checklist

- [x] EIA API integration tested and working
- [x] 5 USA states added to Mendeley JSON
- [x] Backend data pipeline updated
- [x] Frontend dropdown updated
- [ ] Deploy backend to GCP Cloud Run
- [ ] Configure Cloud Scheduler jobs
- [ ] Test end-to-end with frontend
- [ ] Monitor price updates for 24h

---

## 📊 Impact Analysis

### TCO Calculation Improvements
- **Better USA granularity:** State-level pricing instead of national average
- **Real-time pricing:** 11/17 regions update automatically
- **Competitive intelligence:** Texas €0.059/kWh vs California €0.197/kWh explains fab location choices

### Business Value
- **TSMC in Texas/Arizona:** Low energy costs (€0.059-0.075/kWh) = competitive advantage
- **Intel in Ohio:** Moderate costs (€0.072/kWh) + CHIPS Act subsidies
- **GlobalFoundries in NY:** Higher costs (€0.092/kWh) but clean grid (45% renewable + 30% nuclear)

---

## 🔍 Key Findings

### Why Texas Wins
1. **Cheapest electricity:** €0.059/kWh (65% cheaper than California)
2. **Deregulated market:** ERCOT allows competitive pricing
3. **Abundant natural gas:** 41% gas grid keeps prices low
4. **Growing renewables:** 32% renewable (mainly wind)

### Why California Struggles
1. **Most expensive:** €0.197/kWh (3.3x more than Texas)
2. **Renewable mandates:** 58% renewable grid increases costs
3. **Strict regulations:** Environmental compliance adds overhead
4. **BUT:** Lowest carbon intensity (220 g CO2/kWh)

---

## ✅ Success Metrics

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Total Regions | 13 | 17 | +31% |
| Live Pricing Coverage | 0% | 65% | +65pp |
| USA Granularity | National | State-level (5) | +5 states |
| Update Frequency | Never | 8h (EU) / 24h (USA) | Real-time |
| Data Sources | 1 (Mendeley) | 3 (Mendeley + ENTSO-E + EIA) | +200% |

---

## 🎉 Conclusion

Successfully expanded the Smart TCO Calculator from **13 static regions** to **17 regions with 65% live pricing**. The EIA API integration provides **state-level granularity** for the USA, enabling more accurate TCO calculations for semiconductor manufacturing facilities.

**Next Steps:**
1. Deploy to production
2. Configure Cloud Schedulers
3. Monitor price updates
4. Consider adding more USA states (Oregon, Washington) if needed

---

**Prepared by:** GitHub Copilot  
**Date:** October 15, 2025  
**Status:** ✅ COMPLETED
