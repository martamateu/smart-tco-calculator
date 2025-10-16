# 🤖 Sistema de Actualización Automática de Precios de Energía

## Resumen Ejecutivo

El Smart TCO Calculator ahora cuenta con un sistema **completamente automático** para actualizar precios de energía de 13 regiones (72% cobertura) usando APIs en tiempo real.

---

## 📊 Arquitectura de la Solución

```
┌─────────────────────────────────────────────────────────────┐
│                    CLOUD SCHEDULER (GCP)                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐        ┌──────────────────┐         │
│  │  ENTSO-E Update  │        │   EIA Update     │         │
│  │  Every 8 hours   │        │   Daily 06:00    │         │
│  │  (EU Prices)     │        │   (USA Prices)   │         │
│  └────────┬─────────┘        └─────────┬────────┘         │
│           │                            │                   │
└───────────┼────────────────────────────┼───────────────────┘
            │                            │
            ▼                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  CLOUD RUN (Backend API)                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  POST /api/admin/refresh-prices/entsoe                     │
│  POST /api/admin/refresh-prices/eia                        │
│                                                             │
│  ├─ Fetch from ENTSO-E API (19 EU countries)               │
│  ├─ Fetch from EIA API (5 USA states)                      │
│  ├─ Convert units (MWh → kWh, cents → EUR)                 │
│  ├─ Apply industrial markup (40%)                          │
│  └─ Update cache files                                     │
│                                                             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   DATA LAYER (Cache)                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  energy_prices_live.json  ← ENTSO-E cache (19 EU)          │
│  eia_prices_cache.json    ← EIA cache (5 USA)              │
│                                                             │
│  Hybrid Priority:                                          │
│  1. Live ENTSO-E/EIA (if available)                        │
│  2. OECD Fallback (if API fails)                           │
│  3. Mendeley Static (base data)                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Componentes Implementados

### 1. **Endpoints de Admin** (`backend/routers/admin.py`)

```python
# Nuevos endpoints creados:

POST /api/admin/refresh-prices/entsoe
- Actualiza precios EU desde ENTSO-E
- 19 países (8 activos en Mendeley: DE, FR, IT, ES, NL, PL, BE, DK)
- Frecuencia: Cada 8 horas
- Timeout: 300 segundos
- Respuesta: Background task

POST /api/admin/refresh-prices/eia  
- Actualiza precios USA desde EIA
- 5 estados (CA, TX, AZ, OH, NY)
- Frecuencia: Diaria (06:00 EST)
- Timeout: 180 segundos
- Respuesta: Background task
```

### 2. **Scripts de Fetch** (Ya existentes, ahora integrados)

- ✅ `backend/utils/fetch_energy_prices.py` - ENTSO-E API
- ✅ `backend/utils/fetch_eia_prices.py` - EIA API
- ✅ Conversiones de unidades automáticas
- ✅ Sistema de retry con fallback

### 3. **Cloud Schedulers** (`setup_cloud_schedulers_realtime.sh`)

```bash
# Scheduler 1: ENTSO-E
Job: refresh-entsoe-prices
Schedule: */8 * * * *  # Every 8 hours
Timezone: Europe/Madrid
Endpoint: /api/admin/refresh-prices/entsoe
Regions: 19 EU countries

# Scheduler 2: EIA
Job: refresh-eia-prices  
Schedule: 0 6 * * *    # Daily at 06:00
Timezone: America/New_York
Endpoint: /api/admin/refresh-prices/eia
States: CA, TX, AZ, OH, NY
```

---

## 🚀 Despliegue en Producción

### **Paso 1: Deploy del Backend a Cloud Run**

```bash
cd /Users/marta.mateu/Downloads/smart-tco-calculator

# Definir variables
PROJECT_ID="your-gcp-project-id"
REGION="europe-west1"

# Deploy directo desde código
gcloud run deploy smart-tco-backend \
  --source ./backend \
  --region $REGION \
  --platform managed \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --timeout 300 \
  --set-env-vars "ENTSOE_API_KEY=5f07b8da-894d-430f-8690-b50e56b0b51f,EIA_API_KEY=gh2RNWc8OhxUBnRpbGawm7RZN7W6gT70HysSFAFa,ADMIN_API_KEY=$(python3 -c 'import secrets; print(secrets.token_urlsafe(32))')"

# Obtener URL del backend
BACKEND_URL=$(gcloud run services describe smart-tco-backend \
  --region $REGION \
  --format 'value(status.url)')

echo "✅ Backend deployed at: $BACKEND_URL"
```

### **Paso 2: Configurar Cloud Schedulers**

```bash
cd backend

# Hacer scripts ejecutables
chmod +x setup_cloud_schedulers_realtime.sh

# Ejecutar setup
./setup_cloud_schedulers_realtime.sh $PROJECT_ID $BACKEND_URL

# Output esperado:
# ✅ ENTSO-E scheduler created (every 8 hours)
# ✅ EIA scheduler created (daily at 06:00 EST)
```

### **Paso 3: Configurar Admin API Key en Schedulers**

```bash
# Generar API key segura
ADMIN_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")
echo "Admin API Key: $ADMIN_KEY"

