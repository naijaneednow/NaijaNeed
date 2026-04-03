'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/AdminCard';
import { Users, ClipboardList, CheckCircle, TrendingUp, Download } from 'lucide-react';

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['adminAnalytics'],
    queryFn: () => {
      const token = localStorage.getItem('nn_admin_token');
      return api.get('/api/admin/analytics', {
        headers: { Authorization: `Bearer ${token}` }
      }).then(r => r.data);
    }
  });

  const handleExport = async () => {
    const token = localStorage.getItem('nn_admin_token');
    const response = await api.get('/api/admin/reports/needs/csv', {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'naijaneed_report.csv');
    document.body.appendChild(link);
    link.click();
  };

  if (isLoading) return <p>Loading stats...</p>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Analytics Overview</h2>
        <button 
            onClick={handleExport}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg transition-all active:scale-95"
        >
          <Download size={20} />
          <span>Export CSV</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Submissions" value={stats?.totalSubmissions || 0} icon={<ClipboardList className="text-blue-500" />} change="+12% from last week" />
        <StatCard title="New this Month" value={stats?.currentMonthCount || 0} icon={<TrendingUp className="text-green-500" />} change="+5% from last month" />
        <StatCard title="Resolution Rate" value="32%" icon={<CheckCircle className="text-emerald-500" />} change="Target: 40%" />
        <StatCard title="Active Users" value="1,240" icon={<Users className="text-purple-500" />} change="+8% growth" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm h-80 flex items-center justify-center">
          <p className="text-gray-400 font-medium">Trends Chart Placeholder</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm h-80 flex items-center justify-center">
          <p className="text-gray-400 font-medium">Top Categories Placeholder</p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, change }: { title: string; value: string | number; icon: React.ReactNode; change: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-transparent hover:border-green-500 transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl group-hover:bg-green-500 transition-colors">
          <span className="group-hover:text-white transition-colors">{icon}</span>
        </div>
        <span className="text-xs font-semibold text-green-600 dark:text-green-400">{change}</span>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
        <p className="text-3xl font-bold tracking-tight">{value}</p>
      </div>
    </div>
  );
}
