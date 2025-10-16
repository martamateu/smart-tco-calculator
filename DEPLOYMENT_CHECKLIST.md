# ✅ Deployment Checklist - Smart TCO Calculator

## Pre-Deployment

### Configuración Local
- [ ] Python 3.11+ instalado
- [ ] gcloud CLI instalado y autenticado
- [ ] Docker instalado (opcional)
- [ ] Variables de entorno configuradas en `.env`
  - [ ] `ENTSOE_API_KEY=5f07b8da-894d-430f-8690-b50e56b0b51f`
  - [ ] `EIA_API_KEY=gh2RNWc8OhxUBnRpbGawm7RZN7W6gT70HysSFAFa`
  - [ ] `ADMIN_API_KEY=<generar-nuevo>`

### Verificación de Datos
- [ ] `backend/data/global_electricity_data_2025.json` existe (18 regiones)
- [ ] JSON válido (ejecutar: `python3 -c "import json; json.load(open('backend/data/global_electricity_data_2025.json'))"`)
- [ ] Cache directory existe: `backend/data/cache/`
- [ ] Denmark incluido en Mendeley JSON

### Verificación de Código
- [ ] `backend/routers/admin.py` tiene endpoints:
  - [ ] `/api/admin/refresh-prices/entsoe`
  - [ ] `/api/admin/refresh-prices/eia`
- [ ] `backend/utils/fetch_energy_prices.py` tiene Germany code correcto: `10Y1001A1001A82H`
- [ ] `backend/utils/fetch_eia_prices.py` funciona correctamente
- [ ] Todos los imports funcionan sin errores

### Test Local
- [ ] Backend arranca sin errores: `uvicorn backend.main:app --reload`
- [ ] Endpoint de status responde: `curl http://localhost:8000/api/admin/status`
- [ ] ENTSO-E fetch funciona localmente
- [ ] EIA fetch funciona localmente

---

## GCP Setup

### Proyecto GCP
- [ ] Proyecto GCP creado
- [ ] Billing activado
- [ ] APIs habilitadas:
  - [ ] Cloud Run API
  - [ ] Cloud Scheduler API
  - [ ] Cloud Build API
  - [ ] Container Registry API

### Variables de Proyecto
```bash
PROJECT_ID="<your-project-id>"
REGION="europe-west1"
SERVICE_NAME="smart-tco-backend"
```

---

## Deployment a Cloud Run

### 1. Build y Deploy

**Opción A: Deploy directo desde código (recomendado)**
```bash
cd /Users/marta.mateu/Downloads/smart-tco-calculator

gcloud run deploy smart-tco-backend \
  --source ./backend \
  --region europe-west1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --timeout 300 \
  --min-instances 0 \
  --max-instances 10 \
  --set-env-vars "ENTSOE_API_KEY=5f07b8da-894d-430f-8690-b50e56b0b51f,EIA_API_KEY=gh2RNWc8OhxUBnRpbGawm7RZN7W6gT70HysSFAFa,ADMIN_API_KEY=$(python3 -c 'import secrets; print(secrets.token_urlsafe(32))')"
```

- [ ] Deployment completado sin errores
- [ ] URL del servicio obtenida: `https://smart-tco-backend-xxx.run.app`

**Opción B: Build manual con Docker**
```bash
cd backend
docker build -t gcr.io/$PROJECT_ID/smart-tco-backend:latest .
docker push gcr.io/$PROJECT_ID/smart-tco-backend:latest

gcloud run deploy smart-tco-backend \
  --image gcr.io/$PROJECT_ID/smart-tco-backend:latest \
  --region europe-west1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2
```

### 2. Verificar Deployment

```bash
BACKEND_URL=$(gcloud run services describe smart-tco-backend \
  --region europe-west1 \
  --format 'value(status.url)')

echo "Backend URL: $BACKEND_URL"

# Test endpoints
curl $BACKEND_URL/api/status
curl $BACKEND_URL/api/admin/status
```

- [ ] Status endpoint responde correctamente
- [ ] Admin status endpoint responde
- [ ] No hay errores en logs: `gcloud run services logs read smart-tco-backend --limit=20`

---

## Cloud Scheduler Setup

### 1. Generar Admin API Key Segura

