# Employee Manager Server

A lightweight Node.js server for the Employee Manager application with SQLite database and RESTful API.

## 🚀 Quick Deployment

### Prerequisites
- Node.js (v18 or higher)
- npm (comes with Node.js)

### One-Command Deployment

**Linux/macOS:**
```bash
./deploy.sh
```

**Windows:**
```cmd
deploy.bat
```

That's it! The script will:
- ✅ Check prerequisites
- ✅ Install dependencies
- ✅ Initialize database with sample data
- ✅ Create configuration files
- ✅ Set up management scripts
- ✅ Test the server

## 📁 Server Structure

```
server/
├── src/
│   ├── index.js          # Main server application
│   ├── initDb.js         # Database initialization
│   └── generateLargeDataset.js  # Sample data generator
├── package.json          # Dependencies and scripts
├── deploy.sh            # Linux/macOS deployment script
├── deploy.bat           # Windows deployment script
├── start-server.sh      # Server startup script (created by deploy)
├── stop-server.sh       # Server stop script (created by deploy)
├── update-server.sh     # Server update script (created by deploy)
├── .env                 # Environment configuration (created by deploy)
└── database.sqlite      # SQLite database (created by deploy)
```

## 🔧 Management Commands

After deployment, use these scripts:

### Start/Stop Server
```bash
# Start server
./start-server.sh        # Linux/macOS
start-server.bat         # Windows

# Stop server
./stop-server.sh         # Linux/macOS
stop-server.bat          # Windows
```

### Update Server
```bash
# Update from git repository
./update-server.sh       # Linux/macOS
update-server.bat        # Windows
```

### Manual Commands
```bash
# Install dependencies
npm install

# Initialize/reset database
npm run init-db

# Start in development mode
npm run dev

# Start in production mode
NODE_ENV=production npm start
```

## ⚙️ Configuration

Edit `.env` file to configure:

```bash
# Server Configuration
PORT=3001
NODE_ENV=production
CORS_ORIGIN=*

# Database
DB_PATH=./database.sqlite

# Logging
LOG_LEVEL=info
```

## 🌐 API Endpoints

- **Health Check:** `GET /api/health`
- **Employees:** `GET /api/employees`
- **Employee by ID:** `GET /api/employees/:id`
- **Create Employee:** `POST /api/employees`
- **Update Employee:** `PUT /api/employees/:id`
- **Delete Employee:** `DELETE /api/employees/:id`

### Query Parameters for Employees
- `page` - Page number (default: 1)
- `limit` - Records per page (default: 50)
- `search` - Search by name or email
- `department` - Filter by department
- `status` - Filter by status
- `sortBy` - Sort field (default: name)
- `sortOrder` - Sort direction (ASC/DESC)

## 🌐 Network Configuration

1. **Deploy server on your network:**
   ```bash
   # Set server IP
   export SERVER_IP=192.168.1.100
   
   # Deploy server
   ./deploy.sh
   ```

2. **Configure client:**
   - Launch Employee Manager desktop app
   - Go to Settings → Server Configuration
   - Set server URL: `http://192.168.1.100:3001`
   - Test connection

## 🛠️ Troubleshooting

### Server won't start
```bash
# Check if port is in use
lsof -i :3001        # Linux/macOS
netstat -an | findstr :3001  # Windows

# Kill process using port
kill -9 $(lsof -t -i:3001)  # Linux/macOS
```

### Database issues
```bash
# Reset database
rm database.sqlite
npm run init-db
```

### Permission issues (Linux/macOS)
```bash
# Make scripts executable
chmod +x *.sh
```

## 📊 Features

- **RESTful API** with Express.js
- **SQLite database** for easy deployment
- **CORS support** for cross-origin requests
- **Pagination** for large datasets
- **Search and filtering** capabilities
- **Security headers** for production use
- **Health checks** for monitoring
- **Environment configuration**
- **Auto-generated sample data**

## 🔄 Updates

To update the server:

1. **With Git:**
   ```bash
   git pull origin master
   npm install --production
   ```

2. **Using update script:**
   ```bash
   ./update-server.sh
   ```

3. **Manual update:**
   - Download latest server files
   - Replace existing files
   - Run `npm install --production`

## 📞 Support

For issues or questions:
- Check the troubleshooting section above
- Review server logs for error messages
- Ensure all prerequisites are installed
- Verify network connectivity and firewall settings

---

**Employee Manager Server v1.0.1** - Ready for enterprise deployment! 🚀
