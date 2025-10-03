import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Employee } from '../types';
import { employeeAPI } from '../services/api';
import { useColumnPreferences, ColumnConfig } from '../hooks/useColumnPreferences';
import { 
  Search, RefreshCw, Download, 
  Settings, ChevronDown, ChevronUp, ArrowUpDown,
  Phone, Mail, Building, User, Calendar, DollarSign, Hash, Shield
} from 'lucide-react';

// Default column configuration with enterprise ERP styling
const DEFAULT_COLUMNS: ColumnConfig[] = [
  {
    key: 'employee_id',
    label: 'ID',
    visible: true,
    sortable: true,
    width: 80,
    minWidth: 60,
    maxWidth: 120,
    resizable: true,
    icon: Hash,
    formatter: (value) => value ? (
      <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{value}</span>
    ) : (
      <span className="text-gray-400 text-xs">—</span>
    )
  },
  {
    key: 'name',
    label: 'Employee Name',
    visible: true,
    sortable: true,
    width: 200,
    minWidth: 150,
    maxWidth: 300,
    resizable: true,
    icon: User,
    formatter: (value: any, employee?: Employee) => (
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-xs font-semibold text-blue-700">
            {value.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
          </span>
        </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{value}</div>
            {employee?.employee_id && (
              <div className="text-xs text-gray-500">ID: {employee.employee_id}</div>
            )}
          </div>
      </div>
    )
  },
  {
    key: 'email',
    label: 'Email Address',
    visible: true,
    sortable: true,
    width: 220,
    minWidth: 180,
    maxWidth: 300,
    resizable: true,
    icon: Mail,
    formatter: (value) => (
      <a href={`mailto:${value}`} className="text-blue-600 hover:text-blue-800 text-sm">
        {value}
      </a>
    )
  },
  {
    key: 'phone',
    label: 'Phone',
    visible: true,
    sortable: true,
    width: 140,
    minWidth: 120,
    maxWidth: 180,
    resizable: true,
    icon: Phone,
    formatter: (value) => value ? (
      <span className="text-sm text-gray-900">{value}</span>
    ) : (
      <span className="text-gray-400 text-xs">—</span>
    )
  },
  {
    key: 'department',
    label: 'Department',
    visible: true,
    sortable: true,
    width: 140,
    minWidth: 120,
    maxWidth: 200,
    resizable: true,
    icon: Building,
    formatter: (value) => (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
        {value}
      </span>
    )
  },
  {
    key: 'position',
    label: 'Position',
    visible: true,
    sortable: true,
    width: 180,
    minWidth: 150,
    maxWidth: 250,
    resizable: true,
    formatter: (value) => (
      <span className="text-sm text-gray-900 font-medium">{value}</span>
    )
  },
  {
    key: 'status',
    label: 'Status',
    visible: true,
    sortable: true,
    width: 100,
    minWidth: 80,
    maxWidth: 120,
    resizable: true,
    icon: Shield,
    formatter: (value) => {
      const status = value || 'Active';
      const colors = {
        'Active': 'bg-green-100 text-green-800 border-green-200',
        'Inactive': 'bg-gray-100 text-gray-800 border-gray-200',
        'On Leave': 'bg-yellow-100 text-yellow-800 border-yellow-200'
      };
      return (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${colors[status as keyof typeof colors] || colors.Active}`}>
          {status}
        </span>
      );
    }
  },
  {
    key: 'ssn',
    label: 'SSN',
    visible: true,
    sortable: true,
    width: 120,
    minWidth: 100,
    maxWidth: 150,
    resizable: true,
    icon: Shield,
    formatter: (value) => value ? (
      <span className="text-sm font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">
        {value}
      </span>
    ) : (
      <span className="text-gray-400 text-xs">—</span>
    )
  },
  {
    key: 'manager',
    label: 'Manager',
    visible: false,
    sortable: true,
    width: 160,
    minWidth: 140,
    maxWidth: 220,
    resizable: true,
    formatter: (value) => value ? (
      <span className="text-sm text-gray-700">{value}</span>
    ) : (
      <span className="text-gray-400 text-xs">—</span>
    )
  },
  {
    key: 'salary',
    label: 'Annual Salary',
    visible: true,
    sortable: true,
    width: 120,
    minWidth: 100,
    maxWidth: 150,
    resizable: true,
    icon: DollarSign,
    formatter: (value) => (
      <span className="text-sm font-semibold text-gray-900">
        {new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(value)}
      </span>
    )
  },
  {
    key: 'hire_date',
    label: 'Hire Date',
    visible: true,
    sortable: true,
    width: 110,
    minWidth: 100,
    maxWidth: 140,
    resizable: true,
    icon: Calendar,
    formatter: (value) => (
      <span className="text-sm text-gray-700">
        {new Date(value).toLocaleDateString('en-US', {
          year: '2-digit',
          month: 'short',
          day: 'numeric'
        })}
      </span>
    )
  },
  {
    key: 'address',
    label: 'Address',
    visible: false,
    sortable: true,
    width: 200,
    minWidth: 150,
    maxWidth: 300,
    resizable: true,
    formatter: (value) => value ? (
      <span className="text-sm text-gray-700 truncate" title={value}>
        {value.length > 30 ? `${value.substring(0, 30)}...` : value}
      </span>
    ) : (
      <span className="text-gray-400 text-xs">—</span>
    )
  }
];

interface EnterpriseEmployeeTableProps {
  onExport?: (employees: Employee[]) => void;
  serverUrl: string;
}


const EnterpriseEmployeeTable: React.FC<EnterpriseEmployeeTableProps> = ({
  onExport,
  serverUrl
}) => {
  // Internal state for pagination and data
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortField, setSortField] = useState<keyof Employee>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  // Fetch all employees once
  const fetchAllEmployees = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Set the server URL before making API calls
      employeeAPI.setServerUrl(serverUrl);
      const response = await employeeAPI.fetchAllEmployees();
      setAllEmployees(response);
      setFilteredEmployees([]); // Clear filtered data on successful fetch
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch employees';
      setError(errorMessage);
      // Clear all data when there's an error
      setAllEmployees([]);
      setFilteredEmployees([]);
      console.error('Failed to fetch employees:', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [serverUrl]);

  // Client-side filtering and pagination
  const applyFiltersAndPagination = useCallback(() => {
    let filtered = [...allEmployees];

    // Apply search filter (name and email only)
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(employee => 
        employee.name.toLowerCase().includes(searchLower) ||
        employee.email.toLowerCase().includes(searchLower)
      );
    }

    // Apply department filter
    if (selectedDepartment) {
      filtered = filtered.filter(employee => employee.department === selectedDepartment);
    }

    // Apply status filter
    if (selectedStatus) {
      filtered = filtered.filter(employee => employee.status === selectedStatus);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    // Update total records
    setTotalRecords(filtered.length);
    setTotalPages(Math.ceil(filtered.length / pageSize));

    // Apply pagination
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedEmployees = filtered.slice(startIndex, endIndex);

    setFilteredEmployees(paginatedEmployees);
  }, [allEmployees, searchTerm, selectedDepartment, selectedStatus, sortField, sortDirection, currentPage, pageSize]);

  // Fetch all employees on component mount and when server URL changes
  useEffect(() => {
    fetchAllEmployees();
  }, [fetchAllEmployees]);

  // Auto-retry when there's an error (every 30 seconds)
  useEffect(() => {
    if (error) {
      const retryInterval = setInterval(() => {
        console.log('Auto-retrying connection...');
        fetchAllEmployees();
      }, 30000); // Retry every 30 seconds

      return () => clearInterval(retryInterval);
    }
  }, [error, fetchAllEmployees]);

  // Apply filters and pagination when data or filters change
  useEffect(() => {
    applyFiltersAndPagination();
  }, [applyFiltersAndPagination]);

  // Use persistent column preferences
  const { columns, toggleColumnVisibility } = useColumnPreferences(DEFAULT_COLUMNS);

  // Removed unused useEffect for table width calculation

  // Static filter options (will be populated from server data)
  const departments = ['Engineering', 'Marketing', 'Sales', 'Human Resources', 'Finance', 'Operations', 'Customer Success', 'Product Management', 'Design', 'Legal', 'IT Support', 'Quality Assurance', 'Research & Development', 'Business Development', 'Data Analytics'];
  const statuses = ['Active', 'Inactive', 'On Leave'];

  const handleSort = useCallback((field: keyof Employee) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }, [sortField, sortDirection]);



  const visibleColumns = useMemo(() => columns.filter(col => col.visible), [columns]);

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="animate-pulse">
          <div className="h-16 bg-gray-100 rounded-t-lg"></div>
          <div className="p-6 space-y-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center mb-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 text-sm font-semibold">!</span>
            </div>
          </div>
          <div className="ml-3">
            <h3 className="text-red-800 font-medium">Server Connection Error</h3>
            <p className="text-red-600 text-sm mt-1">
              Unable to connect to server at <code className="bg-red-100 px-1 rounded">{serverUrl}</code>
            </p>
          </div>
        </div>
        <div className="bg-red-100 border border-red-200 rounded-md p-3 mb-4">
          <p className="text-red-700 text-sm font-medium">Error Details:</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={fetchAllEmployees}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <RefreshCw size={16} className="mr-2" />
            Retry Now
          </button>
          <p className="text-red-600 text-sm flex items-center">
            Auto-retrying every 30 seconds...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Enterprise Toolbar */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search employees by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2">
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">All Statuses</option>
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowColumnSettings(!showColumnSettings)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Settings size={16} className="mr-2" />
              Columns
            </button>

            {onExport && (
              <button
                onClick={() => {
                  // Export all filtered data (client-side)
                  onExport(filteredEmployees);
                }}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Download size={16} className="mr-2" />
                Export
              </button>
            )}

            <button
              onClick={fetchAllEmployees}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <RefreshCw size={16} className="mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Column Settings Panel */}
        {showColumnSettings && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Visible Columns</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {columns.filter(col => col.key !== 'actions').map(column => (
                <label key={column.key} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={column.visible}
                    onChange={() => toggleColumnVisibility(column.key)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-gray-700">{column.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Results Summary & Pagination */}
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <div>
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalRecords)} of {totalRecords.toLocaleString()} employees
            </div>
            
            {/* Page Size Selector */}
            <div className="flex items-center space-x-2">
              <span>Show:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
              </select>
              <span>per page</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-2 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  First
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-2 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                
                <span className="px-3 py-1 text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-2 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-2 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Last
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enterprise Data Table */}
      <div id="employee-table-container" className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {visibleColumns.map((column) => (
                  <th
                    key={column.key}
                    className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                      column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                    }`}
                    style={{ 
                      width: column.width,
                      minWidth: column.minWidth,
                      maxWidth: column.maxWidth 
                    }}
                    onClick={column.sortable ? () => handleSort(column.key as keyof Employee) : undefined}
                  >
                    <div className="flex items-center space-x-1">
                      {column.icon && <column.icon size={14} className="text-gray-400" />}
                      <span>{column.label}</span>
                      {column.sortable && sortField === column.key && (
                        <span className="text-blue-600">
                          {sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </span>
                      )}
                      {column.sortable && sortField !== column.key && (
                        <ArrowUpDown size={12} className="text-gray-300" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEmployees.map((employee, index) => (
                <tr 
                  key={employee.id} 
                  className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                >
                  {visibleColumns.map((column) => (
                    <td
                      key={column.key}
                      className="px-4 py-3 whitespace-nowrap"
                      style={{ 
                        width: column.width,
                        minWidth: column.minWidth,
                        maxWidth: column.maxWidth 
                      }}
                    >
                      {column.formatter 
                        ? column.formatter(employee[column.key as keyof Employee], employee)
                        : employee[column.key as keyof Employee]
                      }
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {filteredEmployees.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <User size={48} className="mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || selectedDepartment || selectedStatus
                  ? 'No employees match your current filters.'
                  : 'No employees have been added yet.'
                }
              </p>
              {(searchTerm || selectedDepartment || selectedStatus) && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedDepartment('');
                    setSelectedStatus('');
                    setCurrentPage(1);
                  }}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnterpriseEmployeeTable;
