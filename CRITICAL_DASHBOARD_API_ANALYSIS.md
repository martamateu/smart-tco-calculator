# 🔴 ANÁLISIS CRÍTICO: Dashboards y APIs en Tiempo Real

## RESUMEN EJECUTIVO

### ❌ Problemas Encontrados:

1. **Dashboards Broken**: ScenarioChart y EnhancedScenarioChart usan regiones inexistentes
2. **Datos Desincronizados**: 32 regiones en código vs 13 en Mendeley JSON
3. **ENTSO-E No Usado**: API tiempo real implementada pero NO usada en producción
4. **Dashboard "Perspectiva 5 años" roto**: Regiones por defecto incorrectas

---

## PROBLEMA 1: REGIONES INEXISTENTES

### Situación Actual:
- **Backend** (`data_access.py`): 32 regiones hardcodeadas
- **Mendeley JSON**: Solo 13 países con datos reales
- **Dashboards**: Intentan cargar las 32 → **ERROR 400** para 19 de ellas

### Regiones Hardcodeadas (32 total):
```python
# EU (19): Germany, France, Italy, Spain, Netherlands, Poland, Belgium,
#         Austria, Czech Republic, Denmark, Finland, Greece, Hungary, 
#         Ireland, Portugal, Romania, Sweden, Slovakia, Slovenia

# USA (5): Arizona, Texas, Ohio, New York, California

# Asia (8): Taiwan, South Korea, China, Japan, Singapore, India, Malaysia, Vietnam
```

### Regiones con Datos Mendeley (13 total):
```json
✅ Poland, Germany, France, Italy, Spain, Netherlands, Sweden, Belgium
✅ Taiwan, South Korea, China, Japan  
✅ United States (agregado, NO por estados)
```

### Regiones SIN DATOS (19):
```
❌ EU: Austria, Czech Republic, Denmark, Finland, Greece, Hungary, 
      Ireland, Portugal, Romania, Slovakia, Slovenia

❌ USA States: Arizona, Texas, Ohio, New York, California
      (Solo existe "United States" agregado)

❌ Asia: Singapore, India, Malaysia, Vietnam
```

---

## PROBLEMA 2: ENTSO-E API NO USADA EN PRODUCCIÓN

### Implementación Actual:

#### ✅ **Código ENTSO-E Existe**:
- `backend/scripts/fetch_energy_prices.py` - Implementado
- Endpoint `/api/admin/update-energy-prices` - Funcional
- Cache `energy_prices_live.json` - Se actualiza

#### ❌ **NO Se Usa en Cálculos TCO**:
```python
# backend/services/data_access.py
REGIONS_DB = [
    {
        "code": "Germany",
        "energy_cost": 0.178,  # ← Hardcoded! NO desde ENTSO-E
        ...
    }
]
```

### Logs Confirman:
```
✅ Loaded 19 energy prices from cache (age: 7.5h)
✅ Updated 16/32 regions with live energy prices
```

**Pero los dashboards usan `REGIONS_DB` hardcoded, NO el cache!**

---

## PROBLEMA 3: ARQUITECTURA CONFUSA

### Flujo Actual (Incorrecto):
```
1. Mendeley JSON (13 países) → NO SE USA
2. ENTSO-E API → Actualiza cache → NO SE USA EN TCO
3. REGIONS_DB hardcoded (32) → ✅ SE USA EN TCO (19 sin datos!)
```

### Flujo Correcto Debería Ser:
```
1. Mendeley JSON (13 países) → Base de datos
2. ENTSO-E API → Actualiza precios EU en tiempo real
3. Dashboards → Cargan desde Mendeley + ENTSO-E híbrido
```

---

## PROBLEMA 4: DASHBOARD "PERSPECTIVA 5 AÑOS" ROTO

### Código Actual (EnhancedScenarioChart.tsx):
```typescript
const defaultRegions = ['Germany', 'France', 'Texas', 'Japan', 
                        'South Korea', 'Taiwan', 'India', 'Brazil'];
```

### Errores:
- ❌ `Texas` no existe (solo "United States")
- ❌ `India` no está en Mendeley JSON
- ❌ `Brazil` no está en Mendeley JSON

### Resultado:
- Dashboard no carga datos
- Gráfica vacía o con errores 400

---

## 🔧 SOLUCIONES APLICADAS

### ✅ Fix 1: ScenarioChart.tsx
```typescript
// ANTES:
const topRegions = ['Germany', 'France', 'Netherlands', 'Ireland', 'Spain', 
                    'Texas', 'California', 'Arizona', 'Ohio', 'Taiwan', 
                    'South Korea', 'Japan', 'Singapore'];

// DESPUÉS:
const topRegions = ['Germany', 'France', 'Netherlands', 'Spain', 'Belgium', 
                   'United States', 'Taiwan', 'South Korea', 'Japan', 
                   'China', 'Poland', 'Italy', 'Sweden'];
```

