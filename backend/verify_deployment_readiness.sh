#!/bin/bash
# Verify deployment readiness for Smart TCO Calculator
# Tests all components before deploying to production

set -e

echo "🔍 Smart TCO Calculator - Deployment Readiness Check"
echo "======================================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Function to check and report
check_pass() {
    echo -e "${GREEN}✅ $1${NC}"
}

check_fail() {
    echo -e "${RED}❌ $1${NC}"
    ERRORS=$((ERRORS + 1))
}

check_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    WARNINGS=$((WARNINGS + 1))
}

# 1. Check Python environment
echo "1️⃣  Checking Python environment..."
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
    check_pass "Python $PYTHON_VERSION installed"
else
    check_fail "Python 3 not found"
fi

# 2. Check required packages
echo ""
echo "2️⃣  Checking Python dependencies..."
if [ -f "requirements.txt" ]; then
    check_pass "requirements.txt found"
    
    # Check key packages
    python3 -c "import fastapi" 2>/dev/null && check_pass "FastAPI installed" || check_fail "FastAPI missing"
    python3 -c "import requests" 2>/dev/null && check_pass "Requests installed" || check_fail "Requests missing"
    python3 -c "import pandas" 2>/dev/null && check_pass "Pandas installed" || check_fail "Pandas missing"
else
    check_fail "requirements.txt not found"
fi

# 3. Check API keys
echo ""
echo "3️⃣  Checking API keys..."

if [ -f ".env" ]; then
    check_pass ".env file found"
    source .env
else
    check_warn ".env file not found (may use environment variables)"
fi

# Check ENTSO-E API
if [ -n "$ENTSOE_API_KEY" ]; then
    check_pass "ENTSOE_API_KEY configured"
    
    # Test API
    echo "   Testing ENTSO-E API..."
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "https://web-api.tp.entsoe.eu/api?securityToken=$ENTSOE_API_KEY&documentType=A44&in_Domain=10Y1001A1001A82H&out_Domain=10Y1001A1001A82H&periodStart=202510150000&periodEnd=202510160000")
    if [ "$RESPONSE" -eq 200 ]; then
        check_pass "ENTSO-E API key valid (HTTP 200)"
    else
        check_fail "ENTSO-E API key invalid (HTTP $RESPONSE)"
    fi
else
    check_fail "ENTSOE_API_KEY not set"
fi

# Check EIA API
if [ -n "$EIA_API_KEY" ]; then
    check_pass "EIA_API_KEY configured"
    
    # Test API
    echo "   Testing EIA API..."
    RESPONSE=$(curl -s "https://api.eia.gov/v2/electricity/retail-sales/data?api_key=$EIA_API_KEY&frequency=monthly&data[0]=price&facets[sectorid][]=IND&facets[stateid][]=CA&length=1")
    if echo "$RESPONSE" | grep -q '"response"'; then
        check_pass "EIA API key valid"
    else
        check_fail "EIA API key invalid"
    fi
else
    check_fail "EIA_API_KEY not set"
fi

# Check ADMIN_API_KEY
if [ -n "$ADMIN_API_KEY" ]; then
    if [ "$ADMIN_API_KEY" == "dev-only-key-please-change" ]; then
        check_warn "ADMIN_API_KEY is default value (should change for production)"
    else
        check_pass "ADMIN_API_KEY configured"
    fi
else
    check_warn "ADMIN_API_KEY not set (will use default)"
fi

# 4. Check data files
echo ""
echo "4️⃣  Checking data files..."

if [ -f "data/global_electricity_data_2025.json" ]; then
    check_pass "Mendeley dataset found"
    
    # Validate JSON
    python3 -c "import json; json.load(open('data/global_electricity_data_2025.json'))" 2>/dev/null && \
        check_pass "Mendeley JSON valid" || \
        check_fail "Mendeley JSON invalid"
    
    # Count regions
    REGION_COUNT=$(python3 -c "import json; print(len(json.load(open('data/global_electricity_data_2025.json'))['regions']))" 2>/dev/null)
    if [ "$REGION_COUNT" -eq 18 ]; then
        check_pass "18 regions in Mendeley dataset"
    else
        check_warn "Expected 18 regions, found $REGION_COUNT"
    fi
else
    check_fail "Mendeley dataset not found"
fi

# Check cache directory
if [ -d "data/cache" ]; then
    check_pass "Cache directory exists"
else
    check_warn "Cache directory not found (will be created)"
    mkdir -p data/cache
fi

# 5. Check utility scripts
echo ""
echo "5️⃣  Checking utility scripts..."

