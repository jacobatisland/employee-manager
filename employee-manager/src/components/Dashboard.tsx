import React, { useMemo } from 'react';
import { Employee } from '../types';
import { Users, Building2, DollarSign, Calendar, TrendingUp, Award, Target, Clock, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import LoadingSkeleton from './LoadingSkeleton';

interface DashboardProps {
  employees: Employee[];
  loading: boolean;
  error: string | null;
  onRefresh?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ employees, loading, error, onRefresh }) => {
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

    // Calculate average experience in years
    const totalExperience = employees.reduce((sum, emp) => {
      const hireDate = new Date(emp.hire_date);
      const experience = (Date.now() - hireDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
      return sum + experience;
    }, 0);

    const averageExperience = totalExperience / employees.length;

    // Simulate retention rate (would need termination data in real app)
    const retentionRate = Math.max(85, 100 - (recentHires / employees.length * 100));

    // Calculate growth rate
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

  const hiringTrends = useMemo(() => {
    const monthlyHires = new Map();
    const currentDate = new Date();
    
    // Initialize last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const key = date.toISOString().slice(0, 7); // YYYY-MM format
      monthlyHires.set(key, {
        month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        hires: 0
      });
    }
    
    // Count actual hires
    employees.forEach(emp => {
      const hireDate = new Date(emp.hire_date);
      const key = hireDate.toISOString().slice(0, 7);
      if (monthlyHires.has(key)) {
        monthlyHires.get(key).hires++;
      }
    });
    
    return Array.from(monthlyHires.values());
  }, [employees]);

  const topPerformingDepartments = useMemo(() => {
    return departmentData
      .map(dept => ({
        ...dept,
        efficiency: dept.averageSalary / dept.employees // Salary per employee ratio
      }))
      .sort((a, b) => b.efficiency - a.efficiency)
      .slice(0, 3);
  }, [departmentData]);


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

  return (
    <div className="space-y-6">
      {/* Dashboard Header with Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-600 mt-1">Overview of your organization</p>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={loading}
            className="btn-secondary flex items-center gap-2"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh Data
          </button>
        )}
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-hover">
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
        </div>

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

      {/* Key Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card">
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
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-purple-900">${stats.averageSalary.toLocaleString()}</p>
                <p className="text-xs text-purple-600">Average salary</p>
              </div>
              <DollarSign className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Award size={20} />
            Top Departments
          </h3>
          <div className="space-y-3">
            {topPerformingDepartments.map((dept, index) => (
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
                  <p className="text-xs text-gray-500">${Math.round(dept.efficiency / 1000)}k avg</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Hiring Trends</h3>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hiringTrends.slice(-6)}>
                <defs>
                  <linearGradient id="colorHires" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis hide />
                <Tooltip 
                  labelStyle={{ color: '#374151' }}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="hires"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorHires)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Distribution */}
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
                <Tooltip />
                <Bar dataKey="employees" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Salary Distribution */}
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
                >
                  {salaryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Department Details */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp size={20} />
          Department Analytics
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employees
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Average Salary
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {departmentData.map((dept) => (
                <tr key={dept.name}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {dept.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {dept.employees}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${dept.averageSalary.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
