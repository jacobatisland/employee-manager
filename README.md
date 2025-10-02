# Employee Manager - Deployment Guide

## 🚀 Server Deployment

### Quick Deploy (Recommended)
```bash
# Clone server folder only
git clone --filter=blob:none --sparse-checkout https://github.com/jacobatisland/employee-manager.git
cd employee-manager
git sparse-checkout set server
cd server

# Deploy with one command
./deploy.sh
```

### Manual Deploy
```bash
cd server
npm install --production
npm run init-db
npm start
```

## 🔧 Configuration

### Server Environment Variables
```bash
PORT=3001                    # Server port (default: 3001)
NODE_ENV=production          # Environment mode
CORS_ORIGIN=*               # CORS policy
DB_PATH=./database.sqlite   # Database location
LOG_LEVEL=info              # Logging level
```

### Client Configuration
1. Launch the desktop application
2. Go to Settings → Server Configuration
3. Set server URL: `http://your-server-ip:3001`
4. Test connection


## 📦 Client Distribution

### Building Client
```bash
cd employee-manager
npm install
npm run tauri:build
```

### Distribution Files
- **macOS**: `src-tauri/target/release/bundle/dmg/`
- **Windows**: `src-tauri/target/release/bundle/msi/`

## 🛠️ Management Commands

### Server Management
```bash
# Start server
./start-server.sh

# Stop server
./stop-server.sh

# Update server
./update-server.sh

# Reset database
npm run init-db
```

### Development
```bash
# Server development
cd server && npm run dev

# Client development
cd employee-manager && npm run tauri:dev
```

## 📋 Prerequisites

- **Node.js**: v18 or higher
- **npm**: Latest version
- **Rust**: Latest stable (for client builds)
- **Git**: For cloning repository

## 🔍 Troubleshooting

### Server Issues
```bash
# Check if port is in use
lsof -i :3001        # Linux/macOS
netstat -an | findstr :3001  # Windows

# Reset database
rm database.sqlite && npm run init-db
```

### Client Issues
```bash
# Clean build
cd employee-manager
cargo clean
npm run build
npm run tauri:build
```

## 📄 License

This demo application is provided as-is for demonstration purposes.