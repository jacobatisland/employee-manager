import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '..', 'database.sqlite');

// Realistic data arrays for generating employees
const firstNames = [
  'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth',
  'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Christopher', 'Karen',
  'Charles', 'Nancy', 'Daniel', 'Lisa', 'Matthew', 'Betty', 'Anthony', 'Helen', 'Mark', 'Sandra',
  'Donald', 'Donna', 'Steven', 'Carol', 'Paul', 'Ruth', 'Andrew', 'Sharon', 'Joshua', 'Michelle',
  'Kenneth', 'Laura', 'Kevin', 'Sarah', 'Brian', 'Kimberly', 'George', 'Deborah', 'Edward', 'Dorothy',
  'Ronald', 'Amy', 'Timothy', 'Angela', 'Jason', 'Ashley', 'Jeffrey', 'Brenda', 'Ryan', 'Emma',
  'Jacob', 'Olivia', 'Gary', 'Cynthia', 'Nicholas', 'Marie', 'Eric', 'Janet', 'Jonathan', 'Catherine',
  'Stephen', 'Frances', 'Larry', 'Christine', 'Justin', 'Samantha', 'Scott', 'Debra', 'Brandon', 'Rachel',
  'Benjamin', 'Carolyn', 'Samuel', 'Janet', 'Gregory', 'Virginia', 'Alexander', 'Maria', 'Patrick', 'Heather',
  'Frank', 'Diane', 'Raymond', 'Julie', 'Jack', 'Joyce', 'Dennis', 'Victoria', 'Jerry', 'Kelly'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
  'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts',
  'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker', 'Cruz', 'Edwards', 'Collins', 'Reyes',
  'Stewart', 'Morris', 'Morales', 'Murphy', 'Cook', 'Rogers', 'Gutierrez', 'Ortiz', 'Morgan', 'Cooper',
  'Peterson', 'Bailey', 'Reed', 'Kelly', 'Howard', 'Ramos', 'Kim', 'Cox', 'Ward', 'Richardson',
  'Watson', 'Brooks', 'Chavez', 'Wood', 'James', 'Bennett', 'Gray', 'Mendoza', 'Ruiz', 'Hughes',
  'Price', 'Alvarez', 'Castillo', 'Sanders', 'Patel', 'Myers', 'Long', 'Ross', 'Foster', 'Jimenez'
];

const departments = [
  'Engineering', 'Marketing', 'Sales', 'Human Resources', 'Finance', 'Operations', 'Customer Success',
  'Product Management', 'Design', 'Legal', 'IT Support', 'Quality Assurance', 'Research & Development',
  'Business Development', 'Data Analytics', 'Security', 'Facilities', 'Training', 'Procurement',
  'Communications', 'Strategy', 'Compliance', 'Project Management', 'Technical Writing'
];

