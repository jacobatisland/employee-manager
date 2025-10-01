import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '..', 'database.sqlite');

const db = new sqlite3.Database(dbPath);

// Sample employee data
const sampleEmployees = [
  {
    name: 'John Smith',
    email: 'john.smith@company.com',
    department: 'Engineering',
    position: 'Senior Software Engineer',
    salary: 120000,
    hire_date: '2022-01-15'
  },
  {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    department: 'Marketing',
    position: 'Marketing Manager',
    salary: 85000,
    hire_date: '2021-06-10'
  },
  {
    name: 'Michael Chen',
    email: 'michael.chen@company.com',
    department: 'Engineering',
    position: 'DevOps Engineer',
    salary: 110000,
    hire_date: '2023-03-20'
  },
  {
    name: 'Emily Davis',
    email: 'emily.davis@company.com',
    department: 'HR',
    position: 'HR Business Partner',
    salary: 75000,
    hire_date: '2021-11-08'
  },
  {
    name: 'David Wilson',
    email: 'david.wilson@company.com',
    department: 'Finance',
    position: 'Financial Analyst',
    salary: 70000,
    hire_date: '2022-09-05'
  },
  {
    name: 'Lisa Anderson',
    email: 'lisa.anderson@company.com',
    department: 'Engineering',
    position: 'Frontend Developer',
    salary: 95000,
    hire_date: '2023-01-12'
  },
  {
    name: 'Robert Taylor',
    email: 'robert.taylor@company.com',
    department: 'Sales',
    position: 'Sales Director',
    salary: 130000,
    hire_date: '2020-04-18'
  },
  {
    name: 'Jennifer Brown',
    email: 'jennifer.brown@company.com',
    department: 'Marketing',
    position: 'Content Specialist',
    salary: 60000,
    hire_date: '2023-07-22'
  },
  {
    name: 'James Miller',
    email: 'james.miller@company.com',
    department: 'Engineering',
    position: 'Backend Developer',
    salary: 105000,
    hire_date: '2022-11-30'
  },
  {
    name: 'Amanda Garcia',
    email: 'amanda.garcia@company.com',
    department: 'Design',
    position: 'UX Designer',
    salary: 80000,
    hire_date: '2023-02-14'
  }
];

function initializeDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create employees table
      db.run(`
        CREATE TABLE IF NOT EXISTS employees (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          department TEXT NOT NULL,
          position TEXT NOT NULL,
          salary INTEGER NOT NULL,
          hire_date TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('Error creating employees table:', err);
          reject(err);
          return;
        }
        console.log('Employees table created successfully');
      });

      // Clear existing data
      db.run('DELETE FROM employees', (err) => {
        if (err) {
          console.error('Error clearing employees table:', err);
          reject(err);
          return;
        }
        console.log('Employees table cleared');
      });

      // Insert sample data
      const stmt = db.prepare(`
        INSERT INTO employees (name, email, department, position, salary, hire_date)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      let insertedCount = 0;
      sampleEmployees.forEach((employee, index) => {
        stmt.run([
          employee.name,
          employee.email,
          employee.department,
          employee.position,
          employee.salary,
          employee.hire_date
        ], function(err) {
          if (err) {
            console.error(`Error inserting employee ${employee.name}:`, err);
            reject(err);
            return;
          }
          insertedCount++;
          console.log(`Inserted employee: ${employee.name} (ID: ${this.lastID})`);
          
          if (insertedCount === sampleEmployees.length) {
            stmt.finalize();
            console.log(`Successfully inserted ${insertedCount} employees`);
            resolve();
          }
        });
      });
    });
  });
}

// Run initialization
initializeDatabase()
  .then(() => {
    console.log('Database initialization completed successfully');
    db.close();
  })
  .catch((error) => {
    console.error('Database initialization failed:', error);
    db.close();
    process.exit(1);
  });
