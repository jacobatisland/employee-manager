import React from 'react';

interface LoadingSkeletonProps {
  variant?: 'table' | 'card' | 'dashboard' | 'stats';
  count?: number;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  variant = 'table', 
  count = 3 
}) => {
  const shimmer = "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent";

  if (variant === 'stats') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className={`h-4 bg-gray-200 rounded w-24 ${shimmer}`}></div>
                <div className={`h-8 bg-gray-200 rounded w-16 ${shimmer}`}></div>
              </div>
              <div className={`w-12 h-12 bg-gray-200 rounded-full ${shimmer}`}></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'dashboard') {
    return (
      <div className="space-y-6">
        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className={`h-4 bg-gray-200 rounded w-24 ${shimmer}`}></div>
                  <div className={`h-8 bg-gray-200 rounded w-16 ${shimmer}`}></div>
                </div>
                <div className={`w-12 h-12 bg-gray-200 rounded-full ${shimmer}`}></div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="card">
              <div className={`h-6 bg-gray-200 rounded w-48 mb-4 ${shimmer}`}></div>
              <div className={`h-64 bg-gray-200 rounded ${shimmer}`}></div>
            </div>
          ))}
        </div>

        {/* Table Skeleton */}
        <div className="card">
          <div className={`h-6 bg-gray-200 rounded w-48 mb-4 ${shimmer}`}></div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex space-x-4">
                <div className={`h-4 bg-gray-200 rounded flex-1 ${shimmer}`}></div>
                <div className={`h-4 bg-gray-200 rounded w-16 ${shimmer}`}></div>
                <div className={`h-4 bg-gray-200 rounded w-24 ${shimmer}`}></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="card">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 bg-gray-200 rounded-full ${shimmer}`}></div>
                <div className="space-y-2">
                  <div className={`h-4 bg-gray-200 rounded w-32 ${shimmer}`}></div>
                  <div className={`h-3 bg-gray-200 rounded w-24 ${shimmer}`}></div>
                </div>
              </div>
              <div className="flex space-x-1">
                <div className={`w-8 h-8 bg-gray-200 rounded ${shimmer}`}></div>
                <div className={`w-8 h-8 bg-gray-200 rounded ${shimmer}`}></div>
              </div>
            </div>
            
            <div className={`h-6 bg-gray-200 rounded w-20 mb-4 ${shimmer}`}></div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className={`w-4 h-4 bg-gray-200 rounded ${shimmer}`}></div>
                <div className={`h-3 bg-gray-200 rounded flex-1 ${shimmer}`}></div>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-4 h-4 bg-gray-200 rounded ${shimmer}`}></div>
                <div className={`h-3 bg-gray-200 rounded w-20 ${shimmer}`}></div>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-4 h-4 bg-gray-200 rounded ${shimmer}`}></div>
                <div className={`h-3 bg-gray-200 rounded w-24 ${shimmer}`}></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Table variant
  return (
    <div className="card p-0">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Name', 'Email', 'Department', 'Position', 'Salary', 'Hire Date', 'Actions'].map((header) => (
                <th key={header} className="px-6 py-3 text-left">
                  <div className={`h-4 bg-gray-200 rounded w-16 ${shimmer}`}></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Array.from({ length: count }).map((_, i) => (
              <tr key={i}>
                <td className="px-6 py-4">
                  <div className={`h-4 bg-gray-200 rounded w-32 ${shimmer}`}></div>
                </td>
                <td className="px-6 py-4">
                  <div className={`h-4 bg-gray-200 rounded w-40 ${shimmer}`}></div>
                </td>
                <td className="px-6 py-4">
                  <div className={`h-6 bg-gray-200 rounded-full w-20 ${shimmer}`}></div>
                </td>
                <td className="px-6 py-4">
                  <div className={`h-4 bg-gray-200 rounded w-28 ${shimmer}`}></div>
                </td>
                <td className="px-6 py-4">
                  <div className={`h-4 bg-gray-200 rounded w-16 ${shimmer}`}></div>
                </td>
                <td className="px-6 py-4">
                  <div className={`h-4 bg-gray-200 rounded w-20 ${shimmer}`}></div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    <div className={`w-8 h-8 bg-gray-200 rounded ${shimmer}`}></div>
                    <div className={`w-8 h-8 bg-gray-200 rounded ${shimmer}`}></div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LoadingSkeleton;