const positions = {
  'Engineering': [
    'Software Engineer', 'Senior Software Engineer', 'Staff Software Engineer', 'Principal Engineer',
    'Engineering Manager', 'Senior Engineering Manager', 'Director of Engineering', 'VP of Engineering',
    'DevOps Engineer', 'Site Reliability Engineer', 'Frontend Developer', 'Backend Developer',
    'Full Stack Developer', 'Mobile Developer', 'Data Engineer', 'Machine Learning Engineer',
    'Security Engineer', 'Platform Engineer', 'Infrastructure Engineer', 'Technical Lead'
  ],
  'Marketing': [
    'Marketing Specialist', 'Marketing Manager', 'Senior Marketing Manager', 'Marketing Director',
    'VP of Marketing', 'Content Marketing Manager', 'Digital Marketing Specialist', 'SEO Specialist',
    'Social Media Manager', 'Brand Manager', 'Product Marketing Manager', 'Growth Marketing Manager',
    'Marketing Analyst', 'Campaign Manager', 'Event Marketing Manager', 'Marketing Coordinator'
  ],
  'Sales': [
    'Sales Representative', 'Senior Sales Representative', 'Account Executive', 'Senior Account Executive',
    'Sales Manager', 'Regional Sales Manager', 'Sales Director', 'VP of Sales', 'Inside Sales Rep',
    'Outside Sales Rep', 'Business Development Rep', 'Account Manager', 'Customer Success Manager',
    'Sales Engineer', 'Sales Operations Manager', 'Channel Partner Manager'
  ],
  'Human Resources': [
    'HR Generalist', 'HR Business Partner', 'Senior HR Business Partner', 'HR Manager',
    'HR Director', 'VP of Human Resources', 'Recruiter', 'Senior Recruiter', 'Talent Acquisition Manager',
    'Compensation Analyst', 'Benefits Administrator', 'HR Coordinator', 'People Operations Manager',
    'Learning & Development Manager', 'Employee Relations Specialist', 'HRIS Administrator'
  ],
  'Finance': [
    'Financial Analyst', 'Senior Financial Analyst', 'Finance Manager', 'Senior Finance Manager',
    'Finance Director', 'CFO', 'Accounting Specialist', 'Senior Accountant', 'Controller',
    'Accounts Payable Specialist', 'Accounts Receivable Specialist', 'Payroll Specialist',
    'Budget Analyst', 'Treasury Analyst', 'Tax Specialist', 'Financial Planning Analyst'
  ],
  'Operations': [
    'Operations Specialist', 'Operations Manager', 'Senior Operations Manager', 'Operations Director',
    'VP of Operations', 'Process Improvement Specialist', 'Supply Chain Manager', 'Logistics Coordinator',
    'Warehouse Manager', 'Inventory Specialist', 'Operations Analyst', 'Business Operations Manager',
    'Vendor Manager', 'Contract Manager', 'Operations Coordinator'
  ],
  'Customer Success': [
    'Customer Success Manager', 'Senior Customer Success Manager', 'Customer Success Director',
    'VP of Customer Success', 'Customer Support Representative', 'Senior Customer Support Rep',
    'Technical Support Engineer', 'Customer Onboarding Specialist', 'Customer Experience Manager',
    'Support Team Lead', 'Customer Success Analyst', 'Implementation Specialist'
  ],
  'Product Management': [
    'Product Manager', 'Senior Product Manager', 'Principal Product Manager', 'Director of Product',
    'VP of Product', 'Associate Product Manager', 'Product Owner', 'Product Marketing Manager',
    'Technical Product Manager', 'Product Analyst', 'Product Operations Manager', 'Product Designer'
  ],
  'Design': [
    'UX Designer', 'Senior UX Designer', 'UI Designer', 'Senior UI Designer', 'Product Designer',
    'Senior Product Designer', 'Design Manager', 'Design Director', 'VP of Design', 'Visual Designer',
    'Interaction Designer', 'User Researcher', 'Design Systems Designer', 'Brand Designer'
  ],
  'Legal': [
    'Legal Counsel', 'Senior Legal Counsel', 'General Counsel', 'Paralegal', 'Contract Specialist',
    'Compliance Manager', 'Legal Operations Manager', 'Intellectual Property Specialist',
    'Employment Law Specialist', 'Corporate Counsel', 'Privacy Counsel'
  ],
  'IT Support': [
    'IT Support Specialist', 'Senior IT Support Specialist', 'IT Manager', 'IT Director',
    'Systems Administrator', 'Network Administrator', 'Database Administrator', 'IT Security Specialist',
    'Help Desk Technician', 'Desktop Support Technician', 'IT Coordinator', 'Technical Support Manager'
  ],
  'Quality Assurance': [
    'QA Engineer', 'Senior QA Engineer', 'QA Manager', 'QA Director', 'Test Automation Engineer',
    'Manual QA Tester', 'Performance Test Engineer', 'QA Analyst', 'Quality Assurance Lead',
    'Test Manager', 'QA Coordinator', 'Compliance QA Specialist'
  ],
  'Research & Development': [
    'Research Scientist', 'Senior Research Scientist', 'Principal Research Scientist', 'R&D Manager',
    'R&D Director', 'VP of Research', 'Data Scientist', 'Senior Data Scientist', 'Research Engineer',
    'Innovation Manager', 'Research Analyst', 'Laboratory Technician'
  ],
  'Business Development': [
    'Business Development Manager', 'Senior Business Development Manager', 'BD Director',
    'VP of Business Development', 'Partnership Manager', 'Strategic Partnerships Manager',
    'Alliance Manager', 'Business Development Representative', 'Market Development Manager',
    'Channel Development Manager', 'Corporate Development Manager'
  ],
  'Data Analytics': [
    'Data Analyst', 'Senior Data Analyst', 'Data Scientist', 'Senior Data Scientist', 'Analytics Manager',
    'Analytics Director', 'VP of Analytics', 'Business Intelligence Analyst', 'Reporting Analyst',
    'Data Engineer', 'Analytics Engineer', 'Quantitative Analyst', 'Statistical Analyst'
  ]
};