```bash
ADMIN_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")
echo "SAVE THIS KEY: $ADMIN_KEY"

# Actualizar Cloud Run con el nuevo key
gcloud run services update smart-tco-backend \
  --region europe-west1 \
  --update-env-vars="ADMIN_API_KEY=$ADMIN_KEY"
```

- [ ] Admin API Key generada y guardada en lugar seguro
- [ ] Cloud Run actualizado con nueva variable

### 2. Ejecutar Scripts de Setup

```bash
cd backend

# Hacer ejecutables
chmod +x setup_cloud_schedulers.sh
chmod +x setup_cloud_schedulers_realtime.sh

# Setup base (trimestral)
./setup_cloud_schedulers.sh $PROJECT_ID $BACKEND_URL

# Setup real-time (8h/diario)
./setup_cloud_schedulers_realtime.sh $PROJECT_ID $BACKEND_URL
```

- [ ] `setup_cloud_schedulers.sh` ejecutado sin errores
- [ ] `setup_cloud_schedulers_realtime.sh` ejecutado sin errores
- [ ] 5 jobs creados en Cloud Scheduler:
  - [ ] `refresh-mendeley-electricity-data` (trimestral)
  - [ ] `refresh-iea-carbon-intensity` (anual)
  - [ ] `retrain-ml-model` (trimestral)
  - [ ] `refresh-entsoe-prices` (cada 8h)
  - [ ] `refresh-eia-prices` (diario)

### 3. Configurar Admin API Key en Jobs

```bash
# Actualizar cada job con el Admin API Key
gcloud scheduler jobs update http refresh-entsoe-prices \
  --location=europe-west1 \
  --headers="X-Api-Key=$ADMIN_KEY"

gcloud scheduler jobs update http refresh-eia-prices \
  --location=europe-west1 \
  --headers="X-Api-Key=$ADMIN_KEY"

gcloud scheduler jobs update http refresh-mendeley-electricity-data \
  --location=europe-west1 \
  --headers="X-Api-Key=$ADMIN_KEY"

gcloud scheduler jobs update http refresh-iea-carbon-intensity \
  --location=europe-west1 \
  --headers="X-Api-Key=$ADMIN_KEY"

gcloud scheduler jobs update http retrain-ml-model \
  --location=europe-west1 \
  --headers="X-Api-Key=$ADMIN_KEY"
```

- [ ] Todos los jobs actualizados con Admin API Key
- [ ] Jobs habilitados y programados

---

## Verificación Post-Deployment

### 1. Test Manual de Endpoints

```bash
# Test ENTSO-E
curl -X POST $BACKEND_URL/api/admin/refresh-prices/entsoe \
  -H "X-Api-Key: $ADMIN_KEY" \
  -H "Content-Type: application/json"

# Test EIA
curl -X POST $BACKEND_URL/api/admin/refresh-prices/eia \
  -H "X-Api-Key: $ADMIN_KEY" \
  -H "Content-Type: application/json"

# Verificar health
curl $BACKEND_URL/api/admin/health-check \
  -H "X-Api-Key: $ADMIN_KEY"
```

- [ ] ENTSO-E endpoint responde: `{"status": "started"}`
- [ ] EIA endpoint responde: `{"status": "started"}`
- [ ] Health check muestra datos frescos

### 2. Test Manual de Schedulers

```bash
# Ejecutar manualmente cada job
gcloud scheduler jobs run refresh-entsoe-prices --location=europe-west1
gcloud scheduler jobs run refresh-eia-prices --location=europe-west1

# Esperar 30 segundos y verificar logs
sleep 30
gcloud logging read 'resource.type="cloud_scheduler_job"' \
  --limit=10 \
  --format=json
```

- [ ] ENTSO-E job ejecutado con éxito (HTTP 200)
- [ ] EIA job ejecutado con éxito (HTTP 200)
- [ ] Logs muestran "status": "started"

### 3. Verificar Actualización de Datos

```bash
# Esperar 2 minutos para que se complete el background task
sleep 120

# Verificar que los datos se actualizaron
curl $BACKEND_URL/api/admin/health-check -H "X-Api-Key: $ADMIN_KEY" | jq
```

- [ ] Energy prices age < 1 hora
- [ ] Cache files actualizados en Cloud Run
- [ ] No errores en logs del backend

