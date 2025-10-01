# Employee Management System - VPN/ZTNA Demo

A professional desktop application designed to demonstrate VPN/ZTNA capabilities through a client-server architecture where the client connects to a server on a private network.

## 🎯 Purpose

This application serves as a demo for private access scenarios, showcasing how VPN/ZTNA solutions enable secure access to internal applications.

## 🏗️ Architecture

### Client (Desktop Application)
- **Framework**: Tauri (Rust + React)
- **UI**: Modern React with TypeScript and Tailwind CSS
- **Distribution**: Native executables (.dmg for macOS, .exe for Windows)
- **Dependencies**: None for end users (standalone executables)

### Server (Private Network)
- **Framework**: Node.js with Express
- **Database**: SQLite with realistic employee data
- **API**: RESTful endpoints for CRUD operations
- **Network**: Designed to run on private subnets

## 🚀 Quick Start

### 1. Server Setup

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
- Employee analytics and visual charts
- Department distribution and salary ranges
- Recent hires tracking
- Real-time statistics

### Employee Management
- Complete CRUD operations
- Professional interface with search and filtering
- Form validation and real-time updates

### Settings
- Server configuration for different environments
- Connection testing and validation

## 🔧 Configuration

### Server Configuration
The server can be configured via environment variables:

```bash
PORT=3001                    # Server port (default: 3001)
```

### Client Configuration
The client can connect to different server instances:
1. **Default**: `http://localhost:3001` (for local testing)
2. **Production**: Configure via the Settings page
3. **Private Network**: Use the private IP address of your server

## 🔒 VPN/ZTNA Demo Scenarios

### Scenario 1: Remote Employee Access
1. Deploy server on private subnet (e.g., 192.168.1.100:3001)
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

## 📦 Distribution

### Client Distribution
- **macOS**: `.dmg` installer
- **Windows**: `.exe` executable
- **Size**: ~5-20MB (efficient Tauri compilation)
- **Requirements**: None (all dependencies bundled)

### Server Deployment
```bash
# For production deployment
cd server
npm install --production
npm run init-db
npm start
```

## 🛠️ Development

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
- **Salary ranges**: $60k - $130k
- **Hire dates**: Spread over 2020-2023

## 🔍 Testing the Demo

### Network Isolation Test
1. Start server on private network
2. Verify client cannot connect without VPN
3. Connect VPN/ZTNA
4. Configure client to use private server IP
5. Demonstrate successful connection and data operations

## 📄 License

This demo application is provided as-is for demonstration purposes of VPN/ZTNA capabilities.