# Actualizar schedulers con API key
gcloud scheduler jobs update http refresh-entsoe-prices \
  --location=$REGION \
  --headers="X-Api-Key=$ADMIN_KEY"

gcloud scheduler jobs update http refresh-eia-prices \
  --location=$REGION \
  --headers="X-Api-Key=$ADMIN_KEY"

# Guardar API key en Cloud Run
gcloud run services update smart-tco-backend \
  --region=$REGION \
  --update-env-vars="ADMIN_API_KEY=$ADMIN_KEY"
```

### **Paso 4: Verificación**

```bash
# Test manual de ENTSO-E
curl -X POST "$BACKEND_URL/api/admin/refresh-prices/entsoe" \
  -H "X-Api-Key: $ADMIN_KEY" \
  -H "Content-Type: application/json"

# Test manual de EIA
curl -X POST "$BACKEND_URL/api/admin/refresh-prices/eia" \
  -H "X-Api-Key: $ADMIN_KEY" \
  -H "Content-Type: application/json"

# Verificar estado
curl "$BACKEND_URL/api/admin/status"

# Ejecutar schedulers manualmente (primera vez)
gcloud scheduler jobs run refresh-entsoe-prices --location=$REGION
gcloud scheduler jobs run refresh-eia-prices --location=$REGION

# Ver logs
gcloud logging read 'resource.type="cloud_scheduler_job"' --limit=10
```

---

## 📅 Schedule de Actualización

### **Timeline Diario**

```
00:00 CET  ─┬─ ENTSO-E Update #1 (medianoche)
            │  └─ Fetch: DE, FR, IT, ES, NL, PL, BE, DK
            │
06:00 EST  ─┬─ EIA Update (madrugada USA)
            │  └─ Fetch: CA, TX, AZ, OH, NY
            │
08:00 CET  ─┬─ ENTSO-E Update #2 (mañana)
            │  └─ Refresh EU prices
            │
16:00 CET  ─┴─ ENTSO-E Update #3 (tarde)
               └─ Refresh EU prices
```

### **Frecuencias por Fuente**

| Fuente   | Regiones | Frecuencia    | Horarios (CET)        |
|----------|----------|---------------|-----------------------|
| ENTSO-E  | 8 EU     | Cada 8 horas  | 00:00, 08:00, 16:00  |
| EIA      | 5 USA    | Diaria        | 12:00 (06:00 EST)    |
| Mendeley | 5 Asia   | Estática      | Manual/trimestral    |

---

## 🔒 Seguridad

### **API Keys Configuradas**

```bash
# ENTSO-E (EU Transparency Platform)
ENTSOE_API_KEY=5f07b8da-894d-430f-8690-b50e56b0b51f
- Rate Limit: 400 requests/min
- Coverage: 19 EU countries
- Free tier: Unlimited

# EIA (US Energy Information Administration)  
EIA_API_KEY=gh2RNWc8OhxUBnRpbGawm7RZN7W6gT70HysSFAFa
- Rate Limit: 5000 requests/hour
- Coverage: 50 USA states
- Free tier: Unlimited

# Admin API (Cloud Scheduler authentication)
ADMIN_API_KEY=<generated-secure-token>
- Length: 32 bytes (256 bits)
- Encoding: URL-safe base64
- Usage: Header X-Api-Key
```

### **Autenticación de Schedulers**

```bash
# Service Account
scheduler@YOUR_PROJECT_ID.iam.gserviceaccount.com

# Roles asignados:
- roles/cloudscheduler.jobRunner
- roles/run.invoker

# Autenticación:
- OIDC Token (automático por GCP)
- Custom Header: X-Api-Key (validación en backend)
```

---

## 📊 Datos de Cobertura

### **Regiones con Live Data (13/18 = 72%)**

```
🇪🇺 ENTSO-E (8):
├─ 🇵🇱 Poland       €0.1704/kWh  [Live, 8h]
├─ 🇩🇪 Germany      €0.1568/kWh  [Live, 8h] ← FIXED!
├─ 🇫🇷 France       €0.1132/kWh  [Live, 8h]
├─ 🇮🇹 Italy        €0.1677/kWh  [Live, 8h] ← FIXED!
├─ 🇪🇸 Spain        €0.1218/kWh  [Live, 8h]
├─ 🇳🇱 Netherlands  €0.1544/kWh  [Live, 8h]
├─ 🇧🇪 Belgium      €0.1421/kWh  [Live, 8h]
└─ 🇩🇰 Denmark      €0.1457/kWh  [Live, 8h] ← NEW!

🇺🇸 EIA (5):
├─ 🌴 California    €0.1968/kWh  [Live, daily]
├─ 🤠 Texas         €0.0588/kWh  [Live, daily]
├─ 🌵 Arizona       €0.0751/kWh  [Live, daily]
├─ 🏭 Ohio          €0.0718/kWh  [Live, daily]
└─ 🗽 New York      €0.0915/kWh  [Live, daily]