---

## Monitoreo y Alertas

### Cloud Monitoring Setup

1. **Dashboard de Schedulers**
   - [ ] Acceder a: https://console.cloud.google.com/cloudscheduler?project=$PROJECT_ID
   - [ ] Verificar que todos los jobs están "Enabled"
   - [ ] Verificar próxima ejecución programada

2. **Logs de Cloud Run**
   ```bash
   gcloud logging tail "resource.type=cloud_run_revision AND resource.labels.service_name=smart-tco-backend"
   ```
   - [ ] No errores críticos en últimas 24h
   - [ ] Price updates ejecutándose correctamente

3. **Configurar Alertas (Opcional)**
   - [ ] Alert: Energy prices > 24h old
   - [ ] Alert: Scheduler job failed 3 veces
   - [ ] Alert: Backend error rate > 5%

---

## Documentación

### Archivos Creados/Actualizados
- [ ] `DEPLOYMENT_GUIDE.md` - Guía completa de deployment
- [ ] `AUTOMATIC_PRICE_UPDATES.md` - Arquitectura del sistema automático
- [ ] `ENTSOE_AREA_CODE_INVESTIGATION.md` - Investigación de area codes
- [ ] `REGIONAL_EXPANSION_SUMMARY.md` - Resumen de expansión
- [ ] `DEPLOYMENT_CHECKLIST.md` - Este checklist

### Información a Guardar
- [ ] Backend URL guardada
- [ ] Admin API Key guardada (en lugar seguro)
- [ ] Project ID documentado
- [ ] Región documentada
- [ ] Próximas fechas de ejecución de schedulers

---

## Rollback Plan (en caso de problemas)

### Si hay errores después del deployment:

1. **Verificar logs**
   ```bash
   gcloud run services logs read smart-tco-backend --limit=100
   ```

2. **Rollback a versión anterior**
   ```bash
   gcloud run services describe smart-tco-backend \
     --region=europe-west1 \
     --format='get(status.traffic)'
   
   # Rollback
   gcloud run services update-traffic smart-tco-backend \
     --region=europe-west1 \
     --to-revisions=PREVIOUS_REVISION=100
   ```

3. **Deshabilitar schedulers temporalmente**
   ```bash
   gcloud scheduler jobs pause refresh-entsoe-prices --location=europe-west1
   gcloud scheduler jobs pause refresh-eia-prices --location=europe-west1
   ```

4. **Restaurar schedulers**
   ```bash
   gcloud scheduler jobs resume refresh-entsoe-prices --location=europe-west1
   gcloud scheduler jobs resume refresh-eia-prices --location=europe-west1
   ```

---

## Success Criteria

### Sistema está funcionando correctamente cuando:

- ✅ Backend responde en < 1 segundo
- ✅ ENTSO-E prices se actualizan cada 8 horas
- ✅ EIA prices se actualizan diariamente
- ✅ Energy prices age < 24 horas
- ✅ No errores en logs de Cloud Run
- ✅ Scheduler jobs ejecutan sin timeouts
- ✅ 13/18 regiones muestran datos live (72%)
- ✅ Costos mensuales < $35

---

## Post-Deployment Tasks (Semana 1)

- [ ] Día 1: Verificar primera ejecución automática (8h después)
- [ ] Día 2: Revisar logs de ambos schedulers
- [ ] Día 3: Verificar actualización de EIA (después de 06:00 EST)
- [ ] Día 7: Análisis de costos primera semana
- [ ] Día 7: Optimizar si es necesario (memory, CPU, instances)

---

## Notas Finales

**Fecha de Deployment**: _______________

**Deployed by**: _______________

**Backend URL**: _______________

**Admin API Key**: _______________ (guardar en lugar seguro)

**Scheduler Jobs Created**: _______________

**Issues Encontrados**: 
- 
- 
- 

**Resoluciones**:
- 
- 
- 

---

**Status**: 
- [ ] Pre-Deployment ✅
- [ ] GCP Setup ✅
- [ ] Cloud Run Deployment ✅
- [ ] Cloud Scheduler Setup ✅
- [ ] Verification ✅
- [ ] Monitoring ✅
- [ ] DEPLOYMENT COMPLETE 🎉
