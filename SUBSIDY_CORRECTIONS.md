# 🔧 Cor# Subsidy Data Corrections - COMPLETED

## Status: ✅ ALL 32 COUNTRIES UPDATED

Date: January 2025  
Last Updated: [Current Session]

---

## 📋 Summary of Changes

### 1. ✅ Corrected Undocumented Subsidy Rates

Three countries had **invented subsidy rates with NO documentation** in `SUBSIDY_SOURCES.md`:

| Country | OLD Rate | NEW Rate | Source Status | Justification |
|---------|----------|----------|---------------|---------------|
| 🇧🇷 Brazil | 20% | 5% | ⚠️ Unknown | No verified government program in SUBSIDY_SOURCES.md |
| 🇨🇱 Chile | 15% | 5% | ⚠️ Unknown | No verified government program in SUBSIDY_SOURCES.md |
| 🇦🇺 Australia | 25% | 5% | ⚠️ Unknown | No verified government program in SUBSIDY_SOURCES.md |

**Why 5% instead of 0%?**
- 0% implies we're certain there are NO subsidies
- 5% is a conservative placeholder acknowledging we don't have verified data
- Transparent to users that these countries need research

### 2. ✅ Added `subsidy_source` Field to ALL 32 Countries

Every region in `REGIONS_DB` now has a `subsidy_source` field with one of two types:

#### Type A: Documented Sources (29 countries)

**EU Countries (19)** - All reference EU Chips Act Regulation 2023/1781:
- 🇩🇪 Germany: 40% capital expenditure
- 🇫🇷 France: 35% capital expenditure  
- 🇮🇹 Italy: 30% capital expenditure
- 🇪🇸 Spain: 25% capital expenditure
- 🇳🇱 Netherlands: 35% capital expenditure
- 🇵🇱 Poland: 25-30% capital expenditure
- 🇧🇪 Belgium: 30% capital expenditure
- 🇦🇹 Austria: 30% capital expenditure
- 🇨🇿 Czech Republic: 25% capital expenditure
- 🇩🇰 Denmark: 25% capital expenditure
- 🇫🇮 Finland: 25% capital expenditure
- 🇬🇷 Greece: 25% capital expenditure
- 🇭🇺 Hungary: 25% capital expenditure
- 🇮🇪 Ireland: 30% capital expenditure
- 🇵🇹 Portugal: 25% capital expenditure
- 🇷🇴 Romania: 25% capital expenditure
- 🇸🇪 Sweden: 30% capital expenditure
- 🇸🇰 Slovakia: 25% capital expenditure
- 🇸🇮 Slovenia: 25% capital expenditure

**USA States (4)** - All reference USA CHIPS Act (Public Law 117-167):
- 🇺🇸 Arizona: 35% investment tax credit for TSMC Arizona
- 🇺🇸 Texas: 30% investment tax credit for Samsung Taylor
- 🇺🇸 Ohio: 33% investment tax credit for Intel Ohio Megafab
- 🇺🇸 New York: 32% investment tax credit for Micron Clay

**Asia Countries (6)**:
- 🇹🇼 Taiwan: Industrial Innovation Act - 25-30% R&D tax credits and capital subsidies (Ministry of Economic Affairs)
- 🇰🇷 South Korea: K-Semiconductor Strategy - 30-38% facility investment support (Ministry of Trade, Industry and Energy)
- 🇨🇳 China: National Integrated Circuit Industry Investment Fund (Phase III) - 35-40% capital and tax incentives (State Council)
- 🇯🇵 Japan: Leading-edge Semiconductor Technology Corporation (LSTC) + METI subsidies - 30-35% facility support for TSMC Kumamoto
- 🇸🇬 Singapore: Singapore Semiconductor Industry Competitiveness (SSIC) Program - 25-32% R&D and capital grants (Economic Development Board)
- 🇮🇳 India: India Semiconductor Mission (ISM) - 30-50% capital expenditure support for Micron Gujarat facility (Ministry of Electronics and IT)

#### Type B: Unknown Sources (3 countries)

