import React, { useMemo, useState } from 'react';
import { Employee } from '../types';
import { Users, Building2, DollarSign, Calendar, TrendingUp, Award, Target, Clock, ArrowLeft, Filter } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import LoadingSkeleton from './LoadingSkeleton';
import EmployeeCard from './EmployeeCard';

interface InteractiveDashboardProps {
  employees: Employee[];
  loading: boolean;
  error: string | null;
  onEdit: (employee: Employee) => void;
  onDelete: (id: number) => void;
}

type DrillDownView = 'overview' | 'department' | 'salary-range' | 'recent-hires' | 'top-departments';

interface DrillDownState {
  view: DrillDownView;
  filter?: {
    department?: string;
    salaryMin?: number;
    salaryMax?: number;
    recentDays?: number;
  };
}

const InteractiveDashboard: React.FC<InteractiveDashboardProps> = ({ 
  employees, 
  loading, 
  error,
  onEdit,
  onDelete 
}) => {
  const [drillDown, setDrillDown] = useState<DrillDownState>({ view: 'overview' });

  const stats = useMemo(() => {
    if (!employees.length) {
      return {
        totalEmployees: 0,
        totalDepartments: 0,
        averageSalary: 0,
        recentHires: 0,
        totalPayroll: 0,
        averageExperience: 0,
        retentionRate: 0,
        growthRate: 0
      };
    }

    const departments = new Set(employees.map(emp => emp.department));
    const totalSalary = employees.reduce((sum, emp) => sum + emp.salary, 0);
    const thirtyDaysAgo = new Date();
    const sixMonthsAgo = new Date();
    const oneYearAgo = new Date();
    
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    const recentHires = employees.filter(emp => 
      new Date(emp.hire_date) >= thirtyDaysAgo
    ).length;

    const hiresLastSixMonths = employees.filter(emp => 
      new Date(emp.hire_date) >= sixMonthsAgo
    ).length;

    const hiresLastYear = employees.filter(emp => 
      new Date(emp.hire_date) >= oneYearAgo
    ).length;

    const totalExperience = employees.reduce((sum, emp) => {
      const hireDate = new Date(emp.hire_date);
      const experience = (Date.now() - hireDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
      return sum + experience;
    }, 0);

    const averageExperience = totalExperience / employees.length;
    const retentionRate = Math.max(85, 100 - (recentHires / employees.length * 100));
    const growthRate = hiresLastYear > 0 ? ((hiresLastSixMonths / hiresLastYear) * 100) : 0;

    return {
      totalEmployees: employees.length,
      totalDepartments: departments.size,
      averageSalary: Math.round(totalSalary / employees.length),
      recentHires,
      totalPayroll: totalSalary,
      averageExperience: Math.round(averageExperience * 10) / 10,
      retentionRate: Math.round(retentionRate),
      growthRate: Math.round(growthRate)
    };
  }, [employees]);

  const departmentData = useMemo(() => {
    const deptMap = new Map<string, { count: number; totalSalary: number }>();
    
    employees.forEach(emp => {
      const current = deptMap.get(emp.department) || { count: 0, totalSalary: 0 };
      deptMap.set(emp.department, {
        count: current.count + 1,
        totalSalary: current.totalSalary + emp.salary
      });
    });

    return Array.from(deptMap.entries()).map(([name, data]) => ({
      name,
      employees: data.count,
      averageSalary: Math.round(data.totalSalary / data.count)
    }));
  }, [employees]);

  const salaryDistribution = useMemo(() => {
    const ranges = [
      { name: '< $60k', min: 0, max: 59999, count: 0, color: '#ef4444' },
      { name: '$60k - $80k', min: 60000, max: 79999, count: 0, color: '#f59e0b' },
      { name: '$80k - $100k', min: 80000, max: 99999, count: 0, color: '#10b981' },
      { name: '$100k - $120k', min: 100000, max: 119999, count: 0, color: '#3b82f6' },
      { name: '> $120k', min: 120000, max: Infinity, count: 0, color: '#8b5cf6' }
    ];

    employees.forEach(emp => {
      const range = ranges.find(r => emp.salary >= r.min && emp.salary <= r.max);
      if (range) range.count++;
    });

    return ranges.filter(r => r.count > 0);
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    let filtered = employees;

    if (drillDown.filter?.department) {
      filtered = filtered.filter(emp => emp.department === drillDown.filter?.department);
    }

    if (drillDown.filter?.salaryMin !== undefined && drillDown.filter?.salaryMax !== undefined) {
      filtered = filtered.filter(emp => 
        emp.salary >= drillDown.filter!.salaryMin! && emp.salary <= drillDown.filter!.salaryMax!
      );
    }

    if (drillDown.filter?.recentDays) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - drillDown.filter.recentDays);
      filtered = filtered.filter(emp => new Date(emp.hire_date) >= cutoffDate);
    }

    return filtered;
  }, [employees, drillDown.filter]);

  const handleDrillDown = (view: DrillDownView, filter?: any) => {
    setDrillDown({ view, filter });
  };

  const handleBack = () => {
    setDrillDown({ view: 'overview' });
  };

  if (loading) {
    return <LoadingSkeleton variant="dashboard" />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-medium mb-2">Connection Error</h3>
        <p className="text-red-600">{error}</p>
        <p className="text-red-600 mt-2 text-sm">
          Make sure the server is running and accessible from this client.
        </p>
      </div>
    );
  }

  // Drill-down views
  if (drillDown.view !== 'overview') {
    return (
      <div className="space-y-6">
        {/* Back Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="btn-secondary flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Overview
          </button>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Filter size={14} />
            <span>{filteredEmployees.length} employees</span>
          </div>
        </div>

        {/* Drill-down Title */}
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {drillDown.view === 'department' && `${drillDown.filter?.department} Department`}
            {drillDown.view === 'salary-range' && `Salary Range: $${drillDown.filter?.salaryMin?.toLocaleString()} - $${drillDown.filter?.salaryMax?.toLocaleString()}`}
            {drillDown.view === 'recent-hires' && `Recent Hires (Last ${drillDown.filter?.recentDays} days)`}
            {drillDown.view === 'top-departments' && 'Department Analysis'}
          </h2>
          <p className="text-gray-600">
            Detailed view of {filteredEmployees.length} employees matching your selection
          </p>
        </div>

        {/* Employee Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map((employee) => (
            <EmployeeCard
              key={employee.id}
              employee={employee}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>

        {filteredEmployees.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No employees found in this category.</p>
          </div>
        )}
      </div>
    );
  }

  // Main Dashboard View
  return (
    <div className="space-y-6">
      {/* Enhanced Stats Cards with Click Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <button
          onClick={() => handleDrillDown('recent-hires', { recentDays: 30 })}
          className="card-hover text-left w-full hover:shadow-lg transition-all duration-200 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Employees</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalEmployees}</p>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp size={12} className="mr-1" />
                {stats.growthRate}% growth
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500">Click to view recent hires</div>
        </button>

        <div className="card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Payroll</p>
              <p className="text-3xl font-bold text-gray-900">
                ${(stats.totalPayroll / 1000000).toFixed(1)}M
              </p>
              <p className="text-xs text-gray-500">Annual</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Experience</p>
              <p className="text-3xl font-bold text-gray-900">{stats.averageExperience}y</p>
              <p className="text-xs text-gray-500">Years with company</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Award className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Retention Rate</p>
              <p className="text-3xl font-bold text-gray-900">{stats.retentionRate}%</p>
              <p className="text-xs text-gray-500">Last 12 months</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <Target className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <button
          onClick={() => handleDrillDown('recent-hires', { recentDays: 30 })}
          className="card text-left hover:shadow-md transition-all duration-200 cursor-pointer"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock size={20} />
            Recent Activity
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-blue-900">{stats.recentHires} New Hires</p>
                <p className="text-xs text-blue-600">Last 30 days</p>
              </div>
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-green-900">{stats.totalDepartments} Departments</p>
                <p className="text-xs text-green-600">Active teams</p>
              </div>
              <Building2 className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <div className="mt-4 text-xs text-primary-600">Click to view recent hires →</div>
        </button>

        <button
          onClick={() => handleDrillDown('top-departments')}
          className="card text-left hover:shadow-md transition-all duration-200 cursor-pointer"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Award size={20} />
            Top Departments
          </h3>
          <div className="space-y-3">
            {departmentData.slice(0, 3).map((dept, index) => (
              <div key={dept.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                    index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                  }`}>
                    {index + 1}
                  </div>
                  <span className="text-sm font-medium text-gray-900">{dept.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{dept.employees} emp</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-xs text-primary-600">Click for detailed analysis →</div>
        </button>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            {departmentData.slice(0, 4).map((dept) => (
              <button
                key={dept.name}
                onClick={() => handleDrillDown('department', { department: dept.name })}
                className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{dept.name}</span>
                  <span className="text-xs text-gray-500">{dept.employees} employees</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Building2 size={20} />
            Employees by Department
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                          <p className="font-medium">{label}</p>
                          <p className="text-blue-600">
                            Employees: {payload[0].value}
                          </p>
                          <button
                            onClick={() => handleDrillDown('department', { department: label })}
                            className="mt-1 text-xs text-primary-600 hover:text-primary-700"
                          >
                            Click to view employees →
                          </button>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="employees" 
                  fill="#3b82f6" 
                  cursor="pointer"
                  onClick={(data) => {
                    if (data) {
                      handleDrillDown('department', { department: data.name });
                    }
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign size={20} />
            Salary Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={salaryDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, count }) => `${name}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  onClick={(data) => {
                    handleDrillDown('salary-range', {
                      salaryMin: data.min,
                      salaryMax: data.max === Infinity ? 200000 : data.max
                    });
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  {salaryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                          <p className="font-medium">{data.name}</p>
                          <p>Employees: {data.count}</p>
                          <p className="mt-1 text-xs text-primary-600">
                            Click to view employees →
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveDashboard;
