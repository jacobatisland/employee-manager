import { invoke } from '@tauri-apps/api/core';
import { Employee } from '../types';

const SERVER_URL = 'https://employee-db.se-island.life:4001'; // Default server URL

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  minSalary?: number;
  maxSalary?: number;
}

export interface PaginatedResponse<T> {
  employees: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    pageSize: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  filters: {
    search: string;
    department: string;
    status: string;
    sortBy: string;
    sortOrder: string;
    minSalary: string;
    maxSalary: string;
  };
}

export class EmployeeAPI {
  private serverUrl: string;

  constructor(serverUrl: string = SERVER_URL) {
    this.serverUrl = serverUrl;
  }

  async fetchEmployees(params: PaginationParams = {}): Promise<PaginatedResponse<Employee>> {
    try {
      const response = await invoke<PaginatedResponse<Employee>>('fetch_employees_paginated', {
        serverUrl: this.serverUrl,
        params,
      });
      return response;
    } catch (error) {
      console.error('Failed to fetch employees:', error);
      throw new Error(`Failed to fetch employees: ${error}`);
    }
  }

  // Legacy method for backward compatibility
  async fetchAllEmployees(): Promise<Employee[]> {
    try {
      const response = await this.fetchEmployees({ limit: 10000 }); // Large limit to get all
      return response.employees;
    } catch (error) {
      console.error('Failed to fetch all employees:', error);
      throw new Error(`Failed to fetch all employees: ${error}`);
    }
  }

  async createEmployee(employee: Omit<Employee, 'id'>): Promise<Employee> {
    try {
      const newEmployee = await invoke<Employee>('create_employee', {
        serverUrl: this.serverUrl,
        employee: { ...employee, id: 0 }, // ID will be assigned by server
      });
      return newEmployee;
    } catch (error) {
      console.error('Failed to create employee:', error);
      throw new Error(`Failed to create employee: ${error}`);
    }
  }

  async updateEmployee(id: number, employee: Employee): Promise<Employee> {
    try {
      const updatedEmployee = await invoke<Employee>('update_employee', {
        serverUrl: this.serverUrl,
        id,
        employee,
      });
      return updatedEmployee;
    } catch (error) {
      console.error('Failed to update employee:', error);
      throw new Error(`Failed to update employee: ${error}`);
    }
  }

  async deleteEmployee(id: number): Promise<boolean> {
    try {
      const result = await invoke<boolean>('delete_employee', {
        serverUrl: this.serverUrl,
        id,
      });
      return result;
    } catch (error) {
      console.error('Failed to delete employee:', error);
      throw new Error(`Failed to delete employee: ${error}`);
    }
  }

  setServerUrl(url: string) {
    this.serverUrl = url;
  }
}

export const employeeAPI = new EmployeeAPI();
