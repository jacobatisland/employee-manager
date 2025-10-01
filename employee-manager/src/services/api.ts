import { invoke } from '@tauri-apps/api/core';
import { Employee } from '../types';

const SERVER_URL = 'http://localhost:3001'; // Default server URL

export class EmployeeAPI {
  private serverUrl: string;

  constructor(serverUrl: string = SERVER_URL) {
    this.serverUrl = serverUrl;
  }

  async fetchEmployees(): Promise<Employee[]> {
    try {
      const employees = await invoke<Employee[]>('fetch_employees', {
        serverUrl: this.serverUrl,
      });
      return employees;
    } catch (error) {
      console.error('Failed to fetch employees:', error);
      throw new Error(`Failed to fetch employees: ${error}`);
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
