export interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
  position: string;
  salary: number;
  hire_date: string;
  ssn: string;
  phone: string;
  address: string;
  employee_id: string;
  status: 'Active' | 'Inactive' | 'On Leave';
  manager: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface DashboardStats {
  totalEmployees: number;
  totalDepartments: number;
  averageSalary: number;
  recentHires: number;
}

export interface Department {
  name: string;
  employeeCount: number;
  averageSalary: number;
}