const statuses = ['Active', 'Active', 'Active', 'Active', 'Active', 'Active', 'Active', 'Inactive', 'On Leave'];

const streetNames = [
  'Main St', 'Oak Ave', 'Pine St', 'Maple Dr', 'Cedar Ln', 'Elm St', 'Park Ave', 'First St', 'Second St',
  'Washington St', 'Lincoln Ave', 'Jefferson Dr', 'Madison St', 'Monroe Ave', 'Adams St', 'Jackson Dr',
  'Van Buren St', 'Harrison Ave', 'Tyler St', 'Polk Dr', 'Taylor Ave', 'Fillmore St', 'Pierce Dr',
  'Buchanan Ave', 'Johnson St', 'Grant Dr', 'Hayes Ave', 'Garfield St', 'Arthur Dr', 'Cleveland Ave'
];

const cities = [
  'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego',
  'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'Charlotte', 'San Francisco',
  'Indianapolis', 'Seattle', 'Denver', 'Washington', 'Boston', 'El Paso', 'Nashville', 'Detroit',
  'Oklahoma City', 'Portland', 'Las Vegas', 'Memphis', 'Louisville', 'Baltimore', 'Milwaukee', 'Albuquerque',
  'Tucson', 'Fresno', 'Sacramento', 'Kansas City', 'Mesa', 'Atlanta', 'Omaha', 'Colorado Springs',
  'Raleigh', 'Miami', 'Virginia Beach', 'Oakland', 'Minneapolis', 'Tulsa', 'Arlington', 'Tampa',
  'New Orleans', 'Wichita', 'Cleveland', 'Bakersfield', 'Aurora', 'Anaheim', 'Honolulu', 'Santa Ana',
  'Riverside', 'Corpus Christi', 'Lexington', 'Stockton', 'Henderson', 'Saint Paul', 'St. Louis', 'Cincinnati'
];

const states = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS',
  'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY',
  'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

// Utility functions
function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateSSN() {
  const area = getRandomNumber(100, 999);
  const group = getRandomNumber(10, 99);
  const serial = getRandomNumber(1000, 9999);
  return `${area}-${group}-${serial}`;
}

function generatePhone() {
  const area = getRandomNumber(200, 999);
  const exchange = getRandomNumber(200, 999);
  const number = getRandomNumber(1000, 9999);
  return `(${area}) ${exchange}-${number}`;
}

function generateEmployeeId(index) {
  return `EMP${String(index + 1).padStart(6, '0')}`;
}

function generateAddress() {
  const number = getRandomNumber(1, 9999);
  const street = getRandomElement(streetNames);
  const city = getRandomElement(cities);
  const state = getRandomElement(states);
  const zip = getRandomNumber(10000, 99999);
  return `${number} ${street}, ${city}, ${state} ${zip}`;
}

function generateHireDate() {
  const start = new Date(2018, 0, 1);
  const end = new Date();
  const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime());
  return new Date(randomTime).toISOString().split('T')[0];
}

