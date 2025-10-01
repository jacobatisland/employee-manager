
# 🚀 Quick Start
# Navigate to server directory
cd server

# Install dependencies
npm install

# Initialize database with sample data
npm run init-db

# Start the server
npm start
The server will run on http://0.0.0.0:3001 by default.

2. Client Development
# Navigate to client directory
cd employee-manager

# Install dependencies
npm install

# Run in development mode
npm run tauri:dev
3. Building Client Executables
# Build production executables
npm run tauri:build

# Build debug version (faster, larger file)
npm run tauri:build:debug
Built applications will be in src-tauri/target/release/bundle/

🔧 Configuration
Server Configuration
The server can be configured via environment variables:

PORT=3001                    # Server port (default: 3001)
Client Configuration


# For production deployment
cd server
npm install --production
npm run init-db
npm start

