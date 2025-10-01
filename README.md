
🚀 Quick Start
1. Server Setup (Private Network)
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
The client can connect to different server instances:

Default: http://localhost:3001 (for local testing)
Production: Configure via the Settings page in the application
Private Network: Use the private IP address of your server
🗄️ Database Schema
CREATE TABLE employees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  department TEXT NOT NULL,
  position TEXT NOT NULL,
  salary INTEGER NOT NULL,
  hire_date TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
🌐 API Endpoints
Employee Operations
GET /api/employees - List all employees
GET /api/employees/:id - Get specific employee
POST /api/employees - Create new employee
PUT /api/employees/:id - Update employee
DELETE /api/employees/:id - Delete employee
Dashboard Data
GET /api/dashboard/stats - Overall statistics
GET /api/dashboard/departments - Department analytics
Health Check
GET /api/health - Server health status
🔒 VPN/ZTNA Demonstration Scenarios
Scenario 1: Remote Employee Access
Setup: Deploy server on private subnet (e.g., 192.168.1.100:3001)
Problem: Client cannot access server without VPN
Solution: Connect via VPN/ZTNA, configure client to use private IP
Demo: Show successful data retrieval and management
Scenario 2: Branch Office Connectivity
Setup: Server in corporate HQ, client in branch office
Challenge: Secure access to internal employee database
Solution: ZTNA tunnel for secure, encrypted access
Benefit: No complex firewall rules, zero-trust access
Scenario 3: Contractor Access
Setup: Temporary access for external contractors
Requirement: Limited-time access to employee management system
Solution: Time-limited ZTNA access policies
Security: Granular access control, session monitoring
📦 Distribution
Client Distribution
Windows: .msi installer or portable .exe
macOS: .dmg installer or .app bundle
Size: ~15-20MB (efficient Tauri compilation)
Requirements: None (all dependencies bundled)
Server Deployment
# For production deployment
cd server
npm install --production
npm run init-db
npm start
🔧 Development
Prerequisites
Rust: Latest stable version
Node.js: v16 or higher
npm: Latest version
Development Workflow
Start server: cd server && npm run dev
Start client: cd employee-manager && npm run tauri:dev
Make changes to React components or Rust backend
Hot reload automatically applies changes