function getSalaryForPosition(department, position) {
  const baseSalaries = {
    'Engineering': { min: 70000, max: 200000 },
    'Marketing': { min: 50000, max: 150000 },
    'Sales': { min: 45000, max: 180000 },
    'Human Resources': { min: 55000, max: 140000 },
    'Finance': { min: 60000, max: 160000 },
    'Operations': { min: 50000, max: 130000 },
    'Customer Success': { min: 45000, max: 120000 },
    'Product Management': { min: 80000, max: 200000 },
    'Design': { min: 60000, max: 150000 },
    'Legal': { min: 80000, max: 250000 },
    'IT Support': { min: 45000, max: 120000 },
    'Quality Assurance': { min: 55000, max: 130000 },
    'Research & Development': { min: 70000, max: 180000 },
    'Business Development': { min: 60000, max: 170000 },
    'Data Analytics': { min: 65000, max: 180000 }
  };

  const deptSalary = baseSalaries[department] || { min: 50000, max: 120000 };
  
  // Adjust based on seniority level in position title
  let multiplier = 1.0;
  const positionLower = position.toLowerCase();
  
  if (positionLower.includes('senior') || positionLower.includes('sr.')) {
    multiplier = 1.3;
  } else if (positionLower.includes('principal') || positionLower.includes('staff')) {
    multiplier = 1.6;
  } else if (positionLower.includes('manager') || positionLower.includes('lead')) {
    multiplier = 1.4;
  } else if (positionLower.includes('director')) {
    multiplier = 1.8;
  } else if (positionLower.includes('vp') || positionLower.includes('vice president')) {
    multiplier = 2.2;
  } else if (positionLower.includes('cfo') || positionLower.includes('cto') || positionLower.includes('ceo')) {
    multiplier = 2.8;
  }

  const minSalary = Math.floor(deptSalary.min * multiplier);
  const maxSalary = Math.floor(deptSalary.max * multiplier);
  
  return getRandomNumber(minSalary, maxSalary);
}

function generateManager(department) {
  const managers = {
    'Engineering': ['Sarah Chen', 'Michael Rodriguez', 'David Kim', 'Jennifer Walsh'],
    'Marketing': ['Lisa Thompson', 'Robert Johnson', 'Amanda Davis', 'Kevin Brown'],
    'Sales': ['Mark Wilson', 'Jessica Garcia', 'Thomas Anderson', 'Rachel Martinez'],
    'Human Resources': ['Emily Johnson', 'Daniel Smith', 'Maria Lopez', 'James Wilson'],
    'Finance': ['Patricia Miller', 'Christopher Lee', 'Susan Taylor', 'Andrew Davis'],
    'Operations': ['Michelle White', 'Steven Harris', 'Laura Clark', 'Brian Lewis'],
    'Customer Success': ['Karen Robinson', 'Joseph Walker', 'Nancy Hall', 'Ryan Young'],
    'Product Management': ['Elizabeth Allen', 'Matthew King', 'Helen Wright', 'Joshua Scott'],
    'Design': ['Sandra Green', 'Paul Adams', 'Dorothy Baker', 'Timothy Nelson'],
    'Legal': ['Carol Hill', 'Ronald Carter', 'Ruth Mitchell', 'Gary Perez'],
    'IT Support': ['Angela Roberts', 'Edward Turner', 'Brenda Phillips', 'Scott Campbell'],
    'Quality Assurance': ['Deborah Parker', 'Kenneth Evans', 'Janet Edwards', 'Brandon Collins'],
    'Research & Development': ['Christine Stewart', 'Gregory Morris', 'Frances Sanchez', 'Samuel Rogers'],
    'Business Development': ['Marie Murphy', 'Raymond Cook', 'Joyce Rivera', 'Frank Bailey'],
    'Data Analytics': ['Victoria Reed', 'Dennis Kelly', 'Diane Cooper', 'Jerry Richardson']
  };

  const deptManagers = managers[department] || ['John Manager', 'Jane Supervisor'];
  return getRandomElement(deptManagers);
}

