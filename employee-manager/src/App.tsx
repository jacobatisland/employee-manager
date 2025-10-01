import { useState, useEffect } from 'react';
import { Employee } from './types';
import { employeeAPI } from './services/api';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import EnhancedEmployeeList from './components/EnhancedEmployeeList';
import EmployeeForm from './components/EmployeeForm';
import UnifiedSettings from './components/UnifiedSettings';
import { ToastContainer, useToast } from './components/Toast';
import { useSettings } from './hooks/useSettings';
import { ThemeProvider } from './contexts/ThemeContext';
import { Users, BarChart3, Settings, Plus } from 'lucide-react';

type View = 'dashboard' | 'employees' | 'settings';

function App() {
  const { settings, updateSettings, resetSettings, isLoaded } = useSettings();
  const [currentView, setCurrentView] = useState<View>('employees'); // Default to employees
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [serverUrl, setServerUrl] = useState('http://localhost:3001');
  const { toasts, removeToast, showSuccess, showError } = useToast();

  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      employeeAPI.setServerUrl(serverUrl);
      const data = await employeeAPI.fetchEmployees();
      setEmployees(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  // Set default view from settings when loaded
  useEffect(() => {
    if (isLoaded && settings.defaultView) {
      setCurrentView(settings.defaultView);
    }
  }, [isLoaded, settings.defaultView]);

  useEffect(() => {
    if (currentView === 'employees' || currentView === 'dashboard') {
      fetchEmployees();
    }
  }, [currentView, serverUrl]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!settings.autoRefresh || !settings.refreshInterval) return;

    const interval = setInterval(() => {
      if (currentView === 'employees' || currentView === 'dashboard') {
        fetchEmployees();
      }
    }, settings.refreshInterval * 60 * 1000);

    return () => clearInterval(interval);
  }, [settings.autoRefresh, settings.refreshInterval, currentView]);

  const handleCreateEmployee = async (employeeData: Omit<Employee, 'id'>) => {
    try {
      const newEmployee = await employeeAPI.createEmployee(employeeData);
      setEmployees(prev => [...prev, newEmployee]);
      setShowEmployeeForm(false);
      showSuccess('Employee Created', `${employeeData.name} has been added to the team.`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create employee';
      setError(errorMessage);
      showError('Creation Failed', errorMessage);
    }
  };

  const handleUpdateEmployee = async (id: number, employeeData: Employee) => {
    try {
      const updatedEmployee = await employeeAPI.updateEmployee(id, employeeData);
      setEmployees(prev => prev.map(emp => emp.id === id ? updatedEmployee : emp));
      setEditingEmployee(null);
      setShowEmployeeForm(false);
      showSuccess('Employee Updated', `${employeeData.name}'s information has been updated.`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update employee';
      setError(errorMessage);
      showError('Update Failed', errorMessage);
    }
  };

  const handleDeleteEmployee = async (id: number) => {
    const employee = employees.find(emp => emp.id === id);
    if (!employee) return;

    if (!confirm(`Are you sure you want to delete ${employee.name}? This action cannot be undone.`)) return;
    
    try {
      await employeeAPI.deleteEmployee(id);
      setEmployees(prev => prev.filter(emp => emp.id !== id));
      showSuccess('Employee Deleted', `${employee.name} has been removed from the team.`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete employee';
      setError(errorMessage);
      showError('Deletion Failed', errorMessage);
    }
  };

  const handleBulkDelete = async (ids: number[]) => {
    if (!confirm(`Are you sure you want to delete ${ids.length} employees? This action cannot be undone.`)) return;
    
    try {
      const deletePromises = ids.map(id => employeeAPI.deleteEmployee(id));
      await Promise.all(deletePromises);
      setEmployees(prev => prev.filter(emp => !ids.includes(emp.id)));
      showSuccess('Employees Deleted', `${ids.length} employees have been removed from the team.`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete employees';
      setError(errorMessage);
      showError('Bulk Deletion Failed', errorMessage);
    }
  };

  const handleExportEmployees = (employeesToExport: Employee[]) => {
    const csvContent = [
      ['Name', 'Email', 'Department', 'Position', 'Salary', 'Hire Date'].join(','),
      ...employeesToExport.map(emp => [
        emp.name,
        emp.email,
        emp.department,
        emp.position,
        emp.salary,
        emp.hire_date
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `employees_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showSuccess('Export Complete', `Exported ${employeesToExport.length} employees to CSV.`);
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setShowEmployeeForm(true);
  };

  const handleCloseForm = () => {
    setShowEmployeeForm(false);
    setEditingEmployee(null);
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard 
            employees={employees} 
            loading={loading} 
            error={error}
            onRefresh={fetchEmployees}
          />
        );
      case 'employees':
        return (
          <EnhancedEmployeeList
            employees={employees}
            loading={loading}
            error={error}
            onEdit={handleEditEmployee}
            onDelete={handleDeleteEmployee}
            onBulkDelete={handleBulkDelete}
            onExport={handleExportEmployees}
            onRefresh={fetchEmployees}
          />
        );
      case 'settings':
        return (
          <UnifiedSettings
            settings={settings}
            onUpdateSettings={updateSettings}
            onResetSettings={resetSettings}
            serverUrl={serverUrl}
            onServerUrlChange={setServerUrl}
            onTestConnection={fetchEmployees}
          />
        );
      default:
        return (
          <Dashboard 
            employees={employees} 
            loading={loading} 
            error={error}
            onRefresh={fetchEmployees}
          />
        );
    }
  };

  return (
    <ThemeProvider defaultTheme={settings.theme}>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar
          menuItems={menuItems}
          currentView={currentView}
          onViewChange={(view) => setCurrentView(view as View)}
        />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
                  <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {currentView === 'dashboard' && 'Dashboard'}
                    {currentView === 'employees' && 'Employee Management'}
                    {currentView === 'settings' && 'Settings'}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {currentView === 'dashboard' && 'Overview of your organization'}
                    {currentView === 'employees' && 'Manage your team members'}
                    {currentView === 'settings' && 'Configure application and server settings'}
                  </p>
            </div>
            
            {currentView === 'employees' && (
              <button
                onClick={() => setShowEmployeeForm(true)}
                className="btn-primary flex items-center gap-2"
              >
                <Plus size={20} />
                Add Employee
              </button>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          {renderContent()}
        </main>
      </div>

      {/* Employee Form Modal */}
      {showEmployeeForm && (
        <EmployeeForm
          employee={editingEmployee}
          onSubmit={editingEmployee ? 
            (data) => handleUpdateEmployee(editingEmployee.id, data) : 
            handleCreateEmployee
          }
          onCancel={handleCloseForm}
        />
      )}

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-4 text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
        </div>
      )}

        {/* Toast Notifications */}
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    </ThemeProvider>
  );
}

export default App;
