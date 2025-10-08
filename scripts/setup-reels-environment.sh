#!/bin/bash

# Nexachron Reels System Environment Setup Script
# Run this script to set up the complete reels environment

set -e

echo "🎬 Nexachron Reels System Environment Setup"
echo "==========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root"
   exit 1
fi

print_status "Starting environment setup..."

# 1. Check Node.js version
print_status "Checking Node.js version..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_success "Node.js found: $NODE_VERSION"
    
    # Check if version is >= 20
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
    if [ "$NODE_MAJOR" -lt 20 ]; then
        print_error "Node.js version 20+ required. Current: $NODE_VERSION"
        exit 1
    fi
else
    print_error "Node.js not found. Please install Node.js 20+"
    exit 1
fi

# 2. Check pnpm
print_status "Checking pnpm..."
if command -v pnpm &> /dev/null; then
    PNPM_VERSION=$(pnpm --version)
    print_success "pnpm found: $PNPM_VERSION"
else
    print_error "pnpm not found. Please install pnpm"
    exit 1
fi

# 3. Install system dependencies
print_status "Checking system dependencies..."

# Check FFmpeg
if command -v ffmpeg &> /dev/null; then
    FFMPEG_VERSION=$(ffmpeg -version | head -n1)
    print_success "FFmpeg found: $FFMPEG_VERSION"
else
    print_warning "FFmpeg not found. Installing..."
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo apt update && sudo apt install -y ffmpeg
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        brew install ffmpeg
    else
        print_error "Please install FFmpeg manually for your OS"
        exit 1
    fi
fi

# Check ImageMagick
if command -v convert &> /dev/null; then
    IMAGEMAGICK_VERSION=$(convert -version | head -n1)
    print_success "ImageMagick found: $IMAGEMAGICK_VERSION"
else
    print_warning "ImageMagick not found. Installing..."
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo apt install -y imagemagick
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        brew install imagemagick
    else
        print_error "Please install ImageMagick manually for your OS"
        exit 1
    fi
fi

# 4. Create required directories
print_status "Creating required directories..."
mkdir -p /tmp/reels/{temp,output,cache,assets}
mkdir -p ~/.nexachron/reels/{logs,backups}

print_success "Directories created successfully"

# 5. Check environment files
print_status "Checking environment configuration..."

API_ENV_FILE="apps/api/.env"
if [ ! -f "$API_ENV_FILE" ]; then
    print_warning ".env file not found. Creating from example..."
    if [ -f "apps/api/.env.example" ]; then
        cp apps/api/.env.example $API_ENV_FILE
        print_warning "Please edit $API_ENV_FILE with your actual values"
    else
        print_error ".env.example not found. Please create environment file manually"
    fi
else
    print_success "Environment file found: $API_ENV_FILE"
fi

# 6. Install Node.js dependencies
print_status "Installing Node.js dependencies..."
pnpm install

print_success "Dependencies installed successfully"

# 7. Verify database schema
print_status "Checking database schema..."
if [ -f "docs/database/reels_table.sql" ]; then
    print_success "Reels database schema found"
    print_warning "Please run the SQL schema in your Supabase dashboard:"
    print_warning "docs/database/reels_table.sql"
else
    print_error "Database schema file not found"
fi

# 8. Test system components
print_status "Testing system components..."

# Test FFmpeg
if ffmpeg -f lavfi -i testsrc=duration=1:size=320x240:rate=1 -f null - &>/dev/null; then
    print_success "FFmpeg test passed"
else
    print_error "FFmpeg test failed"
fi

# Test ImageMagick
if convert -size 100x100 xc:white /tmp/test_image.png &>/dev/null; then
    print_success "ImageMagick test passed"
    rm -f /tmp/test_image.png
else
    print_error "ImageMagick test failed"
fi

# 9. Create startup script
print_status "Creating startup script..."
cat > scripts/start-reels-dev.sh << 'EOF'
#!/bin/bash
echo "🎬 Starting Nexachron with Reels System..."

# Set environment
export NODE_ENV=development
export LOG_LEVEL=debug

# Create temp directories if they don't exist
mkdir -p /tmp/reels/{temp,output,cache}

# Start the application
cd apps/api
pnpm run start:dev
EOF

chmod +x scripts/start-reels-dev.sh
print_success "Startup script created: scripts/start-reels-dev.sh"

# 10. Environment validation
print_status "Validating environment setup..."

REQUIRED_VARS=(
    "SUPABASE_URL"
    "SUPABASE_SERVICE_ROLE_KEY"
    "OPENAI_API_KEY"
    "AZURE_SPEECH_KEY"
    "AZURE_SPEECH_REGION"
)

if [ -f "$API_ENV_FILE" ]; then
    source $API_ENV_FILE
    
    for var in "${REQUIRED_VARS[@]}"; do
        if [ -z "${!var}" ] || [ "${!var}" = "your_${var,,}" ]; then
            print_warning "Environment variable $var not set or using placeholder value"
        else
            print_success "Environment variable $var is configured"
        fi
    done
else
    print_error "Environment file not found for validation"
fi

echo ""
print_success "🎉 Reels system environment setup completed!"
echo ""
print_status "Next steps:"
echo "1. Edit apps/api/.env with your actual API keys"
echo "2. Run the database schema: docs/database/reels_table.sql"
echo "3. Start the development server: ./scripts/start-reels-dev.sh"
echo "4. Test the reels API: curl http://localhost:4000/api/reels/test/pipeline"
echo ""
print_status "For production deployment, also configure:"
echo "- CDN for video storage"
echo "- Redis for caching"
echo "- Background job queue"
echo "- Monitoring and alerting"
echo ""
print_success "Happy coding! 🚀"