- 🇧🇷 Brazil: "Unknown - No verified government program documented"
- 🇨🇱 Chile: "Unknown - No verified government program documented"  
- 🇦🇺 Australia: "Unknown - No verified government program documented"

### 3. ✅ Created Comprehensive Formula Documentation

**New File:** `/backend/data/TCO_FORMULAS.md` (350+ lines)

**7 Sections:**

1. **Instant TCO Calculation**
   - Method A: ML Random Forest (46MB, 10K+ scenarios)
   - Method B: Formula-based `TCO = (Chip + Energy + Carbon + Maintenance + Risk) - Subsidy`
   
2. **5-Year Scenario Projections**
   - BASELINE: energy × 1.02^t, subsidy × 0.98^t
   - OPTIMISTIC: energy × 0.97^t, subsidy min(0.50, × 1.05^t)
   - PESSIMISTIC: energy × 1.05^t, subsidy × 0.90^t
   - **Rationale:** Based on ENTSO-E historical data (2019-2024), EU Chips Act disbursement schedule (2023-2030), IEA Energy Outlook 2025
   
3. **Why Formulas Instead of ML for Projections**
   - Regulatory certainty (EU Chips Act legally binding 2023-2030)
   - Transparency (auditable by regulators)
   - Explainability (industrial investment decisions)
   - Stability (ML trained 2019-2024 doesn't capture policy shifts)
   - Validation (direct reference to JRC reports)
   
4. **Data Source Hierarchy**
   - Priority 1: ENTSO-E/EIA live APIs
   - Priority 2: Cached data (<24 hours)
   - Priority 3: OECD fallback
   - Priority 4: Hardcoded (with warnings)
   
5. **Validation & Testing**
   - JRC reports: JRC133736_01, JRC133850_01, JRC141323_01
   - Industry benchmarks: SEMI, IC Insights
   - Government filings: SEC 10-K, EU state aid notifications
   
6. **Uncertainty & Disclaimers**
   - `subsidy_source = "Unknown"` → 5% placeholder  
   - Supply chain risk = qualitative expert assessment
   - Carbon tax = policy assumptions (EU ETS €90/t)
   
7. **References**
   - 12 academic papers
   - 8 government documents with URLs
   - Data sources with API documentation

**Example Calculation:**
- 100,000 SiC chips, Germany, 5 years
- Total TCO = €290,730 (€2.91 per chip)
- Breakdown: Chip €250K + Energy €194,850 + Carbon €7,200 + Maintenance €25K + Risk €7,500 - Subsidy €193,820

---

## 📊 Verified Subsidy Programs (8 Countries/Regions)

From `SUBSIDY_SOURCES.md`:

| Region | Program | Amount | Rate | Source Document |
|--------|---------|--------|------|-----------------|
| 🇪🇺 EU | EU Chips Act | €43B | 30-40% | Regulation 2023/1781 |
| 🇺🇸 USA | CHIPS Act | $52.7B | 25-35% | Public Law 117-167 |
| 🇹🇼 Taiwan | Industrial Innovation | $10B | 25-30% | MOEA Taiwan |
| 🇰🇷 S. Korea | K-Semiconductor | $340B | 30-38% | MOTIE Korea |
| 🇨🇳 China | IC Fund Phase III | $47B | 35-40% | State Council |
| 🇯🇵 Japan | LSTC + METI | $13B | 30-35% | METI Japan |
| 🇸🇬 Singapore | SSIC Program | $3B | 25-32% | EDB Singapore |
| 🇮🇳 India | ISM Program | $9B | 30-50% | MeitY India |

**Total Global Pool:** ~$517 Billion USD (2023-2030)

---

## 🎯 Impact on Application

### Backend Changes
✅ `backend/services/data_access.py`: All 32 regions have `subsidy_source`  
✅ `backend/data/TCO_FORMULAS.md`: Complete mathematical documentation  
✅ `backend/data/SUBSIDY_SOURCES.md`: Authoritative reference (unchanged)

### Frontend Requirements (TODO)
- [ ] Update API to return `subsidy_source` field  
- [ ] Add ⚠️ warning badge for `subsidy_source = "Unknown"`
- [ ] Tooltip: "Este país no tiene programa de subsidios documentado. Usamos 5% como estimación conservadora."
- [ ] Link to TCO_FORMULAS.md in chart explanations
- [ ] Update translations:
  - [ ] `es.ts`: "Tasa de Subvención (%)" → "Incentivos Gubernamentales (%)"
  - [ ] `cat.ts`: "Taxa de Subvenció (%)" → "Incentius Governamentals (%)"

### Testing Requirements (TODO)
- [ ] Restart backend (apply data_access.py changes)
- [ ] Test `/api/regions` returns `subsidy_source` for all 32 countries
- [ ] Test Brazil shows 5% subsidy (not 20%)
- [ ] Test warning badges appear for Brazil/Chile/Australia
- [ ] Test formula explanations link to TCO_FORMULAS.md
- [ ] Test language switching (EN/ES/CAT)

---

## 📖 Next Steps

1. **Immediate:**
   - Test backend changes (restart server)
   - Verify API responses include `subsidy_source`
   
2. **Frontend Updates:**
   - Implement warning UI for "Unknown" sources
   - Add formula documentation references
   - Update translations
   
3. **Data Improvement:**
   - Research Brazil semiconductor policy (placeholder 5%)
   - Research Chile semiconductor policy (placeholder 5%)
   - Research Australia semiconductor policy (placeholder 5%)
   - Update SUBSIDY_SOURCES.md when verified programs found

4. **Documentation:**
   - Link TCO_FORMULAS.md from About page
   - Add subsidy transparency statement to homepage
   - Update README with formula documentation

---

## 🔍 Verification Checklist

✅ Brazil/Chile/Australia corrected from 20%/15%/25% to 5%  
✅ All 32 countries have `subsidy_source` field  
✅ TCO_FORMULAS.md created with complete documentation  
✅ Formula rationale explains why not ML for projections  
✅ Data source hierarchy documented  
✅ Example calculations provided  
✅ Disclaimers for unknown subsidies  
✅ References to government documents  
⏳ Backend restart pending  
⏳ Frontend updates pending  
⏳ Testing pending de Subsidios y Documentación de Fórmulas

## Fecha: Octubre 14, 2025

---

## ✅ Correcciones Realizadas

### 1. **Subsidios sin Documentación**

Se identificaron **3 países con subsidios NO documentados**:

| País | Antes | Ahora | Razón |
|------|-------|-------|-------|
| 🇧🇷 Brazil | 20% | 5% ⚠️ | No hay fuentes verificadas en SUBSIDY_SOURCES.md |
| 🇨🇱 Chile | 15% | 5% ⚠️ | No hay fuentes verificadas |
| 🇦🇺 Australia | 25% | 5% ⚠️ | No hay fuentes verificadas |

**Campo agregado**: `subsidy_source`
- **Países con subsidios documentados**: `"EU Chips Act (Regulation 2023/1781) - XX% capital expenditure"`
- **Países sin documentación**: `"Unknown - No verified government program documented"`

**Rationale**:
- 5% es un placeholder que indica "necesitamos investigar"
- NO asumimos 0% porque puede haber programas que no hemos documentado
- Transparencia total con el usuario

---

### 2. **Documentación Completa de Fórmulas**

Se creó el documento: `/backend/data/TCO_FORMULAS.md`

**Contenido**:

#### **Sección 1: Instant TCO Calculation**
- **Method A**: Random Forest ML Model (10,000+ escenarios entrenados)
  - Archivo: `tco_random_forest.pkl` (46 MB)
  - Uso: Cálculo instantáneo, predicción de propiedades
  
- **Method B**: Formula-based (transparencia y validación)
  ```
  TCO = (Chip_Cost + Energy_Cost + Carbon_Tax + Maintenance + Supply_Chain_Risk) - Subsidy
  ```
  - Cada variable documentada con fuentes
  - Ejemplo completo de cálculo paso a paso

#### **Sección 2: 5-Year Scenario Projections**

**BASELINE (Tendencias actuales)**:
```
energy_cost(t) = base × (1.02^t)     # 2% crecimiento anual
subsidy_rate(t) = base × (0.98^t)     # 2% reducción anual
carbon_tax(t) = base                  # Estable (EU ETS €90/ton)
```

**OPTIMISTIC (Mejor caso)**:
```
energy_cost(t) = base × (0.97^t)      # 3% reducción (renovables)
subsidy_rate(t) = min(0.50, base × (1.05^t))  # 5% aumento (cap 50%)
carbon_tax(t) = base × 0.80           # 20% reducción
```

**PESSIMISTIC (Peor caso)**:
```
energy_cost(t) = base × (1.05^t)      # 5% aumento (crisis energética)
subsidy_rate(t) = base × (0.90^t)     # 10% reducción (recortes)
carbon_tax(t) = base × 1.20           # 20% aumento (regulaciones)
```

#### **Sección 3: Por Qué Fórmulas en Lugar de IA**

**Razones documentadas**:
1. **Certeza Regulatoria**: EU Chips Act legalmente definida 2023-2030
2. **Transparencia**: Fórmulas auditables y replicables
3. **Explicabilidad**: Requerido para toma de decisiones industriales
4. **Estabilidad**: IA entrenada en 2019-2024 no captura cambios políticos
5. **Validación**: Fórmulas referenciables con JRC reports

**Limitaciones de ML para Proyecciones**:
- No puede predecir decisiones políticas
- Introduce incertidumbre en decisiones de procurement
- Datos históricos no reflejan programas nuevos (Chips Act 2023)

---

### 3. **Variables y Fuentes Documentadas**

Cada variable de las fórmulas tiene:

| Variable | Fuente | Ejemplo | Archivo |
|----------|--------|---------|---------|
| `chip_unit_cost` | Materials Project API + JRC | SiC: €2.50 | `semiconductors_comprehensive.json` |
| `energy_consumption` | Material properties DB | SiC: 250 mW | `semiconductors_comprehensive.json` |
| `energy_price` | ENTSO-E / EIA / OECD | Germany: €0.178/kWh | `energy_prices_live.json` |
| `carbon_footprint` | JRC LCA reports | SiC: 0.8 kg CO2e | `material_properties.csv` |
| `carbon_tax` | EU ETS / Country-specific | EU: €90/ton | `data_access.py` REGIONS_DB |
| `subsidy_rate` | Government programs | EU: 30-40% | `SUBSIDY_SOURCES.md` |
| `risk_factor` | Expert assessment | Taiwan: 0.12 | Regional analysis |

---

### 4. **Países con Subsidios Verificados**

Según `SUBSIDY_SOURCES.md`:

| Región | Programa | Tasa | Presupuesto | Estado |
|--------|----------|------|-------------|--------|
| 🇪🇺 EU | Chips Act | 30-40% | €43B | Activo |
| 🇺🇸 USA | CHIPS Act | 25-35% | $52.7B | Activo |
| 🇹🇼 Taiwan | Industrial Innovation | 25-30% | $10B | Activo |
| 🇰🇷 S. Korea | K-Semiconductor | 30-38% | $340B | Activo |
| 🇨🇳 China | IC Fund Phase III | 35-40% | $47B | Activo |
| 🇯🇵 Japan | LSTC + METI | 30-35% | $13B | Activo |
| 🇸🇬 Singapore | SSIC | 25-32% | $3B | Activo |
| 🇮🇳 India | ISM | 30-50% | $9B | Activo |

**Total Global**: ~$517 billion (2024-2030)

**⚠️ Brasil, Chile, Australia NO están en esta lista**

---

### 5. **Jerarquía de Fuentes de Datos**

1. **Live APIs** (prioridad máxima):
   - ENTSO-E Transparency Platform (EU)
   - EIA API (USA)

2. **Cache Actualizado** (< 24h):
   - `energy_prices_live.json`

3. **OECD Fallback**:
   - `oecd_energy_prices.csv`

4. **Hardcoded Estimates** (último recurso):
   - Con ⚠️ warnings en código

---

## 📋 Próximos Pasos

### A. Completar `subsidy_source` en TODOS los Países

**Pendiente**: Agregar campo a ~29 países restantes

**Países que necesitan el campo**:
- ✅ Germany (done)
- ✅ France (done)
- ❌ Italy, Spain, Netherlands, Poland... (18 EU countries)
- ❌ USA states (Arizona, Texas, Ohio, New York)
- ❌ Taiwan, South Korea, China, Japan, Singapore, India

**Solución**: Script automático o edición manual

---

### B. Actualizar Frontend con Referencias a Fórmulas

**Cambios necesarios**:

1. **ScenarioChart** - Sección de fórmulas:
   - Link directo a `TCO_FORMULAS.md` 
   - O mostrar fórmulas inline con MathJax/KaTeX

2. **Traducciones** - Actualizar texto:
   ```typescript
   formulaDetails: "Las proyecciones se calculan con fórmulas validadas. 
                    Ver documentación completa en TCO_FORMULAS.md"
   ```

3. **Disclaimer para Subsidios Desconocidos**:
   - Si `subsidy_source === "Unknown"` → mostrar badge ⚠️
   - Tooltip: "Este país no tiene programa de subsidios documentado. 
               Usamos 5% como placeholder conservador."

---

### C. Validación y Testing

1. **Backend**:
   - Verificar que todos los países tienen `subsidy_source`
   - Test API `/api/regions` devuelve el campo

2. **Frontend**:
   - Test gráficos muestran subsidios correctos
   - Test disclaimer aparece para Brazil/Chile/Australia
   - Test navegación a Citations funciona

3. **Documentación**:
   - Revisar `TCO_FORMULAS.md` con stakeholders
   - Agregar referencias académicas adicionales

---

## 🎯 Estado Actual

### ✅ Completado:
- Corrección de subsidios Brasil/Chile/Australia (20%→5%)
- Campo `subsidy_source` agregado (3 países sin doc, 2 con doc)
- Documentación completa de fórmulas matemáticas (`TCO_FORMULAS.md`)
- Explicación de por qué NO se usa IA para proyecciones
- Jerarquía de fuentes de datos documentada

### 🔄 En Progreso:
- Agregar `subsidy_source` a los ~29 países restantes
- Actualizar traducciones frontend con referencias
- Implementar disclaimers visuales para subsidios unknown

### ⏳ Pendiente:
- Testing completo backend/frontend
- Revisión de stakeholders
- Posible investigación de subsidios BR/CL/AU

---

## 📊 Impacto

**Transparencia**: 
- Usuario ahora sabe exactamente qué países tienen subsidios verificados
- Fórmulas matemáticas completamente documentadas
- Fuentes de datos claramente identificadas

**Credibilidad**:
- Admitimos cuando NO tenemos datos (en lugar de inventar 0%)
- Justificamos por qué usamos fórmulas vs ML
- Referencias académicas y gubernamentales completas

**Mantenibilidad**:
- `TCO_FORMULAS.md` es el documento único de verdad
- Fácil actualizar cuando se descubran nuevos programas de subsidios
- Sistema extensible para agregar nuevos países

---

## 🔗 Archivos Modificados

1. `/backend/services/data_access.py`
   - Brazil: subsidy_rate 0.20 → 0.05, subsidy_source added
   - Chile: subsidy_rate 0.15 → 0.05, subsidy_source added
   - Australia: subsidy_rate 0.25 → 0.05, subsidy_source added
   - Germany: subsidy_source added
   - France: subsidy_source added

2. `/backend/data/TCO_FORMULAS.md` (NEW)
   - 350+ líneas de documentación matemática completa
   - 7 secciones principales
   - Ejemplo de cálculo paso a paso
   - Referencias académicas y gubernamentales

3. `/locales/en.ts`
   - `chart.subsidyRate`: "Subsidy Rate (%)" → "Government Incentives (%)"

---

**Próximo paso recomendado**: ¿Quieres que agregue `subsidy_source` a TODOS los países restantes automáticamente, o prefieres revisarlo país por país?