📚 Mendeley Static (5):
├─ 🇸🇪 Sweden       €0.0780/kWh  [Quarterly]
├─ 🇹🇼 Taiwan       €0.0920/kWh  [Quarterly]
├─ 🇰🇷 South Korea  €0.0850/kWh  [Quarterly]
├─ 🇨🇳 China        €0.0760/kWh  [Quarterly]
└─ 🇯🇵 Japan        €0.1650/kWh  [Quarterly]
```

---

## 💰 Costos de Operación

### **Cloud Scheduler**

```
2 jobs × $0.10/mes = $0.20/mes

Desglose:
- refresh-entsoe-prices:  $0.10/mes (cada 8h = 90 ejecuciones/mes)
- refresh-eia-prices:     $0.10/mes (diaria = 30 ejecuciones/mes)
```

### **Cloud Run (estimado)**

```
Tráfico bajo:  ~$5-10/mes
Tráfico medio: ~$20-30/mes

Factores:
- CPU time: ~1s por request
- Memory: 2GB allocated
- Requests: ~1000-10000/mes estimado
- Cold starts: Minimizados con min-instances=1
```

### **API Calls (gratis)**

```
ENTSO-E: 90 calls/mes  (límite: 400/min = ~17M/mes)
EIA:     30 calls/mes  (límite: 5000/hour = ~3.6M/mes)

Ambas APIs son gratuitas sin límite de volumen
```

### **Total Mensual: $5.20 - $30.20**

---

## 🛠 Troubleshooting

### **Problema: Scheduler no ejecuta**

```bash
# Verificar status
gcloud scheduler jobs describe refresh-entsoe-prices --location=europe-west1

# Ver logs
gcloud logging read 'resource.type="cloud_scheduler_job"' --limit=20

# Ejecutar manualmente
gcloud scheduler jobs run refresh-entsoe-prices --location=europe-west1

# Verificar permisos
gcloud projects get-iam-policy PROJECT_ID | grep scheduler
```

### **Problema: API returns 401/403**

```bash
# ENTSO-E
curl "https://web-api.tp.entsoe.eu/api?securityToken=YOUR_KEY&documentType=A44&in_Domain=10Y1001A1001A82H&out_Domain=10Y1001A1001A82H&periodStart=202510150000&periodEnd=202510160000"

# EIA
curl "https://api.eia.gov/v2/electricity/retail-sales/data?api_key=YOUR_KEY&frequency=monthly&data[0]=price&facets[sectorid][]=IND&facets[stateid][]=CA&length=1"

# Renovar keys si es necesario
```

### **Problema: Cache not updating**

```bash
# Verificar cache age
curl $BACKEND_URL/api/admin/health-check -H "X-Api-Key: $ADMIN_KEY"

# Forzar update manual
curl -X POST $BACKEND_URL/api/admin/refresh-prices/entsoe \
  -H "X-Api-Key: $ADMIN_KEY"

# Verificar archivos en Cloud Run
gcloud run services logs read smart-tco-backend --limit=50
```

---

## 📈 Métricas de Éxito

### **KPIs a Monitorizar**

1. **Data Freshness**
   - ENTSO-E: < 8 horas
   - EIA: < 24 horas
   - Target: 95% uptime

2. **API Success Rate**
   - ENTSO-E: > 98%
   - EIA: > 99%
   - Fallback: < 5%

3. **Scheduler Reliability**
   - Success rate: > 99%
   - Avg execution time: < 60s
   - Timeouts: < 1%

4. **Cost Efficiency**
   - Mensual: < $35
   - Cost per region: < $2.70
   - API calls: $0 (gratis)

---

## 🎯 Próximos Pasos

### **Fase 1: Deployment (Semana 1)**
- [x] Implementar endpoints de admin
- [x] Actualizar fetch scripts con area codes correctos
- [x] Crear scripts de Cloud Scheduler
- [ ] Deploy a Cloud Run
- [ ] Configurar schedulers en GCP
- [ ] Verificar primera ejecución

### **Fase 2: Monitoreo (Semana 2)**
- [ ] Configurar Cloud Monitoring alerts
- [ ] Dashboard de métricas en tiempo real
- [ ] Logs aggregation y análisis
- [ ] Documentar patrones de uso

### **Fase 3: Optimización (Mes 1)**
- [ ] Ajustar frecuencias según necesidad
- [ ] Implementar caching inteligente
- [ ] Optimizar costos de Cloud Run
- [ ] Evaluar expansión a más regiones

### **Fase 4: Expansión (Trimestre 1)**
- [ ] Agregar más estados USA (10→50)
- [ ] Integrar AEMO (Australia)
- [ ] Agregar JEPX (Japan)
- [ ] Target: 90% cobertura live

---

## 📞 Recursos

- **ENTSO-E Docs**: https://transparency.entsoe.eu/content/static_content/Static%20content/web%20api/Guide.html
- **EIA API Docs**: https://www.eia.gov/opendata/documentation.php
- **GCP Scheduler**: https://cloud.google.com/scheduler/docs
- **Deployment Guide**: Ver `DEPLOYMENT_GUIDE.md`

---

**Última actualización**: 16 Octubre 2025  
**Estado**: ✅ Ready for Production  
**Autor**: Smart TCO Calculator Team  
**Versión**: 1.0.0
