# Dashboard Data Issues - Analysis & Fixes

## 🔴 PROBLEMAS CRÍTICOS DETECTADOS

### 1. **Regiones Inexistentes en ScenarioChart.tsx**

**Problema**: El dashboard usa regiones que NO existen en los datos:
```typescript
const topRegions = ['Germany', 'France', 'Netherlands', 'Ireland', 'Spain', 
                    'Texas', 'California', 'Arizona', 'Ohio', 'Taiwan', 
                    'South Korea', 'Japan', 'Singapore'];
```

**Error en Logs**:
```
❌ Invalid input: Region 'California' not found
❌ Invalid input: Region 'California' not found (repetido múltiples veces)
```

**Regiones Reales Disponibles** (según `global_electricity_data_2025.json`):
- ✅ Europa: Poland, Germany, France, Italy, Spain, Netherlands, Sweden, Belgium
- ✅ Asia: Taiwan, South Korea, China, Japan
- ✅ USA: **United States** (solo país, NO estados individuales)
- ❌ NO existen: Texas, California, Arizona, Ohio, New York, Ireland, Singapore

**Causa Raíz**: 
- El dataset Mendeley (DOI:10.17632/s54n4tyyz4.3) solo tiene **13 países**
- Los estados de USA están agregados en "United States"
- No hay datos individuales por estado (Texas, California, etc.)

---

### 2. **Falta de APIs en Tiempo Real - ¿Por Qué No Se Usan?**

**APIs Disponibles vs Uso Real**:

#### ✅ **ENTSO-E API (Tiempo Real)**
- **Estado**: Implementada en `fetch_energy_prices.py`
- **Uso Actual**: ⚠️ Solo en endpoint admin `/api/admin/update-energy-prices`
- **NO usada en producción** para cálculos TCO
- **Razón**: Los logs muestran `✅ Loaded 19 energy prices from cache (age: 7.5h)` 
- **Problema**: Los dashboards usan datos del JSON estático, NO de ENTSO-E en tiempo real

#### ✅ **IEA Carbon Intensity**
- **Estado**: Datos estáticos en JSON
- **No hay API en tiempo real** (IEA no ofrece API pública)
- **Actualización**: Manual, agregada en `global_electricity_data_2025.json`

#### ❌ **Materials Project API**
- **Estado**: Comentada, nunca implementada
- **Uso**: No se usa

#### ❌ **OECD API**
- **Estado**: No implementada
- **Uso**: No se usa

---

### 3. **Dashboard "Perspectiva Regional 5 Años" No Se Ve**

**Dashboard**: `EnhancedScenarioChart.tsx` (Multi-Region TCO Trend Analysis)

**Problema Detectado**: 
1. **Regiones por defecto incorrectas**:
```typescript
const defaultRegions = ['Germany', 'France', 'Texas', 'Japan', 'South Korea', 'Taiwan', 'India', 'Brazil'];
```
- ❌ Texas no existe → falla la carga
- ❌ India no existe en el JSON
- ❌ Brazil no existe en el JSON

2. **Estados disponibles reales**: Solo 13 países (ver arriba)

3. **Endpoint `/api/scenarios`** funciona, pero regiones inválidas causan error 400

---

### 4. **Cache de ENTSO-E vs Datos Mendeley**

**Confusión de Fuentes**:
- Los logs dicen: `✅ Updated 16/32 regions with live energy prices`
- Pero los cálculos TCO usan el JSON estático de Mendeley
- ENTSO-E solo actualiza 16 regiones EU, no las 32 del sistema

**Arquitectura Actual**:
```
1. JSON Mendeley (13 países) → DATOS BASE
2. ENTSO-E cache (7.5h antiguo) → Solo endpoint admin
3. Dashboards → Leen del JSON, NO de ENTSO-E
```

---

## 🔧 SOLUCIONES IMPLEMENTADAS

### Fix 1: Corregir Regiones en ScenarioChart.tsx
```typescript
// ANTES (incorrecto):
const topRegions = ['Germany', 'France', 'Netherlands', 'Ireland', 'Spain', 
                    'Texas', 'California', 'Arizona', 'Ohio', 'Taiwan', 
                    'South Korea', 'Japan', 'Singapore'];

// DESPUÉS (correcto - solo países que existen):
const topRegions = ['Germany', 'France', 'Netherlands', 'Spain', 'Belgium', 
                    'United States', 'Taiwan', 'South Korea', 'Japan', 'China'];
```

### Fix 2: Corregir EnhancedScenarioChart.tsx
```typescript
// ANTES (incorrecto):
const defaultRegions = ['Germany', 'France', 'Texas', 'Japan', 'South Korea', 'Taiwan', 'India', 'Brazil'];

// DESPUÉS (correcto):
const defaultRegions = ['Germany', 'France', 'United States', 'Japan', 'South Korea', 'Taiwan', 'China', 'Poland'];
```

### Fix 3: Activar ENTSO-E en Tiempo Real

