#!/bin/bash

# Employee Management System - Server Deployment Script
# Sets up and starts the server for private network hosting

set -e

echo "🌐 Deploying Employee Management System Server..."
echo "=================================================="

# Navigate to server directory
cd "$(dirname "$0")/server"

# Install dependencies
echo "📦 Installing server dependencies..."
npm install --production

# Initialize database
echo "🗄️  Initializing database with sample data..."
npm run init-db

# Display configuration info
echo ""
echo "⚙️  Server Configuration:"
echo "   • Port: ${PORT:-3001}"
echo "   • Listen Address: 0.0.0.0 (all interfaces)"
echo "   • Database: SQLite (database.sqlite)"
echo ""

# Check if we should start the server
read -p "🚀 Start the server now? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🔥 Starting server..."
    echo "   Access at: http://$(hostname -I | awk '{print $1}'):${PORT:-3001}"
    echo "   Health check: http://$(hostname -I | awk '{print $1}'):${PORT:-3001}/api/health"
    echo ""
    echo "💡 Configure your VPN/ZTNA solution to allow access to this server"
    echo "   Then point the client application to this server's IP address"
    echo ""
    npm start
else
    echo ""
    echo "✅ Server deployed successfully!"
    echo ""
    echo "🚀 To start the server manually:"
    echo "   cd server && npm start"
    echo ""
    echo "📝 Server will be accessible at:"
    echo "   http://$(hostname -I | awk '{print $1}'):${PORT:-3001}"
fi