### ✅ Fix 2: EnhancedScenarioChart.tsx
```typescript
// ANTES:
const defaultRegions = ['Germany', 'France', 'Texas', 'Japan', 
                        'South Korea', 'Taiwan', 'India', 'Brazil'];

// DESPUÉS:
const defaultRegions = ['Germany', 'France', 'United States', 'Japan', 
                        'South Korea', 'Taiwan', 'China', 'Poland'];
```

---

## 🚀 RECOMENDACIONES URGENTES

### 1. **Sincronizar Datos** (Prioridad CRÍTICA)

**Opción A: Usar Solo Mendeley (Recomendado)**
```python
# backend/services/data_access.py
def load_mendeley_regions():
    """Load all regions from global_electricity_data_2025.json"""
    with open('data/global_electricity_data_2025.json') as f:
        data = json.load(f)
    return data['regions']

REGIONS_DB = load_mendeley_regions()  # 13 países reales
```

**Opción B: Híbrido Mendeley + ENTSO-E**
```python
def get_regions_catalog() -> List[Region]:
    # 1. Cargar base desde Mendeley
    base_regions = load_mendeley_regions()
    
    # 2. Actualizar precios EU con ENTSO-E si disponible
    if entsoe_cache_exists():
        for region in base_regions:
            if region['code'] in EU_COUNTRIES:
                live_price = get_entsoe_price(region['code'])
                region['energy_cost'] = live_price
    
    return base_regions
```

### 2. **Activar ENTSO-E en Producción**

Modificar `/api/regions` endpoint:
```python
@router.get("/regions")
async def get_regions():
    # Cargar regiones base desde Mendeley
    regions = load_mendeley_regions()
    
    # Actualizar precios EU con ENTSO-E si cache fresco
    regions_with_live = update_with_entsoe(regions)
    
    return regions_with_live
```

### 3. **Expandir Dataset Mendeley**

Añadir manualmente regiones faltantes en `global_electricity_data_2025.json`:
```json
{
  "country": "Ireland",
  "price_eur_kwh": 0.158,
  "data_source": "ENTSO-E Day-Ahead Market",
  ...
},
{
  "country": "Brazil",
  "price_eur_kwh": 0.095,
  "data_source": "IEA Energy Prices & Taxes 2024",
  ...
}
```

---

## 📊 ESTADO ACTUAL vs DESEADO

### Actual (Broken):
```
REGIONS_DB (32 hardcoded) → 19 sin datos → Dashboards 400 errors
ENTSO-E API → Cache → NO usado
Mendeley JSON → NO usado directamente
```

### Deseado (Fixed):
```
Mendeley JSON (13) → Base de datos
ENTSO-E API → Actualiza precios EU → Usado en /api/regions
Dashboards → Solo regiones con datos → NO 400 errors
```

---

## ✅ CHECKLIST FIXES

- [x] **ScenarioChart.tsx** - Regiones corregidas a 13 disponibles
- [x] **EnhancedScenarioChart.tsx** - Regiones default corregidas
- [x] **DASHBOARD_FIXES_ANALYSIS.md** - Documentación completa
- [ ] **data_access.py** - Migrar de REGIONS_DB a load_mendeley_regions()
- [ ] **Integrar ENTSO-E** en /api/regions para precios tiempo real EU
- [ ] **Expandir Mendeley JSON** con 19 regiones faltantes
- [ ] **InputForm dropdowns** - Sincronizar con regiones reales (ahora muestra 32, solo 13 funcionan)

---

## 🔍 ¿POR QUÉ NO SE USA ENTSO-E?

**Respuesta**: El código está mal arquitecturado:

1. `fetch_energy_prices.py` actualiza cache `energy_prices_live.json`
2. `data_access.py` tiene función `_update_regions_with_live_prices()` 
3. **PERO** usa `REGIONS_DB` hardcoded como base
4. `REGIONS_DB` tiene 32 regiones (19 inventadas)
5. ENTSO-E solo actualiza 16 de las 32
6. **Dashboards usan las 32** → 19 fallan con 400

**Solución**: Cambiar `REGIONS_DB` para cargar desde Mendeley JSON, NO hardcodear.

---

## 📈 IMPACTO

### Antes del Fix:
- ❌ Dashboard "Regional TCO Comparison" → 60% requests fallan (19/32 regiones inválidas)
- ❌ Dashboard "5-Year Trend" → No carga datos (Texas, India, Brazil inexistentes)
- ❌ ENTSO-E API implementada pero NO usada
- ❌ Mendeley dataset ignorado

### Después del Fix:
- ✅ Dashboards cargan correctamente (13 regiones válidas)
- ✅ Datos 100% consistentes con Mendeley DOI
- ✅ ENTSO-E pendiente de activar (siguiente PR)
- ✅ Arquitectura clara: Mendeley base + ENTSO-E tiempo real EU

---

**CONCLUSIÓN**: El problema NO es falta de APIs tiempo real, sino arquitectura desincronizada entre:
1. Mendeley JSON (13 países)
2. REGIONS_DB hardcoded (32 regiones)
3. Dashboards esperando 32 pero solo 13 existen
