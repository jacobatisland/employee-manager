import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Database setup
const dbPath = join(__dirname, '..', 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Security headers
app.use((req, res, next) => {
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  next();
});

// Request logging in development
if (NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Response helper
const sendResponse = (res, success, data = null, message = null) => {
  res.json({
    success,
    data,
    message
  });
};

// API Routes

// Get all employees
app.get('/api/employees', (req, res) => {
  const query = `
    SELECT id, name, email, department, position, salary, hire_date
    FROM employees
    ORDER BY name ASC
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Error fetching employees:', err);
      sendResponse(res, false, null, 'Failed to fetch employees');
      return;
    }
    sendResponse(res, true, rows);
  });
});

// Get employee by ID
app.get('/api/employees/:id', (req, res) => {
  const { id } = req.params;
  
  const query = `
    SELECT id, name, email, department, position, salary, hire_date
    FROM employees
    WHERE id = ?
  `;
  
  db.get(query, [id], (err, row) => {
    if (err) {
      console.error('Error fetching employee:', err);
      sendResponse(res, false, null, 'Failed to fetch employee');
      return;
    }
    
    if (!row) {
      sendResponse(res, false, null, 'Employee not found');
      return;
    }
    
    sendResponse(res, true, row);
  });
});

// Create new employee
app.post('/api/employees', (req, res) => {
  const { name, email, department, position, salary, hire_date } = req.body;
  
  // Validation
  if (!name || !email || !department || !position || !salary || !hire_date) {
    sendResponse(res, false, null, 'All fields are required');
    return;
  }
  
  const query = `
    INSERT INTO employees (name, email, department, position, salary, hire_date)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  
  db.run(query, [name, email, department, position, salary, hire_date], function(err) {
    if (err) {
      console.error('Error creating employee:', err);
      if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        sendResponse(res, false, null, 'Email address already exists');
      } else {
        sendResponse(res, false, null, 'Failed to create employee');
      }
      return;
    }
    
    // Fetch the created employee
    const selectQuery = `
      SELECT id, name, email, department, position, salary, hire_date
      FROM employees
      WHERE id = ?
    `;
    
    db.get(selectQuery, [this.lastID], (err, row) => {
      if (err) {
        console.error('Error fetching created employee:', err);
        sendResponse(res, false, null, 'Employee created but failed to fetch details');
        return;
      }
      sendResponse(res, true, row, 'Employee created successfully');
    });
  });
});

// Update employee
app.put('/api/employees/:id', (req, res) => {
  const { id } = req.params;
  const { name, email, department, position, salary, hire_date } = req.body;
  
  // Validation
  if (!name || !email || !department || !position || !salary || !hire_date) {
    sendResponse(res, false, null, 'All fields are required');
    return;
  }
  
  const query = `
    UPDATE employees
    SET name = ?, email = ?, department = ?, position = ?, salary = ?, hire_date = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
  
  db.run(query, [name, email, department, position, salary, hire_date, id], function(err) {
    if (err) {
      console.error('Error updating employee:', err);
      if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        sendResponse(res, false, null, 'Email address already exists');
      } else {
        sendResponse(res, false, null, 'Failed to update employee');
      }
      return;
    }
    
    if (this.changes === 0) {
      sendResponse(res, false, null, 'Employee not found');
      return;
    }
    
    // Fetch the updated employee
    const selectQuery = `
      SELECT id, name, email, department, position, salary, hire_date
      FROM employees
      WHERE id = ?
    `;
    
    db.get(selectQuery, [id], (err, row) => {
      if (err) {
        console.error('Error fetching updated employee:', err);
        sendResponse(res, false, null, 'Employee updated but failed to fetch details');
        return;
      }
      sendResponse(res, true, row, 'Employee updated successfully');
    });
  });
});

// Delete employee
app.delete('/api/employees/:id', (req, res) => {
  const { id } = req.params;
  
  const query = 'DELETE FROM employees WHERE id = ?';
  
  db.run(query, [id], function(err) {
    if (err) {
      console.error('Error deleting employee:', err);
      sendResponse(res, false, null, 'Failed to delete employee');
      return;
    }
    
    if (this.changes === 0) {
      sendResponse(res, false, null, 'Employee not found');
      return;
    }
    
    sendResponse(res, true, null, 'Employee deleted successfully');
  });
});

// Get dashboard statistics
app.get('/api/dashboard/stats', (req, res) => {
  const queries = {
    totalEmployees: 'SELECT COUNT(*) as count FROM employees',
    totalDepartments: 'SELECT COUNT(DISTINCT department) as count FROM employees',
    averageSalary: 'SELECT ROUND(AVG(salary), 2) as avg FROM employees',
    recentHires: `SELECT COUNT(*) as count FROM employees WHERE hire_date >= date('now', '-30 days')`
  };
  
  const stats = {};
  let completed = 0;
  const total = Object.keys(queries).length;
  
  Object.entries(queries).forEach(([key, query]) => {
    db.get(query, [], (err, row) => {
      if (err) {
        console.error(`Error fetching ${key}:`, err);
        stats[key] = 0;
      } else {
        stats[key] = row.count || row.avg || 0;
      }
      
      completed++;
      if (completed === total) {
        sendResponse(res, true, {
          totalEmployees: stats.totalEmployees,
          totalDepartments: stats.totalDepartments,
          averageSalary: stats.averageSalary,
          recentHires: stats.recentHires
        });
      }
    });
  });
});

// Get department statistics
app.get('/api/dashboard/departments', (req, res) => {
  const query = `
    SELECT 
      department,
      COUNT(*) as employeeCount,
      ROUND(AVG(salary), 2) as averageSalary
    FROM employees
    GROUP BY department
    ORDER BY employeeCount DESC
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Error fetching department stats:', err);
      sendResponse(res, false, null, 'Failed to fetch department statistics');
      return;
    }
    sendResponse(res, true, rows);
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  sendResponse(res, true, { status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  sendResponse(res, false, null, 'Internal server error');
});

// 404 handler
app.use((req, res) => {
  sendResponse(res, false, null, 'Endpoint not found');
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Employee Management Server started`);
  console.log(`   Environment: ${NODE_ENV}`);
  console.log(`   URL: http://0.0.0.0:${PORT}`);
  console.log(`   Health: http://0.0.0.0:${PORT}/api/health`);
  console.log('📡 API endpoints:');
  console.log('  GET /api/employees - List all employees');
  console.log('  POST /api/employees - Create employee');
  console.log('  PUT /api/employees/:id - Update employee');
  console.log('  DELETE /api/employees/:id - Delete employee');
  console.log('  GET /api/dashboard/stats - Dashboard statistics');
  console.log('  GET /api/dashboard/departments - Department statistics');
});

// Handle server errors
server.on('error', (error) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  switch (error.code) {
    case 'EACCES':
      console.error(`Port ${PORT} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`Port ${PORT} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('Database connection closed.');
    }
    process.exit(0);
  });
});
