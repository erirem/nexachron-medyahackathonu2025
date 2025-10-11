#!/bin/bash

# ===========================================
# Nexachron Docker Start Script
# ===========================================
# Kolay başlatma ve environment kontrolü

set -e

# Renkli output için
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logo
echo -e "${BLUE}"
echo "==========================================="
echo "  🚀 Nexachron Docker Development Setup"
echo "==========================================="
echo -e "${NC}"

# ===========================================
# Environment Check
# ===========================================
echo -e "${YELLOW}🔍 Environment kontrolü yapılıyor...${NC}"

# .env dosyası kontrolü
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ .env dosyası bulunamadı!${NC}"
    echo -e "${YELLOW}💡 .env.example dosyasını .env olarak kopyalayın ve değerleri doldurun:${NC}"
    echo "   cp .env.example .env"
    exit 1
fi

# Gerekli environment değişkenlerini kontrol et
source .env

required_vars=(
    "SUPABASE_URL"
    "SUPABASE_ANON_KEY"
    "SUPABASE_SERVICE_ROLE_KEY"
    "OPENAI_API_KEY"
)

missing_vars=()

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    echo -e "${RED}❌ Eksik environment değişkenleri:${NC}"
    for var in "${missing_vars[@]}"; do
        echo -e "   - $var"
    done
    echo -e "${YELLOW}💡 .env dosyasını kontrol edin ve eksik değerleri doldurun.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Environment değişkenleri tamam!${NC}"

# ===========================================
# Docker Check
# ===========================================
echo -e "${YELLOW}🐳 Docker kontrolü yapılıyor...${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker yüklü değil!${NC}"
    echo -e "${YELLOW}💡 Docker'ı yükleyin: https://docs.docker.com/get-docker/${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose yüklü değil!${NC}"
    echo -e "${YELLOW}💡 Docker Compose'u yükleyin: https://docs.docker.com/compose/install/${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker ve Docker Compose hazır!${NC}"

# ===========================================
# API .env dosyası oluştur
# ===========================================
echo -e "${YELLOW}📝 API .env dosyası oluşturuluyor...${NC}"

if [ ! -f "apps/api/.env" ]; then
    cat > apps/api/.env << EOF
# API Environment Variables
NODE_ENV=development
PORT=4000
FRONTEND_URL=http://localhost:3000
SUPABASE_URL=${SUPABASE_URL}
SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
OPENAI_API_KEY=${OPENAI_API_KEY}
OPENAI_API_URL=${OPENAI_API_URL:-https://api.openai.com/v1}
LOG_LEVEL=${LOG_LEVEL:-debug}
EOF
    echo -e "${GREEN}✅ apps/api/.env dosyası oluşturuldu!${NC}"
else
    echo -e "${BLUE}ℹ️  apps/api/.env dosyası zaten mevcut.${NC}"
fi

# ===========================================
# Web .env.local dosyası oluştur
# ===========================================
echo -e "${YELLOW}📝 Web .env.local dosyası oluşturuluyor...${NC}"

if [ ! -f "apps/web/.env.local" ]; then
    cat > apps/web/.env.local << EOF
# Web Environment Variables
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
EOF
    echo -e "${GREEN}✅ apps/web/.env.local dosyası oluşturuldu!${NC}"
else
    echo -e "${BLUE}ℹ️  apps/web/.env.local dosyası zaten mevcut.${NC}"
fi

# ===========================================
# Docker Compose Başlatma
# ===========================================
echo -e "${YELLOW}🚀 Docker Compose başlatılıyor...${NC}"

# Eski container'ları temizle
echo -e "${BLUE}🧹 Eski container'lar temizleniyor...${NC}"
docker-compose down --remove-orphans 2>/dev/null || true

# Build ve başlat
echo -e "${BLUE}🔨 Container'lar build ediliyor...${NC}"
docker-compose build --no-cache

echo -e "${BLUE}🚀 Servisler başlatılıyor...${NC}"
docker-compose up -d

# ===========================================
# Health Check
# ===========================================
echo -e "${YELLOW}🏥 Servislerin sağlık durumu kontrol ediliyor...${NC}"

# API health check
echo -n "API servisi kontrol ediliyor... "
for i in {1..30}; do
    if curl -s http://localhost:4000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}❌${NC}"
        echo -e "${RED}API servisi başlatılamadı! Logları kontrol edin: docker-compose logs api${NC}"
        exit 1
    fi
    sleep 2
done

# Web health check
echo -n "Web servisi kontrol ediliyor... "
for i in {1..30}; do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo -e "${GREEN}✅${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}❌${NC}"
        echo -e "${RED}Web servisi başlatılamadı! Logları kontrol edin: docker-compose logs web${NC}"
        exit 1
    fi
    sleep 2
done

# Mobile health check
echo -n "Mobile servisi kontrol ediliyor... "
for i in {1..30}; do
    if curl -s http://localhost:8080 > /dev/null 2>&1; then
        echo -e "${GREEN}✅${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${YELLOW}⚠️${NC}"
        echo -e "${YELLOW}Mobile servisi henüz hazır değil, biraz daha bekleyin...${NC}"
    fi
    sleep 2
done

# ===========================================
# Başarı Mesajı
# ===========================================
echo -e "${GREEN}"
echo "==========================================="
echo "  🎉 Nexachron başarıyla başlatıldı!"
echo "==========================================="
echo -e "${NC}"

echo -e "${BLUE}📱 Servisler:${NC}"
echo -e "   🌐 Web App:     http://localhost:3000"
echo -e "   🔧 API:         http://localhost:4000"
echo -e "   📱 Mobile:      http://localhost:8080"
echo ""

echo -e "${BLUE}🛠️  Yararlı komutlar:${NC}"
echo -e "   📊 Logları görüntüle:  docker-compose logs -f"
echo -e "   🔄 Servisleri yeniden başlat: docker-compose restart"
echo -e "   🛑 Servisleri durdur:  docker-compose down"
echo -e "   🧹 Temizle:           docker-compose down --volumes --remove-orphans"
echo ""

echo -e "${GREEN}🚀 Geliştirmeye başlayabilirsiniz!${NC}"
