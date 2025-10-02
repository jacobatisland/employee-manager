import React from 'react';
import { Employee } from '../types';
import { Edit, Trash2, Mail, Calendar, DollarSign, Phone, User, Building, Badge } from 'lucide-react';

interface EmployeeCardProps {
  employee: Employee;
  onEdit: (employee: Employee) => void;
  onDelete: (id: number) => void;
  isSelected?: boolean;
  onSelect?: (id: number, selected: boolean) => void;
}

const EmployeeCard: React.FC<EmployeeCardProps> = ({
  employee,
  onEdit,
  onDelete,
  isSelected = false,
  onSelect
}) => {
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

  const getDepartmentColor = (department: string) => {
    const colors: Record<string, string> = {
      'Engineering': 'bg-blue-100 text-blue-800',
      'Marketing': 'bg-purple-100 text-purple-800',
      'Sales': 'bg-green-100 text-green-800',
      'HR': 'bg-pink-100 text-pink-800',
      'Finance': 'bg-yellow-100 text-yellow-800',
      'Design': 'bg-indigo-100 text-indigo-800',
      'Operations': 'bg-gray-100 text-gray-800',
      'Legal': 'bg-red-100 text-red-800'
    };
    return colors[department] || 'bg-gray-100 text-gray-800';
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (id: number) => {
    const colors = [
      'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
    ];
    return colors[id % colors.length];
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Active': 'bg-green-100 text-green-800 border-green-200',
      'Inactive': 'bg-gray-100 text-gray-800 border-gray-200',
      'On Leave': 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 relative p-6 ${
      isSelected ? 'ring-2 ring-blue-500 shadow-md' : ''
    }`}>
      {/* Selection Checkbox */}
      {onSelect && (
        <div className="absolute top-4 left-4">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect(employee.id, e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          {/* Avatar */}
          <div className={`w-14 h-14 rounded-lg ${getAvatarColor(employee.id)} flex items-center justify-center text-white font-semibold text-lg shadow-sm`}>
            {getInitials(employee.name)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {employee.name}
              </h3>
              {employee.employee_id && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {employee.employee_id}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 truncate font-medium">{employee.position}</p>
            {employee.manager && (
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                <User size={12} />
                Reports to {employee.manager}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-1">
          <button
            onClick={() => onEdit(employee)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit employee"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => onDelete(employee.id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete employee"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Status and Department */}
      <div className="flex items-center gap-2 mb-4">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${getDepartmentColor(employee.department)}`}>
          <Building size={12} className="mr-1" />
          {employee.department}
        </span>
        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${getStatusColor(employee.status || 'Active')}`}>
          <Badge size={12} className="mr-1" />
          {employee.status || 'Active'}
        </span>
      </div>

      {/* Employee Details Grid */}
      <div className="grid grid-cols-1 gap-3 mb-4">
        {/* Email */}
        <div className="flex items-center space-x-3 text-sm">
          <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg">
            <Mail size={14} className="text-gray-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
            <p className="text-gray-900 truncate font-medium">{employee.email}</p>
          </div>
        </div>

        {/* Phone */}
        {employee.phone && (
          <div className="flex items-center space-x-3 text-sm">
            <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg">
              <Phone size={14} className="text-gray-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Phone</p>
              <p className="text-gray-900 truncate font-medium">{employee.phone}</p>
            </div>
          </div>
        )}

        {/* Salary */}
        <div className="flex items-center space-x-3 text-sm">
          <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg">
            <DollarSign size={14} className="text-gray-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Annual Salary</p>
            <p className="text-gray-900 font-semibold">{formatSalary(employee.salary)}</p>
          </div>
        </div>

        {/* Hire Date */}
        <div className="flex items-center space-x-3 text-sm">
          <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg">
            <Calendar size={14} className="text-gray-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Hire Date</p>
            <p className="text-gray-900 font-medium">{formatDate(employee.hire_date)}</p>
          </div>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">Years of Service</span>
          <span className="font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded">
            {Math.floor((Date.now() - new Date(employee.hire_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} years
          </span>
        </div>
      </div>
    </div>
  );
};

export default EmployeeCard;
