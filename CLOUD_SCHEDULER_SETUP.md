# CLOUD SCHEDULER CONFIGURATION - REAL-TIME PRICE UPDATES

## 📊 Resumen de Implementación

### ✅ Completado

1. **`fetch_eia_prices.py`** - Script para actualizar precios USA desde EIA API
2. **`setup_cloud_schedulers_realtime.sh`** - Script para configurar schedulers en GCP
3. **Arquitectura híbrida** - Mendeley + ENTSO-E + EIA

### 🔄 Cloud Schedulers Configurados

#### Tiempo Real (setup_cloud_schedulers_realtime.sh)

| Job | Frecuencia | Regiones | API | Descripción |
|-----|-----------|----------|-----|-------------|
| **refresh-entsoe-prices** | Cada 8 horas | 19 países EU | ENTSO-E | Precios día-a-día EU (00:00, 08:00, 16:00 CET) |
| **refresh-eia-prices** | Diario 06:00 EST | 5 estados USA | EIA | Precios día-a-día USA (CA, TX, AZ, OH, NY) |

#### Datos Base (setup_cloud_schedulers.sh)

| Job | Frecuencia | Fuente | Descripción |
|-----|-----------|--------|-------------|
| **refresh-mendeley-electricity-data** | Trimestral | Mendeley | Datos base electricidad (13 países) |
| **refresh-iea-carbon-intensity** | Anual | IEA | Intensidad carbono redes eléctricas |
| **retrain-ml-model** | Trimestral | - | Reentrenar Random Forest con datos actualizados |

### 🌍 Cobertura de Regiones

#### Regiones Actuales (13)
- **EU (8)**: Poland, Germany, France, Italy, Spain, Netherlands, Sweden, Belgium
  - **Live ENTSO-E**: 6/8 regiones (Germany, France, Italy, Spain, Netherlands, Belgium)
- **Asia (4)**: Taiwan, South Korea, China, Japan (datos Mendeley estáticos)
- **USA (1)**: United States (agregado nacional, datos Mendeley estáticos)

#### Expansión Planificada con EIA (+5 regiones → 18 total)
- **California** (CAISO)
- **Texas** (ERCOT)
- **Arizona** (Southwest)
- **Ohio** (PJM)
- **New York** (NYISO)

**Resultado**: 11/18 regiones con precios live (61%)

### ⚠️ Pendiente de Verificación

#### EIA API - Endpoint Correcto
El script `fetch_eia_prices.py` está implementado pero necesita verificación:

**Problema**: Los precios devueltos están incorrectos (~€700/kWh vs ~€0.05/kWh esperado)

**Posibles causas**:
1. Endpoint incorrecto - EIA tiene múltiples endpoints:
   - `/electricity/rto/daily-region-data/` (Real-Time Grid Monitor)
   - `/electricity/retail-sales/` (Retail prices)
   - `/electricity/state-electricity-profiles/` (State profiles)

2. Unidades incorrectas - Puede estar en:
   - $/kWh en lugar de $/MWh
   - Cents/kWh
   - Mills/kWh (1 mill = $0.001)

3. Tipo de precio incorrecto:
   - Day-ahead (D) 
   - Real-time (RT)
   - Load-weighted price (LMP)

**Acción requerida**:
```bash
# Investigar endpoint correcto en documentación EIA
https://www.eia.gov/opendata/browser/electricity

# Probar diferentes endpoints
curl "https://api.eia.gov/v2/electricity/retail-sales/?api_key=KEY"
```

### 📋 Próximos Pasos

#### 1. Verificar EIA API (30 min)
- [ ] Revisar documentación EIA v2
- [ ] Identificar endpoint correcto para precios industriales por estado
- [ ] Ajustar conversión de unidades en `fetch_eia_prices.py`

#### 2. Añadir 5 Estados USA al Mendeley JSON (45 min)
Una vez verificado el precio correcto, añadir a `global_electricity_data_2025.json`:
```json
{
  "country": "California",
  "price_eur_kwh": 0.047,
  "carbon_intensity_g_co2_kwh": 200,
  "subsidy_rate": 0.30,
  "chips_act_eligible": true
}
```

