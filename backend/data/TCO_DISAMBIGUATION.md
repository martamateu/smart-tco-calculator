# 🔍 TCO Disambiguation: Two Different Concepts in Semiconductors

## Overview

In the semiconductor industry, **"TCO" refers to TWO completely different concepts**:

1. **Transparent Conductive Oxide (TCO)** - A material science term
2. **Total Cost of Ownership (TCO)** - A financial/economics term

This document clarifies which TCO this calculator addresses and how it differs from the other.

---

## 1️⃣ TCO = Transparent Conductive Oxide (Materials Science)

### Definition
Wide-bandgap, degenerate n-type oxide semiconductors used in optoelectronic applications.

### Examples
- **ITO (In₂O₃:Sn)** - Indium Tin Oxide
- **ZnO:Al** - Aluminum-doped Zinc Oxide  
- **SnO₂:F** - Fluorine-doped Tin Oxide

### Key Formula
```
σ = μ × n × e
```
Where:
- σ = electrical conductivity (S/cm)
- μ = electron mobility (cm²/V·s)
- n = carrier concentration (cm⁻³)
- e = electron charge (1.602 × 10⁻¹⁹ C)

### Applications
- Solar cells (transparent electrodes)
- Flat panel displays
- Touch screens
- LED devices

### **❌ NOT what this calculator does**

---

## 2️⃣ TCO = Total Cost of Ownership (Economics)

### Definition
The **complete lifetime cost** of procuring, operating, and maintaining semiconductor assets.

### Industry Standard Formula (SEMI E35)
```
TCO = C_acquisition + C_operation + C_maintenance + C_depreciation + C_downtime
```

### Two Contexts in Semiconductors

#### **Context A: FAB Equipment TCO** (NOT our focus)
Calculating TCO for **fabrication tools** (lithography, etching, deposition):

| Component | Example |
|-----------|---------|
| C_acquisition | ASML EUV lithography system: €150M |
| C_operation | Utilities, gases, cleanroom: €5M/year |
| C_maintenance | Service contracts, calibration: €2M/year |
| C_depreciation | Equipment amortization: €10M/year (15-year life) |
| C_downtime | Yield loss, throughput impact: €3M/year |

**Total FAB Tool TCO**: €320M over 15 years

---

#### **Context B: Chip Procurement TCO** ✅ **(THIS CALCULATOR)**
Calculating TCO for **buying and operating semiconductor chips**:

| Component | Example | Our Implementation |
|-----------|---------|-------------------|
| C_acquisition | Silicon carbide chips: €2.50/chip × 1M chips | ✅ `chip_cost` |
| C_operation | Energy consumption: 250 mW × 43,800h × €0.12/kWh | ✅ `energy_cost + carbon_tax` |
| C_maintenance | Software updates, support: 10% of chip cost | ✅ `maintenance` |
| C_depreciation | N/A (chips are consumed, not depreciated) | ❌ Not applicable |
| C_downtime | Supply chain disruption risk: 5% buffer | ✅ `supply_chain_risk` |

**Total Chip Procurement TCO**: €3.2M over 5 years (example)

---

## 🎯 What This Calculator Does

### Scope
**Semiconductor chip procurement and operational cost analysis** for:
- Electronics manufacturers buying chips
- Industrial equipment OEMs
- Automotive companies (EV power electronics)
- Renewable energy companies (solar inverters)

### What We Calculate
```
TCO_chip = (Chip_Cost + Energy_Cost + Carbon_Tax + Maintenance + Supply_Chain_Risk) - Subsidies
```

Mapped to SEMI E35:
- **C_acquisition** = Chip unit cost × volume × years
- **C_operation** = Energy consumption + Carbon tax (EU ETS)
- **C_maintenance** = 9-15% of chip cost (technical support, replacements)
- **C_downtime** = Supply chain risk (3-10% based on geopolitical factors)
- **C_depreciation** = ❌ Not applicable (chips consumed, not depreciated)
- **Subsidies** = Government incentives (EU Chips Act 25-30%, US CHIPS Act 15-25%)

### Why No Depreciation?
**Depreciation applies to capital equipment (FAB tools), not consumable goods (chips).**

- ✅ Depreciate: ASML lithography machine (€150M, 15-year life)
- ❌ Don't depreciate: 1 million SiC chips (consumed in production)

Chips are **expensed immediately** when used in production, following standard accounting practices (GAAP/IFRS).

---

## 📚 References

### Transparent Conductive Oxides (Materials)
1. Bright et al. (2018) - "Transparent Conductive Oxides: Status and Opportunities"
2. BJSTR Journal - "TCO Semiconducting Films"
3. ScienceDirect - "Optical and Electrical Properties of TCO Materials"

### Total Cost of Ownership (Economics)
1. SEMI E35 - "Guide to Calculate Cost of Ownership Metrics for Semiconductor Manufacturing Equipment"
2. Chetan Patil - "The Total Cost of Ownership in Semiconductor Business"
3. BCG (2023) - "Semiconductor Manufacturing TCO Analysis"
4. JRC European Commission - "Economics of Semiconductor Production"

---

## 🚨 Common Confusion Points

| Question | Answer |
|----------|--------|
| "Why no transparency/conductivity formulas?" | We calculate **economic TCO**, not **material TCO** |
| "Why no depreciation in your TCO?" | We analyze **chip procurement**, not **FAB equipment** |
| "Is ITO in your materials list?" | Only if used as a **semiconductor chip**, not as a **TCO material** |
| "What about σ = μ × n × e?" | That's for **material conductivity**, not **cost ownership** |

---

## ✅ Summary

| Aspect | Material TCO | Economic TCO (Our Focus) |
|--------|-------------|--------------------------|
| **Field** | Materials Science | Business/Finance |
| **Formula** | σ = μ × n × e | TCO = C_acq + C_op + C_maint + C_down |
| **Units** | S/cm, Ω·cm | EUR, USD |
| **Application** | Optoelectronics design | Procurement decisions |
| **Examples** | ITO, ZnO:Al, SnO₂:F | SiC, GaN, Si chips |
| **Depreciation** | N/A | Only for FAB equipment, not chips |

**This calculator addresses Economic TCO for chip procurement, following SEMI E35 adapted for consumable semiconductor goods.**

---

**Last Updated**: October 22, 2025  
**Maintained By**: Smart TCO Calculator Team
