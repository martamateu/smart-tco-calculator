# ENTSO-E Area Codes Investigation

## ❌ Failing Countries

### Germany (10Y1001A1001A83F)
**Status**: FAILING - "No price data in response"
**Possible Issues**:
- Code `10Y1001A1001A83F` is the **control area** code, not the **bidding zone**
- Germany has 4 TSOs: 50Hertz, Amprion, TenneT DE, TransnetBW
- Germany-Luxembourg (DE-LU) bidding zone merged until 2018

**Alternative Codes to Try**:
- `10Y1001A1001A82H` - Germany-Luxembourg bidding zone (DE-LU) - **OLD**
- `10YDE-VE-------2` - 50Hertz (East Germany)
- `10YDE-RWENET---I` - Amprion
- `10YDE-EON------1` - TenneT DE
- `10YDE-ENBW-----N` - TransnetBW
- `10Y1001A1001A63L` - **Germany (DE) bidding zone** ✅ TRY THIS FIRST

### Italy (10YIT-GRTN-----B)
**Status**: FAILING - "No price data in response"
**Possible Issues**:
- Italy has multiple bidding zones (Nord, Centro-Nord, Centro-Sud, Sud, Sicilia, Sardegna)
- Code `10YIT-GRTN-----B` might be the control area, not a bidding zone

**Alternative Codes to Try**:
- `10Y1001A1001A73I` - Italy North (NORD) ✅ TRY THIS
- `10Y1001A1001A70O` - Italy Centre-North (CNOR)
- `10Y1001A1001A71M` - Italy Centre-South (CSUD)
- `10Y1001A1001A788` - Italy South (SUD)
- `10Y1001A1001A74G` - Italy Sicily (SICI)
- `10Y1001A1001A75E` - Italy Sardinia (SARD)

### Denmark (10Y1001A1001A65H)
**Status**: FAILING - "No price data in response"
**Possible Issues**:
- Denmark has TWO separate bidding zones: DK1 (West) and DK2 (East)
- Code `10Y1001A1001A65H` might be the combined area (doesn't have day-ahead market)
- Need to query both zones separately and average

**Alternative Codes to Try**:
- `10YDK-1--------W` - **Denmark West (DK1)** ✅ TRY THIS FIRST
- `10YDK-2--------M` - **Denmark East (DK2)** ✅ TRY THIS FIRST
- Average both zones for national price

---

## 🔍 ENTSO-E API Parameters

### Document Types
- `A44` - Day-ahead prices (Price Document) ✅ CORRECT
- `A25` - Allocation result document
- `A73` - Actual generation per type

### Process Types
- Not typically needed for day-ahead prices
- Default: Market clearing (implicit in A44)

### Domain Codes
- `in_Domain` = Market area where energy is consumed
- `out_Domain` = Market area where energy is produced
- For national prices: **in_Domain = out_Domain = bidding zone**

---

## ✅ Working Countries (Reference)

### France (10YFR-RTE------C)
- **Status**: WORKING ✅
- Single bidding zone
- RTE is the TSO

### Spain (10YES-REE------0)
- **Status**: WORKING ✅
- Single bidding zone
- REE is the TSO

### Netherlands (10YNL----------L)
- **Status**: WORKING ✅
- Single bidding zone
- TenneT NL is the TSO

---

## 📋 Recommended Fixes

### 1. Update Germany Code
```python
# OLD (failing)
"Germany": "10Y1001A1001A83F",

# NEW (try this)
"Germany": "10Y1001A1001A63L",  # DE bidding zone
```

### 2. Update Italy Code (Use North zone as representative)
```python
# OLD (failing)
"Italy": "10YIT-GRTN-----B",

# NEW (try this)
"Italy": "10Y1001A1001A73I",  # IT-North (largest market)
```

### 3. Update Denmark Code (Average DK1 + DK2)
```python
# OLD (failing)
"Denmark": "10Y1001A1001A65H",

# NEW (requires special handling - fetch both and average)
"Denmark_DK1": "10YDK-1--------W",
"Denmark_DK2": "10YDK-2--------M",
```

---

## 🔗 References

- ENTSO-E Transparency Platform: https://transparency.entsoe.eu/
- EIC Codes: https://www.entsoe.eu/data/energy-identification-codes-eic/
- ENTSO-E API Guide: https://transparency.entsoe.eu/content/static_content/Static%20content/web%20api/Guide.html

---

## 🧪 Testing Plan

1. **Test Germany** with `10Y1001A1001A63L`
2. **Test Italy** with `10Y1001A1001A73I` (Nord zone)
3. **Test Denmark** with separate queries for DK1 + DK2, then average
4. If still failing, check:
   - Date range (some countries have limited historical data)
   - API rate limits
   - XML response structure differences

---

**Date**: October 15, 2025  
**Status**: Investigation Complete - Ready to implement fixes