#### 3. Integrar EIA en data_access.py (20 min)
Crear función `_update_regions_with_eia()` similar a `_update_regions_with_entsoe()`

#### 4. Implementar Admin Endpoints (1 hora)
En `backend/routers/admin.py`:
```python
@router.post("/refresh-prices/entsoe")
async def refresh_entsoe_prices():
    """Triggered by Cloud Scheduler every 8h"""
    from backend.utils.fetch_energy_prices import update_energy_prices_cache
    result = update_energy_prices_cache()
    return {"status": "success", "updated": len(result)}

@router.post("/refresh-prices/eia")
async def refresh_eia_prices():
    """Triggered by Cloud Scheduler daily"""
    from backend.utils.fetch_eia_prices import update_eia_prices_cache
    result = update_eia_prices_cache()
    return {"status": "success", "updated": len(result["prices"])}
```

#### 5. Desplegar y Configurar Schedulers (30 min)
```bash
# 1. Desplegar backend a Cloud Run
cd backend
gcloud run deploy tco-calculator-backend --source .

# 2. Configurar schedulers base (Mendeley, IEA, ML)
./setup_cloud_schedulers.sh YOUR_PROJECT_ID YOUR_BACKEND_URL

# 3. Configurar schedulers tiempo real (ENTSO-E, EIA)
./setup_cloud_schedulers_realtime.sh YOUR_PROJECT_ID YOUR_BACKEND_URL

# 4. Verificar jobs creados
gcloud scheduler jobs list --location=europe-west1
```

### 💰 Costos GCP Estimados

#### Cloud Scheduler
- **5 jobs totales** × $0.10/job/mes = **$0.50/mes**

#### Cloud Run Invocations
- **ENTSO-E**: 3 ejecuciones/día × 30 días = 90 ejecuciones/mes
- **EIA**: 1 ejecución/día × 30 días = 30 ejecuciones/mes
- **Mendeley**: 1 ejecución/trimestre = 0.33 ejecuciones/mes
- **IEA**: 1 ejecución/año = 0.08 ejecuciones/mes
- **ML retrain**: 1 ejecución/trimestre = 0.33 ejecuciones/mes
- **Total**: ~120 ejecuciones/mes × $0.40/millón = **$0.05/mes**

#### Storage (caches)
- `energy_prices_live.json`: ~50 KB
- `eia_prices_cache.json`: ~5 KB
- Total: ~55 KB = **$0.001/mes**

**TOTAL ESTIMADO**: **~$0.56/mes** (~€0.52/mes)

### 🎯 Estado Actual vs Objetivo

| Métrica | Actual | Con EIA | Objetivo Final |
|---------|--------|---------|----------------|
| Regiones totales | 13 | 18 | 32 |
| Regiones live | 6 | 11 | 24 |
| % Live | 46% | 61% | 75% |
| APIs activas | 1 (ENTSO-E) | 2 (ENTSO-E + EIA) | 2 |
| Update freq EU | 8h | 8h | 8h |
| Update freq USA | - | 24h | 24h |
| Update freq Asia | - | - | Manual |

### 📚 Documentación Relacionada

- `backend/utils/fetch_energy_prices.py` - ENTSO-E integration (✅ Working)
- `backend/utils/fetch_eia_prices.py` - EIA integration (⚠️ Needs verification)
- `backend/setup_cloud_schedulers.sh` - Base schedulers (quarterly/annual)
- `backend/setup_cloud_schedulers_realtime.sh` - Real-time schedulers (hourly/daily)
- `CRITICAL_DASHBOARD_API_ANALYSIS.md` - Architecture analysis
- `HYBRID_DATA_ARCHITECTURE_ACTIVATED.md` - Implementation summary

### ✅ Testing

```bash
# Test ENTSO-E integration (working)
cd backend
source venv/bin/activate
export $(cat .env | xargs)
python -m utils.fetch_energy_prices

# Test EIA integration (needs fixing)
python -m utils.fetch_eia_prices

# Test data loading
python -c "
from services.data_access import REGIONS_DB
print(f'Loaded {len(REGIONS_DB)} regions')
"
```

---

**Created**: 2025-10-15  
**Status**: ENTSO-E ✅ | EIA ⚠️ (endpoint verification needed)  
**Next**: Verify EIA API endpoint and units
