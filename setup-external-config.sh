#!/bin/bash

# Employee Management System - External Config Setup Script
# This script helps users set up external configuration for the server URL

echo "🔧 Employee Management System - External Config Setup"
echo "=================================================="
echo ""

# Detect operating system
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    CONFIG_DIR="$HOME/Library/Application Support/com.employeemanager"
    OS_NAME="macOS"
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    # Windows (Git Bash or similar)
    CONFIG_DIR="$APPDATA/com.employeemanager"
    OS_NAME="Windows"
else
    # Linux or other
    CONFIG_DIR="$HOME/.config/com.employeemanager"
    OS_NAME="Linux"
fi

echo "📱 Operating System: $OS_NAME"
echo "📁 Config Directory: $CONFIG_DIR"
echo ""

# Create config directory
echo "📂 Creating config directory..."
mkdir -p "$CONFIG_DIR"

# Create config file
CONFIG_FILE="$CONFIG_DIR/config.json"
echo "📄 Creating config file: $CONFIG_FILE"

# Get server URL from user
echo ""
echo "🌐 Enter the server URL (e.g., http://employee-db.se-island.life:4001):"
read -p "Server URL: " SERVER_URL

# Validate server URL
if [[ -z "$SERVER_URL" ]]; then
    echo "❌ Server URL cannot be empty. Using default."
    SERVER_URL="http://employee-db.se-island.life:4001"
fi

# Create the config file
cat > "$CONFIG_FILE" << EOF
{
  "server_url": "$SERVER_URL",
  "description": "Employee Management System Configuration",
  "created": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "instructions": {
    "note": "This file overrides the app's internal server URL setting",
    "restart_required": "Restart the Employee Management System app to apply changes"
  }
}
EOF

echo ""
echo "✅ Configuration file created successfully!"
echo ""
echo "📋 Configuration Details:"
echo "   • Server URL: $SERVER_URL"
echo "   • Config File: $CONFIG_FILE"
echo "   • Created: $(date)"
echo ""
echo "🚀 Next Steps:"
echo "   1. Restart the Employee Management System app"
echo "   2. The app will automatically use the new server URL"
echo "   3. To change the server URL again, edit: $CONFIG_FILE"
echo ""
echo "🔧 Manual Configuration:"
echo "   You can also manually edit the config file at any time:"
echo "   $CONFIG_FILE"
echo ""
echo "📖 For more information, see: EXTERNAL_CONFIG.md"
