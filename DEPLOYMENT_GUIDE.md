# 🚀 Guía de Deployment - Smart TCO Calculator

## Fecha de actualización: 16 Octubre 2025

Esta guía explica cómo desplegar el Smart TCO Calculator en Google Cloud Platform con actualización automática de precios de energía.

---

## 📋 Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Configuración de Variables de Entorno](#configuración-de-variables-de-entorno)
3. [Deployment en Cloud Run](#deployment-en-cloud-run)
4. [Configuración de Cloud Schedulers](#configuración-de-cloud-schedulers)
5. [Verificación del Sistema](#verificación-del-sistema)
6. [Monitoreo y Mantenimiento](#monitoreo-y-mantenimiento)

---

## 1️⃣ Requisitos Previos

### Cuentas y APIs necesarias:
- ✅ **Google Cloud Platform**
  - Proyecto creado
  - Billing activado
  - Cloud Run API habilitada
  - Cloud Scheduler API habilitada
  
- ✅ **ENTSO-E API** (EU Electricity Prices)
  - Registrarse en: https://transparency.entsoe.eu/
  - Obtener security token (gratis)
  - Tu API key: `5f07b8da-894d-430f-8690-b50e56b0b51f`
  
- ✅ **EIA API** (USA Electricity Prices)
  - Registrarse en: https://www.eia.gov/opendata/register.php
  - Obtener API key (gratis)
  - Tu API key: `gh2RNWc8OhxUBnRpbGawm7RZN7W6gT70HysSFAFa`

### Herramientas locales:
```bash
# gcloud CLI
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Docker (para build de imágenes)
# Descargar desde: https://www.docker.com/products/docker-desktop

# Autenticar gcloud
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

---

## 2️⃣ Configuración de Variables de Entorno

### Variables requeridas en Cloud Run:

```bash
# API Keys para datos en tiempo real
ENTSOE_API_KEY=5f07b8da-894d-430f-8690-b50e56b0b51f
EIA_API_KEY=gh2RNWc8OhxUBnRpbGawm7RZN7W6gT70HysSFAFa

# Admin API Key (generar una nueva para producción)
ADMIN_API_KEY=your-secure-random-key-here

# Configuración de la aplicación
ENVIRONMENT=production
LOG_LEVEL=INFO
```

### Generar un ADMIN_API_KEY seguro:

```bash
# macOS/Linux
python3 -c "import secrets; print(secrets.token_urlsafe(32))"

# Ejemplo de output: "k9L3mP8qR2sT5vX7wY9zA1bC4dE6fG8hJ0kM2nP5"
```

---

## 3️⃣ Deployment en Cloud Run

### Opción A: Deploy directo desde código (recomendado)

```bash
cd /Users/marta.mateu/Downloads/smart-tco-calculator

# Build y deploy en un solo paso
gcloud run deploy smart-tco-backend \
  --source ./backend \
  --region europe-west1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --timeout 300 \
  --set-env-vars "ENTSOE_API_KEY=5f07b8da-894d-430f-8690-b50e56b0b51f,EIA_API_KEY=gh2RNWc8OhxUBnRpbGawm7RZN7W6gT70HysSFAFa,ADMIN_API_KEY=YOUR_SECURE_KEY,ENVIRONMENT=production"
```

### Opción B: Build manual con Docker

```bash
cd backend

# Build de la imagen
docker build -t gcr.io/YOUR_PROJECT_ID/smart-tco-backend:latest .

# Push a Container Registry
docker push gcr.io/YOUR_PROJECT_ID/smart-tco-backend:latest

# Deploy desde la imagen
gcloud run deploy smart-tco-backend \
  --image gcr.io/YOUR_PROJECT_ID/smart-tco-backend:latest \
  --region europe-west1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --timeout 300 \
  --set-env-vars "ENTSOE_API_KEY=5f07b8da-894d-430f-8690-b50e56b0b51f,EIA_API_KEY=gh2RNWc8OhxUBnRpbGawm7RZN7W6gT70HysSFAFa,ADMIN_API_KEY=YOUR_SECURE_KEY"
```

### Verificar el deployment:

```bash
# Obtener la URL del servicio
BACKEND_URL=$(gcloud run services describe smart-tco-backend \
  --region europe-west1 \
  --format 'value(status.url)')

echo "🔗 Backend URL: $BACKEND_URL"

# Test básico
curl $BACKEND_URL/api/status
```

---

## 4️⃣ Configuración de Cloud Schedulers

### Paso 1: Setup básico (datos estáticos - trimestral)

```bash
cd /Users/marta.mateu/Downloads/smart-tco-calculator/backend

# Reemplazar variables
PROJECT_ID="your-gcp-project-id"
BACKEND_URL="https://smart-tco-backend-xxx.run.app"  # URL de Cloud Run

# Ejecutar setup
chmod +x setup_cloud_schedulers.sh
./setup_cloud_schedulers.sh $PROJECT_ID $BACKEND_URL
```

**Jobs creados:**
- ✅ `refresh-mendeley-electricity-data` - Cada 3 meses (1er día, 00:00)
- ✅ `refresh-iea-carbon-intensity` - Anual (15 enero, 00:00)
- ✅ `retrain-ml-model` - Cada 3 meses (2do día, 02:00)

### Paso 2: Setup real-time (precios en vivo - cada 8h / diario)

```bash
# Ejecutar setup real-time
chmod +x setup_cloud_schedulers_realtime.sh
./setup_cloud_schedulers_realtime.sh $PROJECT_ID $BACKEND_URL
```

**Jobs creados:**
- ✅ `refresh-entsoe-prices` - Cada 8 horas (00:00, 08:00, 16:00 CET)
- ✅ `refresh-eia-prices` - Diario (06:00 EST)

### Paso 3: Configurar Admin API Key en los jobs

```bash
# Listar todos los jobs
gcloud scheduler jobs list --location=europe-west1

# Actualizar cada job con el ADMIN_API_KEY
ADMIN_KEY="your-secure-random-key-here"

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

---

## 5️⃣ Verificación del Sistema

### Test manual de los endpoints:

```bash
BACKEND_URL="https://smart-tco-backend-xxx.run.app"
ADMIN_KEY="your-secure-random-key-here"

# 1. Health check (público)
curl $BACKEND_URL/api/admin/status

# 2. Test ENTSO-E update (requiere API key)
curl -X POST $BACKEND_URL/api/admin/refresh-prices/entsoe \
  -H "X-Api-Key: $ADMIN_KEY" \
  -H "Content-Type: application/json"

# 3. Test EIA update (requiere API key)
curl -X POST $BACKEND_URL/api/admin/refresh-prices/eia \
  -H "X-Api-Key: $ADMIN_KEY" \
  -H "Content-Type: application/json"

# 4. Verificar estado de datos
curl $BACKEND_URL/api/admin/health-check \
  -H "X-Api-Key: $ADMIN_KEY"
```

### Test manual de los schedulers:

```bash
# Ejecutar ENTSO-E update manualmente
gcloud scheduler jobs run refresh-entsoe-prices --location=europe-west1

# Ejecutar EIA update manualmente
gcloud scheduler jobs run refresh-eia-prices --location=europe-west1

# Ver logs de ejecución
gcloud logging read 'resource.type="cloud_scheduler_job"' \
  --limit=20 \
  --format=json
```

---

## 6️⃣ Monitoreo y Mantenimiento

### Dashboard de Cloud Scheduler

```
https://console.cloud.google.com/cloudscheduler?project=YOUR_PROJECT_ID
```

Verificar:
- ✅ Estado de los jobs (Enabled/Disabled)
- ✅ Última ejecución exitosa
- ✅ Próxima ejecución programada
- ✅ Tasa de errores

### Logs de Cloud Run

```bash
# Logs en tiempo real del backend
gcloud logging tail "resource.type=cloud_run_revision AND resource.labels.service_name=smart-tco-backend" \
  --format=json

# Filtrar solo errores
gcloud logging read "resource.type=cloud_run_revision AND severity>=ERROR" \
  --limit=50
```

### Alertas recomendadas

Configurar en Google Cloud Monitoring:

1. **Alert: Energy prices outdated**
   - Condición: Energy prices cache > 24 horas
   - Canal: Email + Slack

2. **Alert: Scheduler job failed**
   - Condición: Cloud Scheduler job failed 3 veces consecutivas
   - Canal: Email + PagerDuty

3. **Alert: Backend errors**
   - Condición: Error rate > 5% en últimos 5 minutos
   - Canal: Email

### Mantenimiento rutinario

```bash
# 1. Verificar estado semanal
curl $BACKEND_URL/api/admin/health-check -H "X-Api-Key: $ADMIN_KEY"

# 2. Revisar logs de schedulers mensualmente
gcloud logging read 'resource.type="cloud_scheduler_job"' \
  --freshness=30d \
  --format=json > scheduler_logs_$(date +%Y%m).json

# 3. Actualizar dependencias trimestralmente
cd backend
pip list --outdated
```

---

## 📊 Resumen de Cobertura Actual

### Regiones con datos en tiempo real (13/18 = 72%):

**🇪🇺 ENTSO-E (8 países, actualización cada 8h):**
- 🇵🇱 Poland €0.1704/kWh
- 🇩🇪 Germany €0.1568/kWh
- 🇫🇷 France €0.1132/kWh
- 🇮🇹 Italy €0.1677/kWh
- 🇪🇸 Spain €0.1218/kWh
- 🇳🇱 Netherlands €0.1544/kWh
- 🇧🇪 Belgium €0.1421/kWh
- 🇩🇰 Denmark €0.1457/kWh

**🇺🇸 EIA (5 estados, actualización diaria):**
- 🌴 California €0.1968/kWh
- 🤠 Texas €0.0588/kWh
- 🌵 Arizona €0.0751/kWh
- 🏭 Ohio €0.0718/kWh
- 🗽 New York €0.0915/kWh

**📚 Datos estáticos Mendeley (5 regiones):**
- 🇸🇪 Sweden, 🇹🇼 Taiwan, 🇰🇷 South Korea, 🇨🇳 China, 🇯🇵 Japan

---

## 💰 Costos Estimados (GCP)

### Cloud Scheduler:
- 5 jobs × $0.10/mes = **$0.50/mes**

### Cloud Run (estimado):
- Tráfico bajo: **~$5-10/mes**
- Tráfico medio: **~$20-30/mes**

### Storage:
- Cloud Storage (cachés, models): **< $1/mes**

**Total estimado: $6-31/mes** dependiendo del tráfico

---

## 🔧 Troubleshooting

### Problema: ENTSO-E returns no data

```bash
# Verificar API key
curl "https://web-api.tp.entsoe.eu/api?securityToken=YOUR_KEY&documentType=A44&in_Domain=10Y1001A1001A82H&out_Domain=10Y1001A1001A82H&periodStart=202510150000&periodEnd=202510160000"

# Verificar area codes en fetch_energy_prices.py
cat backend/utils/fetch_energy_prices.py | grep -A 20 "ENTSO_AREAS"
```

### Problema: EIA returns 401 Unauthorized

```bash
# Verificar API key
curl "https://api.eia.gov/v2/electricity/retail-sales/data?api_key=YOUR_KEY&frequency=monthly&data[0]=price&facets[sectorid][]=IND&facets[stateid][]=CA"

# Regenerar API key si es necesario
# https://www.eia.gov/opendata/register.php
```

### Problema: Scheduler no ejecuta

```bash
# Verificar permisos del service account
gcloud projects get-iam-policy YOUR_PROJECT_ID \
  --flatten="bindings[].members" \
  --format='table(bindings.role)' \
  --filter="bindings.members:scheduler@"

# Re-ejecutar setup de schedulers
./setup_cloud_schedulers_realtime.sh YOUR_PROJECT_ID $BACKEND_URL
```

---

## 📞 Soporte

- **ENTSO-E API Docs**: https://transparency.entsoe.eu/content/static_content/Static%20content/web%20api/Guide.html
- **EIA API Docs**: https://www.eia.gov/opendata/documentation.php
- **GCP Cloud Scheduler**: https://cloud.google.com/scheduler/docs
- **GCP Cloud Run**: https://cloud.google.com/run/docs

---

## 🎯 Next Steps después del Deployment

1. ✅ **Verificar primera ejecución de schedulers** (esperar 8h para ENTSO-E, 24h para EIA)
2. ✅ **Configurar alertas** en Cloud Monitoring
3. ✅ **Agregar regiones adicionales** si se desea expandir cobertura
4. ✅ **Configurar backup** de cachés en Cloud Storage
5. ✅ **Documentar** cambios en production

---

**Última actualización**: 16 Octubre 2025  
**Versión**: 1.0.0  
**Cobertura live**: 72% (13/18 regiones)
