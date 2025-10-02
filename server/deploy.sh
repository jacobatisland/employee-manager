#!/bin/bash

# Employee Manager Server - Self-Deployment Script
# This script is included in the server folder for easy deployment

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PORT=${PORT:-3001}
NODE_ENV=${NODE_ENV:-production}

echo -e "${BLUE}🚀 Employee Manager Server - Self-Deployment${NC}"
echo "=============================================="
echo ""

# Function to print status messages
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if node is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js (v18+) first."
    echo "Download from: https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

print_status "Prerequisites check passed"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the server directory."
    exit 1
fi

# Install dependencies
print_info "Installing dependencies..."
npm install --production

print_status "Dependencies installed"

# Initialize database if it doesn't exist
if [ ! -f "database.sqlite" ]; then
    print_info "Initializing database..."
    npm run init-db
    print_status "Database initialized with sample data"
else
    print_info "Database already exists, skipping initialization"
fi

# Create environment file if it doesn't exist
if [ ! -f ".env" ]; then
    print_info "Creating environment configuration..."
    cat > .env << EOF
# Employee Manager Server Configuration
PORT=$PORT
NODE_ENV=$NODE_ENV
CORS_ORIGIN=*

# Database
DB_PATH=./database.sqlite

# Logging
LOG_LEVEL=info
EOF
    print_status "Environment configuration created"
else
    print_info "Environment file already exists"
fi

# Create startup script
print_info "Creating startup script..."
cat > start-server.sh << 'EOF'
#!/bin/bash
# Employee Manager Server Startup Script

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '#' | awk '/=/ {print $1}')
fi

# Start the server
echo "🚀 Starting Employee Manager Server..."
echo "Port: ${PORT:-3001}"
echo "Environment: ${NODE_ENV:-production}"
echo "Database: ${DB_PATH:-./database.sqlite}"
echo ""

node src/index.js
EOF

chmod +x start-server.sh

print_status "Startup script created"

# Create stop script
print_info "Creating stop script..."
cat > stop-server.sh << 'EOF'
#!/bin/bash
# Employee Manager Server Stop Script

echo "🛑 Stopping Employee Manager Server..."

# Find and kill the server process
PID=$(pgrep -f "node src/index.js")
if [ ! -z "$PID" ]; then
    kill $PID
    echo "Server stopped (PID: $PID)"
else
    echo "Server is not running"
fi
EOF

chmod +x stop-server.sh

print_status "Stop script created"

# Create update script
print_info "Creating update script..."
cat > update-server.sh << 'EOF'
#!/bin/bash
# Employee Manager Server Update Script

echo "🔄 Updating Employee Manager Server..."

# Check if git is available
if command -v git &> /dev/null; then
    echo "Updating from git repository..."
    git pull origin master
    npm install --production
    echo "✅ Server updated successfully"
else
    echo "⚠️  Git not available. Please update manually:"
    echo "1. Download latest server files"
    echo "2. Replace current files"
    echo "3. Run: npm install --production"
fi
EOF

chmod +x update-server.sh

print_status "Update script created"

# Test the server
print_info "Testing server startup..."
timeout 10s node src/index.js &
SERVER_PID=$!
sleep 3

# Check if server is running
if kill -0 $SERVER_PID 2>/dev/null; then
    print_status "Server test successful"
    kill $SERVER_PID 2>/dev/null || true
else
    print_error "Server test failed"
    exit 1
fi

# Display final information
echo ""
echo -e "${GREEN}🎉 Server deployment completed successfully!${NC}"
echo "=============================================="
echo ""
echo -e "${BLUE}📁 Server Directory:${NC} $(pwd)"
echo -e "${BLUE}🌐 Server URL:${NC} http://localhost:$PORT"
echo -e "${BLUE}📊 API Health:${NC} http://localhost:$PORT/api/health"
echo -e "${BLUE}👥 Employees API:${NC} http://localhost:$PORT/api/employees"
echo ""
echo -e "${YELLOW}🚀 Quick Start Commands:${NC}"
echo "  Start server:    ./start-server.sh"
echo "  Stop server:     ./stop-server.sh"
echo "  Update server:   ./update-server.sh"
echo ""
echo -e "${YELLOW}🔧 Management Commands:${NC}"
echo "  Restart DB:      npm run init-db"
echo "  Install deps:    npm install"
echo "  View logs:       tail -f server.log"
echo ""
echo -e "${YELLOW}📋 Configuration:${NC}"
echo "  Edit settings:   nano .env"
echo "  Change port:     PORT=3002 ./start-server.sh"
echo "  Production:      NODE_ENV=production ./start-server.sh"
echo ""

# Ask if user wants to start the server now
read -p "Do you want to start the server now? (Y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Nn]$ ]]; then
    print_info "Server ready to start. Run './start-server.sh' when ready."
else
    print_info "Starting server..."
    ./start-server.sh
fi
