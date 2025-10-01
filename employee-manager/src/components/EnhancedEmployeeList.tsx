import React, { useState, useMemo } from 'react';
import { Employee } from '../types';
import { Search, Edit, Trash2, RefreshCw, Filter, Grid, List, Download, CheckSquare, Square } from 'lucide-react';
import EmployeeCard from './EmployeeCard';
import LoadingSkeleton from './LoadingSkeleton';

interface EnhancedEmployeeListProps {
  employees: Employee[];
  loading: boolean;
  error: string | null;
  onEdit: (employee: Employee) => void;
  onDelete: (id: number) => void;
  onRefresh: () => void;
  onBulkDelete?: (ids: number[]) => void;
  onExport?: (employees: Employee[]) => void;
}

const EnhancedEmployeeList: React.FC<EnhancedEmployeeListProps> = ({
  employees,
  loading,
  error,
  onEdit,
  onDelete,
  onRefresh,
  onBulkDelete,
  onExport
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [salaryRange, setSalaryRange] = useState<[number, number]>([0, 200000]);
  const [sortField, setSortField] = useState<keyof Employee>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [selectedEmployees, setSelectedEmployees] = useState<Set<number>>(new Set());
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const departments = useMemo(() => {
    const depts = new Set(employees.map(emp => emp.department));
    return Array.from(depts).sort();
  }, [employees]);

  const filteredAndSortedEmployees = useMemo(() => {
    let filtered = employees.filter(employee => {
      const matchesSearch = 
        employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.position.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDepartment = !selectedDepartment || employee.department === selectedDepartment;
      const matchesSalary = employee.salary >= salaryRange[0] && employee.salary <= salaryRange[1];
      
      return matchesSearch && matchesDepartment && matchesSalary;
    });

    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = (bValue as string).toLowerCase();
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [employees, searchTerm, selectedDepartment, salaryRange, sortField, sortDirection]);

  const handleSort = (field: keyof Employee) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = () => {
    if (selectedEmployees.size === filteredAndSortedEmployees.length) {
      setSelectedEmployees(new Set());
    } else {
      setSelectedEmployees(new Set(filteredAndSortedEmployees.map(emp => emp.id)));
    }
  };

  const handleSelectEmployee = (id: number, selected: boolean) => {
    const newSelected = new Set(selectedEmployees);
    if (selected) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedEmployees(newSelected);
  };

  const handleBulkDelete = () => {
    if (selectedEmployees.size > 0 && onBulkDelete) {
      if (confirm(`Are you sure you want to delete ${selectedEmployees.size} employees?`)) {
        onBulkDelete(Array.from(selectedEmployees));
        setSelectedEmployees(new Set());
      }
    }
  };

  const handleExport = () => {
    if (onExport) {
      onExport(filteredAndSortedEmployees);
    }
  };

  const formatSalary = (salary: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(salary);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return <LoadingSkeleton variant={viewMode} count={6} />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-medium mb-2">Connection Error</h3>
        <p className="text-red-600">{error}</p>
        <button
          onClick={onRefresh}
          className="mt-4 btn-primary flex items-center gap-2"
        >
          <RefreshCw size={16} />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Filters */}
      <div className="card">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search employees by name, email, or position..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 input-field"
              />
            </div>
          </div>

          {/* Department Filter */}
          <div className="lg:w-48">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="pl-10 input-field appearance-none"
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="btn-secondary flex items-center gap-2"
            >
              <Filter size={16} />
              Filters
            </button>
            
            <button
              onClick={() => setViewMode(viewMode === 'table' ? 'card' : 'table')}
              className="btn-secondary flex items-center gap-2"
              title={`Switch to ${viewMode === 'table' ? 'card' : 'table'} view`}
            >
              {viewMode === 'table' ? <Grid size={16} /> : <List size={16} />}
            </button>

            {onExport && (
              <button
                onClick={handleExport}
                className="btn-secondary flex items-center gap-2"
                title="Export to CSV"
              >
                <Download size={16} />
                Export
              </button>
            )}

            <button
              onClick={onRefresh}
              className="btn-secondary flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Salary Range: ${salaryRange[0].toLocaleString()} - ${salaryRange[1].toLocaleString()}
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="0"
                    max="200000"
                    step="5000"
                    value={salaryRange[0]}
                    onChange={(e) => setSalaryRange([parseInt(e.target.value), salaryRange[1]])}
                    className="flex-1"
                  />
                  <input
                    type="range"
                    min="0"
                    max="200000"
                    step="5000"
                    value={salaryRange[1]}
                    onChange={(e) => setSalaryRange([salaryRange[0], parseInt(e.target.value)])}
                    className="flex-1"
                  />
                </div>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSalaryRange([0, 200000]);
                    setSelectedDepartment('');
                    setSearchTerm('');
                  }}
                  className="btn-secondary w-full"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Results Summary & Bulk Actions */}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {filteredAndSortedEmployees.length} of {employees.length} employees
            {selectedEmployees.size > 0 && (
              <span className="ml-2 text-primary-600 font-medium">
                ({selectedEmployees.size} selected)
              </span>
            )}
          </div>

          {selectedEmployees.size > 0 && onBulkDelete && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkDelete}
                className="btn-danger flex items-center gap-2 text-sm"
              >
                <Trash2 size={14} />
                Delete Selected ({selectedEmployees.size})
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Employee Display */}
      {viewMode === 'card' ? (
        // Card View
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedEmployees.map((employee) => (
            <EmployeeCard
              key={employee.id}
              employee={employee}
              onEdit={onEdit}
              onDelete={onDelete}
              isSelected={selectedEmployees.has(employee.id)}
              onSelect={onBulkDelete ? handleSelectEmployee : undefined}
            />
          ))}
        </div>
      ) : (
        // Table View - Fixed for better visibility
        <div className="card p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200" style={{ minWidth: '800px' }}>
              <thead className="bg-gray-50">
                <tr>
                  {onBulkDelete && (
                    <th className="px-6 py-3 text-left">
                      <button
                        onClick={handleSelectAll}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {selectedEmployees.size === filteredAndSortedEmployees.length && filteredAndSortedEmployees.length > 0 ? 
                          <CheckSquare size={16} /> : 
                          <Square size={16} />
                        }
                      </button>
                    </th>
                  )}
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-1">
                      Name
                      {sortField === 'name' && (
                        <span className="text-primary-600">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('department')}
                  >
                    <div className="flex items-center gap-1">
                      Department
                      {sortField === 'department' && (
                        <span className="text-primary-600">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('salary')}
                  >
                    <div className="flex items-center gap-1">
                      Salary
                      {sortField === 'salary' && (
                        <span className="text-primary-600">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('hire_date')}
                  >
                    <div className="flex items-center gap-1">
                      Hire Date
                      {sortField === 'hire_date' && (
                        <span className="text-primary-600">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50 z-10">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedEmployees.map((employee) => (
                  <tr key={employee.id} className={`hover:bg-gray-50 ${selectedEmployees.has(employee.id) ? 'bg-blue-50' : ''}`}>
                    {onBulkDelete && (
                      <td className="px-6 py-4 whitespace-nowrap sticky left-0 bg-white z-10 border-r border-gray-200">
                        <input
                          type="checkbox"
                          checked={selectedEmployees.has(employee.id)}
                          onChange={(e) => handleSelectEmployee(employee.id, e.target.checked)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary-700">
                              {employee.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{employee.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="badge-primary">
                        {employee.department}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{employee.position}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatSalary(employee.salary)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{formatDate(employee.hire_date)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium sticky right-0 bg-white z-10 border-l border-gray-200">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onEdit(employee)}
                          className="btn-xs text-primary-600 hover:text-primary-700 hover:bg-primary-50 flex items-center justify-center"
                          title="Edit employee"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => onDelete(employee.id)}
                          className="btn-xs text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center justify-center"
                          title="Delete employee"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredAndSortedEmployees.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No employees found matching your criteria.</p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedDepartment('');
                    setSalaryRange([0, 200000]);
                  }}
                  className="mt-2 text-primary-600 hover:text-primary-700 text-sm"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {filteredAndSortedEmployees.length === 0 && viewMode === 'card' && (
        <div className="text-center py-12">
          <p className="text-gray-500">No employees found matching your criteria.</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedDepartment('');
              setSalaryRange([0, 200000]);
            }}
            className="mt-2 text-primary-600 hover:text-primary-700 text-sm"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
};

export default EnhancedEmployeeList;