**Opción A: Mantener Sistema Actual (Recomendado)**
- ✅ Mendeley dataset como base (13 países bien documentados)
- ✅ ENTSO-E como actualización opcional para EU (via admin endpoint)
- ✅ Refresh trimestral con Cloud Scheduler
- **Razón**: Mendeley es más completo (Asia, USA) vs ENTSO-E (solo EU)

**Opción B: Integrar ENTSO-E en Producción** (Más Complejo)
- Modificar `/api/regions` para llamar ENTSO-E en cada request
- Problema: Solo cubre EU, deja fuera USA/Asia
- Problema: Latencia de API externa en cada cálculo TCO

---

## 📊 REGIONES REALES DISPONIBLES

### **Lista Completa (13 países en JSON)**:
1. 🇵🇱 Poland - €0.171/kWh
2. 🇩🇪 Germany - €0.178/kWh  
3. 🇫🇷 France - €0.123/kWh
4. 🇮🇹 Italy - €0.232/kWh
5. 🇪🇸 Spain - €0.127/kWh
6. 🇳🇱 Netherlands - €0.145/kWh
7. 🇸🇪 Sweden - €0.089/kWh
8. 🇧🇪 Belgium - €0.195/kWh
9. 🇹🇼 Taiwan - €0.068/kWh
10. 🇰🇷 South Korea - €0.092/kWh
11. 🇺🇸 United States - €0.082/kWh (agregado nacional)
12. 🇨🇳 China - €0.075/kWh
13. 🇯🇵 Japan - €0.145/kWh

### **Regiones NO Disponibles** (causan error 400):
- ❌ Texas, California, Arizona, Ohio, New York (USA states)
- ❌ Ireland, Portugal, Austria, Denmark, Czech Republic (EU)
- ❌ Singapore, Malaysia (Asia-Pacific)
- ❌ Brazil, Mexico, Chile (Latin America)

**Nota**: Estas regiones están en el código de INPUT FORM (dropdowns), pero NO en los datos JSON

---

## 🚀 RECOMENDACIONES

### Corto Plazo (Urgente):
1. ✅ **Fix regiones en dashboards** (ScenarioChart, EnhancedScenarioChart)
2. ✅ **Sincronizar dropdowns con datos reales** (InputForm usa 32 regiones pero solo 13 tienen datos)
3. ✅ **Agregar validación en backend** para regiones inexistentes

### Medio Plazo:
1. **Expandir dataset Mendeley**:
   - Añadir estados USA individuales (Texas $0.08, California $0.15)
   - Completar EU (Ireland, Portugal, Austria, etc.)
   - Añadir Asia-Pacific (Singapore, Malaysia)
   
2. **Activar ENTSO-E en tiempo real**:
   - Modificar `/api/regions` para actualizar precios EU dinámicamente
   - Mantener Mendeley como fallback para regiones no-EU

3. **Crear `/api/admin/expand-regions`**:
   - Endpoint para añadir manualmente nuevas regiones
   - Validación de datos antes de guardar en JSON

### Largo Plazo:
1. **Migrar a Cloud Storage** (como documentado en CLOUD_INFRASTRUCTURE_RECOMMENDATIONS.md)
2. **Implementar DataService class** para centralizar carga de datos
3. **Setup Cloud Scheduler** para refresh trimestral Mendeley + IEA

---

## 📝 ARCHIVOS A MODIFICAR

1. ✅ `/components/ScenarioChart.tsx` - Corregir topRegions array
2. ✅ `/components/EnhancedScenarioChart.tsx` - Corregir defaultRegions array
3. ⚠️ `/components/InputForm.tsx` - Dropdowns tienen 32 regiones, datos solo 13
4. ⚠️ `/backend/data/global_electricity_data_2025.json` - Expandir con más países

---

## 🔍 ANÁLISIS API EN TIEMPO REAL

### ¿Por Qué No Usamos ENTSO-E API en Producción?

**Razones Actuales**:
1. **Cobertura Limitada**: ENTSO-E solo cubre EU (19 países), Mendeley cubre global (13+ países)
2. **Latencia**: Llamada API externa añade 200-500ms por request
3. **Rate Limits**: ENTSO-E tiene límites de requests/día
4. **Datos No Completos**: ENTSO-E da precios, pero faltan subsidios/carbono/grid mix

**Solución Híbrida Propuesta**:
```python
# backend/services/energy_service.py
async def get_region_energy(region_code: str):
    # 1. Cargar base desde Mendeley JSON
    base_data = load_mendeley_data(region_code)
    
    # 2. Si es región EU, actualizar precio con ENTSO-E
    if region_code in EU_REGIONS:
        live_price = await fetch_entsoe_price(region_code)
        base_data['price_eur_kwh'] = live_price
    
    # 3. Devolver datos híbridos
    return base_data
```

**Beneficio**: Precios EU en tiempo real + datos completos de Mendeley para todas las regiones
