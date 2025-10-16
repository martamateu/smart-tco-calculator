# Data Sources & Citations

This document provides formal citations for all datasets and research papers used in the Smart TCO Calculator.

## Energy Price Data

### Global Day-Ahead Electricity Price Dataset
Ullah, Md Habib; Reza, Sayed Mohsin; Gundapaneni, Lasya Madhuri; Balachander, Pranav; Babaiahgari, Bhanu; Khan, Abdullah Al Ahad (2025), "Global Day-Ahead Electricity Price Dataset", Mendeley Data, V3, doi: [10.17632/s54n4tyyz4.3](https://doi.org/10.17632/s54n4tyyz4.3)

**Description:** Comprehensive dataset of day-ahead electricity market prices from major markets worldwide including EU (ENTSO-E), USA (ISOs), and Asia-Pacific regions.

**Coverage:** 2024-2025, hourly granularity

**Used for:** Real-time energy price updates for TCO calculations across 18+ regions

### ENTSO-E Transparency Platform
ENTSO-E (European Network of Transmission System Operators for Electricity), "Transparency Platform - Day-Ahead Prices", Available at: [https://transparency.entsoe.eu/](https://transparency.entsoe.eu/)

**Description:** Official European electricity market data including day-ahead prices, generation, load, and cross-border flows.

**Coverage:** EU member states, real-time and historical data

**Used for:** Live energy price updates for European regions (Germany, France, Spain, Italy, Netherlands, etc.)

### EIA - U.S. Energy Information Administration
U.S. Energy Information Administration (2024), "Electric Power Monthly", Available at: [https://www.eia.gov/electricity/monthly/](https://www.eia.gov/electricity/monthly/)

**Description:** Official U.S. electricity statistics including prices, generation, sales, and revenue.

**Coverage:** All U.S. states and regions, monthly updates

**Used for:** Energy price data for U.S. regions (Arizona, Texas, Ohio, New York)

### OECD Energy Prices Database
OECD (2024), "Energy Prices and Taxes", OECD iLibrary, doi: [10.1787/energy_prices-data-en](https://doi.org/10.1787/energy_prices-data-en)

**Description:** International comparison of energy prices including electricity and natural gas for industry and households.

**Coverage:** OECD member countries, quarterly updates

**Used for:** Baseline energy prices and verification of market data

## Semiconductor Industry Data

### JRC Technical Reports - Semiconductor Manufacturing

#### JRC141323: Critical Raw Materials for Strategic Technologies
European Commission, Joint Research Centre (2024), "Critical Raw Materials for Strategic Technologies and Sectors in the EU", JRC Technical Report JRC141323, Available at: [https://publications.jrc.ec.europa.eu/repository/handle/JRC141323](https://publications.jrc.ec.europa.eu/repository/handle/JRC141323)

**Used for:** Semiconductor material properties, supply chain risk assessment

#### JRC133850: Energy and GHG Emissions of Semiconductor Manufacturing
European Commission, Joint Research Centre (2023), "Energy consumption and greenhouse gas emissions in the semiconductor industry", JRC Technical Report JRC133850

**Used for:** Energy consumption data per chip, carbon footprint calculations

#### JRC133892: Semiconductor Manufacturing Costs
European Commission, Joint Research Centre (2023), "Cost analysis of semiconductor manufacturing processes", JRC Technical Report JRC133892

**Used for:** Manufacturing cost structures, maintenance cost estimates

### Materials Project Database
Jain, A., Ong, S. P., Hautier, G., Chen, W., Richards, W. D., Dacek, S., ... & Persson, K. A. (2013), "Commentary: The Materials Project: A materials genome approach to accelerating materials innovation", APL Materials, 1(1), 011002. doi: [10.1063/1.4812323](https://doi.org/10.1063/1.4812323)

**API Access:** [https://materialsproject.org/](https://materialsproject.org/)

**Description:** Open database of computed materials properties including semiconductors (Si, GaN, GaAs, SiC).

**Used for:** Material properties, energy band gaps, thermal conductivity, and performance metrics

## Carbon Pricing & Environmental Data

### EU Emissions Trading System (EU ETS)
European Commission (2025), "EU Emissions Trading System (EU ETS) - Carbon Market Report 2024", Available at: [https://climate.ec.europa.eu/eu-action/eu-emissions-trading-system-eu-ets_en](https://climate.ec.europa.eu/eu-action/eu-emissions-trading-system-eu-ets_en)

**Used for:** EU carbon tax rates, CO₂ pricing data

### IEA World Energy Outlook 2023
International Energy Agency (2023), "World Energy Outlook 2023", IEA, Paris, doi: [10.1787/827374a6-en](https://doi.org/10.1787/827374a6-en)

**File:** `827374a6-en.pdf` (355 pages)

**Used for:** Global energy trends, carbon intensity factors, regional energy mix

### Carbon Market Reports
- **EU Carbon Market Report 2024** (`2024_carbon_market_report_en.pdf`)
- **EU ETS Regulation 2022/2560** (`CELEX_32022R2560_EN_TXT.pdf`)

**Used for:** Carbon pricing mechanisms, EU ETS compliance costs

## Policy & Subsidy Information

### EU Chips Act
European Parliament and Council (2023), "Regulation (EU) 2023/1781 establishing a framework of measures for strengthening Europe's semiconductor ecosystem (Chips Act)", Official Journal of the European Union

**File:** `EU_Chips_Act_Regulation_2023.pdf`

**Used for:** EU subsidy rates (40% for advanced fabs), eligibility criteria

### USA CHIPS and Science Act
U.S. Congress (2022), "CHIPS and Science Act of 2022", Public Law 117-167

**Used for:** U.S. federal subsidies for semiconductor manufacturing, state incentives

### OECD Semiconductor Policy Database
OECD (2024), "Semiconductor industry policies and support measures", OECD Science, Technology and Industry Policy Papers

**Used for:** International comparison of semiconductor subsidies and policies

## Additional Technical References

### BP Energy Outlook 2025
BP (2025), "BP Energy Outlook 2025", Available at: bp.com/energyoutlook

**File:** `bp-energy-outlook-2025.pdf`

**Used for:** Long-term energy price forecasts, scenario analysis

### FSR Guidelines - EU Regulation 2022/2560
Florence School of Regulation (2024), "Draft Guidelines for Application of EU Regulation 2022/2560"

**File:** `FSR_draft_guidelines_application_of_EU_Reg_2022-2560.pdf`

**Used for:** Regulatory compliance, market design interpretation

## Data Update Schedule

- **Energy Prices:** Updated every 24 hours from ENTSO-E and EIA APIs
- **Material Properties:** Static data, validated quarterly
- **Carbon Prices:** Updated monthly from EU ETS auction results
- **Subsidy Information:** Reviewed quarterly, updated when policy changes occur

## Data Quality & Verification

All data sources undergo a validation process:

1. **Authenticity:** Only official sources (government agencies, research institutions, peer-reviewed publications)
2. **Timeliness:** Automated alerts when data ages beyond acceptable thresholds
3. **Completeness:** Cross-validation between multiple sources
4. **Accuracy:** Statistical checks for outliers and anomalies

For data quality reports, see: `backend/data/audit_report.json`

## Contact & Contributions

To suggest additional data sources or report data quality issues:
- Review the data audit report: `DATA_AUDIT_AND_CLEANUP.md`
- Check update procedures: `HOW_TO_UPDATE_ENERGY_PRICES.md`
- PDF integration guide: `HOW_TO_ADD_PDFS.md`

---

*Last Updated: October 14, 2025*
*Citation Format: APA 7th Edition*
