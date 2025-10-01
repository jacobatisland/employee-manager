import React from 'react';
import { Employee } from '../types';
import { Edit, Trash2, Mail, Calendar, DollarSign } from 'lucide-react';

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

  return (
    <div className={`card hover:shadow-md transition-all duration-200 relative ${
      isSelected ? 'ring-2 ring-primary-500 shadow-md' : ''
    }`}>
      {/* Selection Checkbox */}
      {onSelect && (
        <div className="absolute top-4 left-4">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect(employee.id, e.target.checked)}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {/* Avatar */}
          <div className={`w-12 h-12 rounded-full ${getAvatarColor(employee.id)} flex items-center justify-center text-white font-semibold text-lg`}>
            {getInitials(employee.name)}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {employee.name}
            </h3>
            <p className="text-sm text-gray-600 truncate">{employee.position}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-1">
          <button
            onClick={() => onEdit(employee)}
            className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
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

      {/* Department Badge */}
      <div className="mb-4">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDepartmentColor(employee.department)}`}>
          {employee.department}
        </span>
      </div>

      {/* Employee Details */}
      <div className="space-y-3">
        {/* Email */}
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Mail size={14} className="text-gray-400" />
          <span className="truncate">{employee.email}</span>
        </div>

        {/* Salary */}
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <DollarSign size={14} className="text-gray-400" />
          <span className="font-medium text-gray-900">{formatSalary(employee.salary)}</span>
          <span className="text-gray-500">annually</span>
        </div>

        {/* Hire Date */}
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Calendar size={14} className="text-gray-400" />
          <span>Hired {formatDate(employee.hire_date)}</span>
        </div>
      </div>

      {/* Experience Badge */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Experience</span>
          <span className="text-xs font-medium text-gray-700">
            {Math.floor((Date.now() - new Date(employee.hire_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} years
          </span>
        </div>
      </div>
    </div>
  );
};

export default EmployeeCard;
