import { useState, useEffect } from 'react';
import { Employee } from './types';
import { employeeAPI } from './services/api';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import EnterpriseEmployeeTable from './components/EnterpriseEmployeeTable';
import UnifiedSettings from './components/UnifiedSettings';
import { ToastContainer, useToast } from './components/Toast';
import { useSettings } from './hooks/useSettings';
import { ThemeProvider } from './contexts/ThemeContext';
import { Users, BarChart3, Settings, RefreshCw } from 'lucide-react';

type View = 'dashboard' | 'employees' | 'settings';

function App() {
  const { settings, updateSettings, isLoaded } = useSettings();
  const [currentView, setCurrentView] = useState<View>('employees'); // Default to employees
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDismissed, setErrorDismissed] = useState(false);
  // Server URL is now managed through settings
  const serverUrl = settings.serverUrl;
  const { toasts, removeToast, showSuccess } = useToast();

  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    setErrorDismissed(false);
    try {
      employeeAPI.setServerUrl(serverUrl);
      // For dashboard and legacy compatibility, fetch all employees
      const data = await employeeAPI.fetchAllEmployees();
      setEmployees(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    try {
      employeeAPI.setServerUrl(serverUrl);
      await employeeAPI.fetchEmployees({ limit: 1 }); // Just test with 1 record
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Connection failed');
    }
  };

  const handleManualRefresh = () => {
    setErrorDismissed(false);
    fetchEmployees();
  };

  const handleServerUrlChange = (url: string) => {
    updateSettings({ serverUrl: url });
  };


  // Set default view from settings when loaded
  useEffect(() => {
    if (isLoaded && settings.defaultView) {
      setCurrentView(settings.defaultView);
    }
  }, [isLoaded, settings.defaultView]);

  useEffect(() => {
    if (isLoaded && (currentView === 'employees' || currentView === 'dashboard')) {
      // Only fetch if we don't have employees data or if there's no current error, or if error was not dismissed
      if (employees.length === 0 || !error || !errorDismissed) {
        fetchEmployees();
      }
    }
  }, [isLoaded, currentView, serverUrl]);

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




  const handleExportEmployees = (employeesToExport: Employee[]) => {
    const csvContent = [
      ['Name', 'Employee ID', 'Email', 'Phone', 'Department', 'Position', 'Manager', 'Status', 'Salary', 'Hire Date', 'Address'].join(','),
      ...employeesToExport.map(emp => [
        `"${emp.name}"`,
        `"${emp.employee_id || ''}"`,
        `"${emp.email}"`,
        `"${emp.phone || ''}"`,
        `"${emp.department}"`,
        `"${emp.position}"`,
        `"${emp.manager || ''}"`,
        `"${emp.status || 'Active'}"`,
        emp.salary,
        emp.hire_date,
        `"${emp.address || ''}"`
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
          />
        );
      case 'employees':
        return (
          <EnterpriseEmployeeTable
            onExport={handleExportEmployees}
            serverUrl={serverUrl}
          />
        );
      case 'settings':
        return (
          <UnifiedSettings
            settings={settings}
            onUpdateSettings={updateSettings}
            serverUrl={serverUrl}
            onServerUrlChange={handleServerUrlChange}
            onTestConnection={testConnection}
          />
        );
      default:
        return (
          <Dashboard 
            employees={employees} 
            loading={loading} 
            error={error}
          />
        );
    }
  };

  return (
    <ThemeProvider defaultTheme={settings.theme}>
      <div className="flex h-screen bg-gray-50">
        <Sidebar
          menuItems={menuItems}
          currentView={currentView}
          onViewChange={(view) => setCurrentView(view as View)}
        />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 shadow-sm">
            <div className="px-6 py-6" style={{ minHeight: '96px' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                    {currentView === 'dashboard' && <BarChart3 className="h-5 w-5 text-blue-600" />}
                    {currentView === 'employees' && <Users className="h-5 w-5 text-blue-600" />}
                    {currentView === 'settings' && <Settings className="h-5 w-5 text-blue-600" />}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {currentView === 'dashboard' && 'Dashboard'}
                      {currentView === 'employees' && 'Employee Management'}
                      {currentView === 'settings' && 'Settings'}
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">
                      {currentView === 'dashboard' && 'Monitor your organization\'s key metrics and performance'}
                      {currentView === 'employees' && 'Manage employee records, departments, and organizational structure'}
                      {currentView === 'settings' && 'Configure system preferences and server connections'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {currentView === 'dashboard' && (
                    <button
                      onClick={handleManualRefresh}
                      disabled={loading}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                    >
                      <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                      Refresh Data
                    </button>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto bg-gray-50">
            <div className="p-6">
              {renderContent()}
            </div>
          </main>
        </div>



        {/* Toast Notifications */}
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    </ThemeProvider>
  );
}

export default App;
