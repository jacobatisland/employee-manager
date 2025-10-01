# Employee Management System - VPN/ZTNA Demo Application

A professional desktop application designed to demonstrate VPN/ZTNA capabilities by showcasing a client-server architecture where the client application connects to a server hosted on a private network.

## 🎯 Purpose

This serves as a simple demo application for private access. This repo includes both the client and server application.

## 🏗️ Architecture

### Client (Desktop Application)
- **Framework**: Tauri (Rust + React)
- **UI**: Modern React with TypeScript and Tailwind CSS
- **Distribution**: Compiled native executables (.exe for Windows, .app for Mac)
- **Dependencies**: None for end users (standalone executables)

### Server (Private Network)
- **Framework**: Node.js with Express
- **Database**: SQLite with realistic employee data
- **API**: RESTful endpoints for CRUD operations
- **Network**: Designed to run on private subnets

## 🚀 Quick Start

### 1. Server Setup (Private Network)

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Initialize database with sample data
npm run init-db

# Start the server
npm start
```

The server will run on `http://0.0.0.0:3001` by default.

### 2. Client Development

```bash
# Navigate to client directory
cd employee-manager

# Install dependencies
npm install

# Run in development mode
npm run tauri:dev
```

### 3. Building Client Executables

```bash
# Build production executables
npm run tauri:build

# Build debug version (faster, larger file)
npm run tauri:build:debug
```

Built applications will be in `src-tauri/target/release/bundle/`

## 📱 Application Features

### Dashboard
- **Employee Analytics**: Total employees, departments, average salary
- **Visual Charts**: Department distribution, salary ranges
- **Recent Hires**: Tracking new employees in the last 30 days
- **Department Stats**: Employee count and average salary by department

### Employee Management
- **Complete CRUD Operations**: Create, read, update, delete employees
- **Professional Interface**: Table view with search and filtering
- **Form Validation**: Comprehensive data validation
- **Real-time Updates**: Immediate sync with server

### Settings
- **Server Configuration**: Changeable server URL for different environments
- **Connection Testing**: Verify connectivity to the private server

## 🔧 Configuration

### Server Configuration

The server can be configured via environment variables:

```bash
PORT=3001                    # Server port (default: 3001)
```

### Client Configuration

The client can connect to different server instances:

1. **Default**: `http://localhost:3001` (for local testing)
2. **Production**: Configure via the Settings page in the application
3. **Private Network**: Use the private IP address of your server

## 🗄️ Database Schema

```sql
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
```

## 🌐 API Endpoints

### Employee Operations
- `GET /api/employees` - List all employees
- `GET /api/employees/:id` - Get specific employee
- `POST /api/employees` - Create new employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Dashboard Data
- `GET /api/dashboard/stats` - Overall statistics
- `GET /api/dashboard/departments` - Department analytics

### Health Check
- `GET /api/health` - Server health status

## 🔒 VPN/ZTNA Demonstration Scenarios

### Scenario 1: Remote Employee Access
1. **Setup**: Deploy server on private subnet (e.g., 192.168.1.100:3001)
2. **Problem**: Client cannot access server without VPN
3. **Solution**: Connect via VPN/ZTNA, configure client to use private IP
4. **Demo**: Show successful data retrieval and management

### Scenario 2: Branch Office Connectivity
1. **Setup**: Server in corporate HQ, client in branch office
2. **Challenge**: Secure access to internal employee database
3. **Solution**: ZTNA tunnel for secure, encrypted access
4. **Benefit**: No complex firewall rules, zero-trust access

### Scenario 3: Contractor Access
1. **Setup**: Temporary access for external contractors
2. **Requirement**: Limited-time access to employee management system
3. **Solution**: Time-limited ZTNA access policies
4. **Security**: Granular access control, session monitoring

## 📦 Distribution

### Client Distribution
- **Windows**: `.msi` installer or portable `.exe`
- **macOS**: `.dmg` installer or `.app` bundle
- **Size**: ~15-20MB (efficient Tauri compilation)
- **Requirements**: None (all dependencies bundled)

### Server Deployment
```bash
# For production deployment
cd server
npm install --production
npm run init-db
npm start
```

## 🔧 Development

### Prerequisites
- **Rust**: Latest stable version
- **Node.js**: v16 or higher
- **npm**: Latest version

### Development Workflow
1. Start server: `cd server && npm run dev`
2. Start client: `cd employee-manager && npm run tauri:dev`
3. Make changes to React components or Rust backend
4. Hot reload automatically applies changes

## 📊 Sample Data

The application includes realistic sample data:
- **10 employees** across 6 departments
- **Departments**: Engineering, Marketing, HR, Finance, Sales, Design
- **Salary ranges**: $60k - $130k (realistic for different roles)
- **Hire dates**: Spread over 2020-2023

## 🔍 Testing the Demo

### Network Isolation Test
1. Start server on private network
2. Verify client cannot connect without VPN
3. Connect VPN/ZTNA
4. Configure client to use private server IP
5. Demonstrate successful connection and data operations

### Security Features Demo
1. Show encrypted traffic (via VPN/ZTNA)
2. Demonstrate access control policies
3. Show connection logging and monitoring
4. Test network segmentation

## 📄 License

This demo application is provided as-is for demonstration purposes of VPN/ZTNA capabilities.

---

**Perfect for demonstrating:**
- Network segmentation challenges
- Secure remote access needs
- Zero Trust Network Access benefits
- Modern application security requirements