function generateEmployee(index) {
  const firstName = getRandomElement(firstNames);
  const lastName = getRandomElement(lastNames);
  const name = `${firstName} ${lastName}`;
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${index + 1}@company.com`;
  const department = getRandomElement(departments);
  const position = getRandomElement(positions[department] || positions['Engineering']);
  const salary = getSalaryForPosition(department, position);
  const hireDate = generateHireDate();
  const ssn = generateSSN();
  const phone = generatePhone();
  const address = generateAddress();
  const employeeId = generateEmployeeId(index);
  const status = getRandomElement(statuses);
  const manager = generateManager(department);

  return {
    name,
    email,
    department,
    position,
    salary,
    hire_date: hireDate,
    ssn,
    phone,
    address,
    employee_id: employeeId,
    status,
    manager
  };
}

async function generateLargeDataset(count = 5000) {
  const db = new sqlite3.Database(dbPath);
  
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create employees table with all new fields
      db.run(`
        CREATE TABLE IF NOT EXISTS employees (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          department TEXT NOT NULL,
          position TEXT NOT NULL,
          salary INTEGER NOT NULL,
          hire_date TEXT NOT NULL,
          ssn TEXT,
          phone TEXT,
          address TEXT,
          employee_id TEXT UNIQUE,
          status TEXT DEFAULT 'Active',
          manager TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('Error creating employees table:', err);
          reject(err);
          return;
        }
        console.log('✅ Employees table created successfully');
      });

      // Clear existing data
      db.run('DELETE FROM employees', (err) => {
        if (err) {
          console.error('Error clearing employees table:', err);
          reject(err);
          return;
        }
        console.log('🗑️  Employees table cleared');
      });

      // Prepare insert statement
      const stmt = db.prepare(`
        INSERT INTO employees (
          name, email, department, position, salary, hire_date,
          ssn, phone, address, employee_id, status, manager
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      console.log(`🚀 Generating ${count} employees...`);
      let insertedCount = 0;
      let batchSize = 100;
      let currentBatch = 0;

      // Generate and insert employees in batches
      for (let i = 0; i < count; i++) {
        const employee = generateEmployee(i);
        
        stmt.run([
          employee.name,
          employee.email,
          employee.department,
          employee.position,
          employee.salary,
          employee.hire_date,
          employee.ssn,
          employee.phone,
          employee.address,
          employee.employee_id,
          employee.status,
          employee.manager
        ], function(err) {
          if (err) {
            console.error(`Error inserting employee ${employee.name}:`, err);
            // Continue with other employees instead of rejecting
            return;
          }
          
          insertedCount++;
          
          // Progress indicator
          if (insertedCount % batchSize === 0) {
            currentBatch++;
            const progress = ((insertedCount / count) * 100).toFixed(1);
            console.log(`📊 Progress: ${insertedCount}/${count} (${progress}%) - Batch ${currentBatch}`);
          }
          
          if (insertedCount === count) {
            stmt.finalize();
            console.log(`🎉 Successfully generated ${insertedCount} employees!`);
            
            // Create indexes for better query performance
            db.run('CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department)', (err) => {
              if (err) console.error('Error creating department index:', err);
            });
            
            db.run('CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status)', (err) => {
              if (err) console.error('Error creating status index:', err);
            });
            
            db.run('CREATE INDEX IF NOT EXISTS idx_employees_hire_date ON employees(hire_date)', (err) => {
              if (err) console.error('Error creating hire_date index:', err);
            });
            
            db.run('CREATE INDEX IF NOT EXISTS idx_employees_salary ON employees(salary)', (err) => {
              if (err) console.error('Error creating salary index:', err);
            });
            
            console.log('📈 Database indexes created for optimal performance');
            resolve(insertedCount);
          }
        });
      }
    });
  });
}

// Run the generator
const employeeCount = process.argv[2] ? parseInt(process.argv[2]) : 5000;

console.log('🏢 Enterprise Employee Database Generator');
console.log('=========================================');
console.log(`Target: ${employeeCount.toLocaleString()} employees`);
console.log('');

generateLargeDataset(employeeCount)
  .then((count) => {
    console.log('');
    console.log('✅ Database generation completed successfully!');
    console.log(`📊 Total employees created: ${count.toLocaleString()}`);
    console.log('🚀 Server is ready for enterprise-scale testing');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Database generation failed:', error);
    process.exit(1);
  });
