'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { User, Mail, Phone, Calendar, MapPin, Shield } from 'lucide-react';

export default function AdminUsersList() {
  const { data: users, isLoading } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: () => {
      const token = localStorage.getItem('nn_admin_token');
      return api.get('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      }).then(r => r.data);
    }
  });

  if (isLoading) return <p className="p-8 text-center text-gray-500 animate-pulse">Loading users list...</p>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:justify-between md:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Platform Users</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage and view all registered citizens and administrators.</p>
        </div>
      </header>

      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 transition-all hover:shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 font-semibold text-xs uppercase tracking-widest border-b dark:border-gray-700">
                <th className="p-6">User Details</th>
                <th className="p-6">Contact Info</th>
                <th className="p-6">Location</th>
                <th className="p-6">Joined Date</th>
                <th className="p-6">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700">
              {users?.map((user: any) => (
                <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors group">
                  <td className="p-6 whitespace-nowrap">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-2xl flex items-center justify-center font-bold shadow-sm group-hover:scale-110 transition-transform">
                        <User size={22} />
                      </div>
                      <div>
                        <p className="font-bold text-base text-gray-900 dark:text-gray-100">{user.name || 'Citizen'}</p>
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-tighter">ID: {String(user.id).slice(0, 8)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Mail size={14} className="mr-2 text-gray-400" />
                        {user.email || 'N/A'}
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Phone size={14} className="mr-2 text-gray-400" />
                        {user.phone || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 font-medium">
                      <MapPin size={14} className="mr-2 text-green-500" />
                      {user.lga_id || 'Unknown'}, {user.state_id || 'Unknown'}
                    </div>
                  </td>
                  <td className="p-6 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500 font-medium">
                      <Calendar size={14} className="mr-2" />
                      {new Date(user.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric'})}
                    </div>
                  </td>
                  <td className="p-6">
                    {user.is_admin ? (
                      <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center w-fit border border-amber-200 dark:border-amber-900/30">
                        <Shield size={12} className="mr-1.5" />
                        Admin
                      </span>
                    ) : (
                      <span className="bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-widest w-fit block border border-gray-200 dark:border-gray-600">
                        User
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
