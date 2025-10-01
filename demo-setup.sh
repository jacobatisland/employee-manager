#!/bin/bash

# Employee Management System - Complete Demo Setup
# Prepares both client and server for VPN/ZTNA demonstration

set -e

echo "🎯 Employee Management System - VPN/ZTNA Demo Setup"
echo "====================================================="
echo ""
echo "This script will prepare a complete demonstration of a client-server"
echo "application perfect for showcasing VPN/ZTNA capabilities."
echo ""

# Function to show demo scenarios
show_demo_scenarios() {
    echo "📋 Demo Scenarios:"
    echo ""
    echo "1. 🏠 Remote Employee Access"
    echo "   • Server on private network (e.g., 192.168.1.100:3001)"
    echo "   • Employee works from home, needs VPN to access"
    echo "   • Show before/after VPN connection"
    echo ""
    echo "2. 🏢 Branch Office Connectivity"
    echo "   • Server at HQ, client at branch office"
    echo "   • ZTNA tunnel for secure employee data access"
    echo "   • Demonstrate zero-trust security model"
    echo ""
    echo "3. 👥 Contractor Access"
    echo "   • Time-limited access for external contractors"
    echo "   • Granular access control and monitoring"
    echo "   • Show policy enforcement"
    echo ""
}

# Function to setup server
setup_server() {
    echo "🌐 Setting up server (private network side)..."
    cd server
    
    if [ ! -d "node_modules" ]; then
        npm install
    fi
    
    npm run init-db
    echo "✅ Server ready for private network deployment"
    cd ..
}

# Function to setup client
setup_client() {
    echo "📱 Setting up client (user device side)..."
    cd employee-manager
    
    if [ ! -d "node_modules" ]; then
        npm install
    fi
    
    echo "✅ Client ready for building/development"
    cd ..
}

# Main setup flow
echo "What would you like to set up?"
echo ""
echo "1) Complete setup (server + client)"
echo "2) Server only (for private network)"
echo "3) Client only (for development/building)"
echo "4) Show demo scenarios"
echo ""
read -p "Choose option (1-4): " -n 1 -r
echo ""

case $REPLY in
    1)
        echo ""
        echo "🔧 Setting up complete demo environment..."
        setup_server
        setup_client
        show_demo_scenarios
        echo ""
        echo "✅ Complete setup finished!"
        echo ""
        echo "🚀 Next steps:"
        echo "   1. Deploy server: ./deploy-server.sh"
        echo "   2. Build client: ./build-client.sh"
        echo "   3. Configure your VPN/ZTNA solution"
        echo "   4. Demonstrate secure access scenarios"
        ;;
    2)
        echo ""
        setup_server
        echo ""
        echo "🚀 To deploy the server:"
        echo "   ./deploy-server.sh"
        ;;
    3)
        echo ""
        setup_client
        echo ""
        echo "🚀 To build the client:"
        echo "   ./build-client.sh"
        echo ""
        echo "🔧 To develop the client:"
        echo "   cd employee-manager && npm run tauri:dev"
        ;;
    4)
        echo ""
        show_demo_scenarios
        ;;
    *)
        echo "Invalid option selected"
        exit 1
        ;;
esac

echo ""
echo "📚 See README.md for detailed documentation and setup instructions"
