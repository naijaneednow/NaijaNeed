'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { BarChart3, TrendingUp, Users, RefreshCw } from 'lucide-react';

export default function AnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['adminAnalytics'],
    queryFn: () => {
      const token = localStorage.getItem('nn_admin_token');
      return api.get('/api/admin/analytics', {
        headers: { Authorization: `Bearer ${token}` }
      }).then(r => r.data);
    }
  });

  if (isLoading) return (
    <div className="flex justify-center items-center h-96">
      <RefreshCw className="animate-spin text-green-500" size={32} />
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Platform Analytics</h2>
        <p className="text-gray-500 mt-2">Overview of submissions, growth, and user engagement.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-500 font-medium">Total Submissions</h3>
            <div className="h-10 w-10 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-full flex items-center justify-center">
              <BarChart3 size={20} />
            </div>
          </div>
          <p className="text-4xl font-bold mt-4 text-gray-900 dark:text-white">{data?.totalSubmissions || 0}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-500 font-medium">Current Month</h3>
            <div className="h-10 w-10 bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400 rounded-full flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
          </div>
          <p className="text-4xl font-bold mt-4 text-gray-900 dark:text-white">{data?.currentMonthCount || 0}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-500 font-medium">Recent Growth</h3>
            <div className="h-10 w-10 bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 rounded-full flex items-center justify-center">
              <Users size={20} />
            </div>
          </div>
          <p className="text-4xl font-bold mt-4 text-gray-900 dark:text-white">+{data?.recentGrowth || 0}%</p>
        </div>
      </div>
      
      {/* Placeholder for future charts */}
      <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 h-96 flex items-center justify-center flex-col text-center">
        <BarChart3 size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
        <h3 className="text-xl font-bold text-gray-500">Detailed charts coming soon</h3>
        <p className="text-gray-400 max-w-sm mt-2">Visualizations mapping out needs per state and timeline trends are under development.</p>
      </div>
    </div>
  );
}
