# Deployment Guide

## 🚀 Quick Deployment

### Option 1: Docker (Recommended)

```bash
# Build and start with Docker Compose
docker-compose up -d

# The server will be available at:
# - Direct: http://your-server:3001
# - Through Nginx: http://your-server
```

### Option 2: Manual Deployment

#### Server Deployment
```bash
# Deploy to your private network server
scp -r server/ user@your-server:/opt/employee-manager/
ssh user@your-server

# Setup on server
cd /opt/employee-manager
npm install --production
npm run init-db
PORT=3001 npm start
```

#### Client Distribution
```bash
# Build desktop applications
./build-client.sh

# Distribute the built applications:
# - macOS: src-tauri/target/release/bundle/dmg/
# - Windows: src-tauri/target/release/bundle/msi/
```

## 🔒 VPN/ZTNA Configuration

### Private Network Setup
```bash
# Set your server's private IP
export SERVER_IP=192.168.1.100

# Deploy server on private network
./deploy-server.sh
```

### Client Configuration
1. Launch the desktop application
2. Go to Settings → Server Configuration
3. Update server URL to: `http://192.168.1.100:3001`
4. Test connection

## 🧪 Demo Scenarios

### Scenario 1: Remote Employee Access
1. Deploy server on private network (192.168.1.100:3001)
2. Employee works from home without VPN → Connection fails
3. Employee connects via VPN → Full application access
4. Demonstrate secure data management

### Scenario 2: Branch Office Connectivity
1. Server at headquarters, client at branch office
2. ZTNA tunnel for secure access
3. Show policy enforcement and monitoring

### Scenario 3: Contractor Access
1. Time-limited access for external contractors
2. Granular permission controls
3. Session monitoring and logging

## 🔧 Environment Variables

Create a `.env` file:

```bash
# Server Configuration
PORT=3001
NODE_ENV=production
CORS_ORIGIN=*
```

## 🛠️ Troubleshooting

### Build Issues
```bash
# If Tauri build fails, try:
cd employee-manager
cargo clean
npm run build
npm run tauri:build
```

### Server Connection Issues
```bash
# Test server connectivity
curl http://localhost:3001/api/health

# Check server logs
docker logs employee-manager-server
```

### Database Issues
```bash
# Reinitialize database
cd server
npm run init-db
```

## 📋 Deployment Checklist

- [x] Code quality and compilation
- [x] Dependency management
- [x] Build process validation
- [x] Docker configuration
- [x] Security headers
- [x] Health checks
- [x] Error handling
- [x] Documentation
- [ ] SSL/TLS certificates (optional for private networks)
- [ ] Monitoring setup (optional)
- [ ] Backup strategy (optional)

**Status: ✅ READY FOR DEPLOYMENT**