[ -f "utils/fetch_energy_prices.py" ] && check_pass "fetch_energy_prices.py found" || check_fail "fetch_energy_prices.py missing"
[ -f "utils/fetch_eia_prices.py" ] && check_pass "fetch_eia_prices.py found" || check_fail "fetch_eia_prices.py missing"

# Test scripts syntax
echo "   Testing script syntax..."
python3 -m py_compile utils/fetch_energy_prices.py 2>/dev/null && \
    check_pass "fetch_energy_prices.py syntax valid" || \
    check_fail "fetch_energy_prices.py syntax error"

python3 -m py_compile utils/fetch_eia_prices.py 2>/dev/null && \
    check_pass "fetch_eia_prices.py syntax valid" || \
    check_fail "fetch_eia_prices.py syntax error"

# 6. Check admin endpoints
echo ""
echo "6️⃣  Checking admin router..."

if [ -f "routers/admin.py" ]; then
    check_pass "admin.py found"
    
    # Check for required endpoints
    grep -q "refresh-prices/entsoe" routers/admin.py && \
        check_pass "ENTSO-E refresh endpoint defined" || \
        check_fail "ENTSO-E refresh endpoint missing"
    
    grep -q "refresh-prices/eia" routers/admin.py && \
        check_pass "EIA refresh endpoint defined" || \
        check_fail "EIA refresh endpoint missing"
else
    check_fail "admin.py not found"
fi

# 7. Check Dockerfile
echo ""
echo "7️⃣  Checking Docker configuration..."

if [ -f "Dockerfile" ]; then
    check_pass "Dockerfile found"
    
    # Check for required instructions
    grep -q "FROM python:" Dockerfile && check_pass "Python base image" || check_fail "Missing Python base"
    grep -q "requirements.txt" Dockerfile && check_pass "Requirements installation" || check_warn "Missing requirements"
else
    check_fail "Dockerfile not found"
fi

# 8. Test price fetch locally
echo ""
echo "8️⃣  Testing price fetch locally..."

if [ -n "$ENTSOE_API_KEY" ]; then
    echo "   Fetching ENTSO-E prices..."
    python3 -c "
from utils.fetch_energy_prices import update_energy_cache
from pathlib import Path
try:
    update_energy_cache('$ENTSOE_API_KEY', Path('data/cache/energy_prices_live.json'))
    print('✅ ENTSO-E fetch successful')
except Exception as e:
    print(f'❌ ENTSO-E fetch failed: {e}')
    exit(1)
" && check_pass "ENTSO-E fetch test passed" || check_fail "ENTSO-E fetch test failed"
fi

if [ -n "$EIA_API_KEY" ]; then
    echo "   Fetching EIA prices..."
    python3 -c "
from utils.fetch_eia_prices import update_eia_prices_cache
try:
    update_eia_prices_cache('$EIA_API_KEY')
    print('✅ EIA fetch successful')
except Exception as e:
    print(f'❌ EIA fetch failed: {e}')
    exit(1)
" && check_pass "EIA fetch test passed" || check_fail "EIA fetch test failed"
fi

# 9. Check Cloud Scheduler scripts
echo ""
echo "9️⃣  Checking deployment scripts..."

[ -f "setup_cloud_schedulers.sh" ] && check_pass "setup_cloud_schedulers.sh found" || check_warn "setup_cloud_schedulers.sh missing"
[ -f "setup_cloud_schedulers_realtime.sh" ] && check_pass "setup_cloud_schedulers_realtime.sh found" || check_warn "setup_cloud_schedulers_realtime.sh missing"

# Make executable
chmod +x setup_cloud_schedulers.sh 2>/dev/null || true
chmod +x setup_cloud_schedulers_realtime.sh 2>/dev/null || true

# 10. Summary
echo ""
echo "=========================================="
echo "📊 DEPLOYMENT READINESS SUMMARY"
echo "=========================================="
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL CHECKS PASSED!${NC}"
    echo ""
    echo "✅ System is ready for production deployment"
    echo ""
    echo "Next steps:"
    echo "1. Deploy to Cloud Run:"
    echo "   gcloud run deploy smart-tco-backend --source . --region europe-west1"
    echo ""
    echo "2. Setup Cloud Schedulers:"
    echo "   ./setup_cloud_schedulers_realtime.sh PROJECT_ID BACKEND_URL"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  PASSED WITH $WARNINGS WARNING(S)${NC}"
    echo ""
    echo "System can be deployed but review warnings above"
    exit 0
else
    echo -e "${RED}❌ FAILED WITH $ERRORS ERROR(S) AND $WARNINGS WARNING(S)${NC}"
    echo ""
    echo "Please fix errors above before deploying to production"
    exit 1
fi
