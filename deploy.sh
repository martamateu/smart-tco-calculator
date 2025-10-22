#!/bin/bash
set -e

echo "🚀 Iniciando deployment a Cloud Run..."
echo "Proyecto: calcium-land-466213-e0"
echo "Región: europe-west1"
echo "Servicio: smart-tco-backend"
echo ""

cd "$(dirname "$0")"

echo "📦 Desplegando backend..."
gcloud run deploy smart-tco-backend \
  --source=./backend \
  --region=europe-west1 \
  --project=calcium-land-466213-e0 \
  --platform=managed \
  --allow-unauthenticated \
  --memory=2Gi \
  --cpu=2 \
  --timeout=120 \
  --max-instances=100 \
  --set-secrets="ENTSOE_API_KEY=entsoe-api-key:latest,EIA_API_KEY=eia-api-key:latest,ADMIN_API_KEY=admin-api-key:latest,GEMINI_API_KEY=gemini-api-key:latest,MATERIALS_PROJECT_API_KEY=MATERIALS_PROJECT_API_KEY:latest"

echo ""
echo "✅ Deployment completado!"
echo ""
echo "🔍 Verificando servicio..."
gcloud run services describe smart-tco-backend \
  --region=europe-west1 \
  --project=calcium-land-466213-e0 \
  --format="value(status.url)"
