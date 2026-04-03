'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { User, Key, Save, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AdminProfile() {
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });

  const updatePasswordMutation = useMutation({
    mutationFn: (data: any) => {
      const token = localStorage.getItem('nn_admin_token');
      return api.patch('/api/admin/profile/password', data, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: () => {
      setStatus({ type: 'success', message: 'Password updated successfully!' });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setStatus({ type: null, message: '' }), 5000);
    },
    onError: (error: any) => {
      setStatus({ 
        type: 'error', 
        message: error.response?.data?.error || 'Failed to update password. Please try again.' 
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      setStatus({ type: 'error', message: 'New passwords do not match!' });
      return;
    }
    if (passwords.newPassword.length < 6) {
      setStatus({ type: 'error', message: 'Password must be at least 6 characters.' });
      return;
    }
    
    updatePasswordMutation.mutate({
      currentPassword: passwords.currentPassword,
      newPassword: passwords.newPassword
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
          <User className="text-green-600" size={32} />
          My Profile
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Manage your admin account settings and security.</p>
      </header>

      <section className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3 bg-gray-50 dark:bg-gray-800/80">
          <Key className="text-green-600" size={24} />
          <h3 className="text-xl font-bold">Change Password</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {status.type && (
            <div className={`p-4 rounded-xl flex items-start gap-3 ${status.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
              {status.type === 'success' ? <CheckCircle2 className="mt-0.5" size={18} /> : <AlertCircle className="mt-0.5" size={18} />}
              <p className="text-sm font-medium">{status.message}</p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Current Password</label>
            <input 
              type="password"
              required
              className="w-full p-4 rounded-xl border border-gray-200 dark:bg-gray-700 dark:border-gray-600 outline-none focus:ring-2 focus:ring-green-500 transition-all font-medium"
              value={passwords.currentPassword}
              onChange={e => setPasswords({...passwords, currentPassword: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">New Password</label>
              <input 
                type="password"
                required
                className="w-full p-4 rounded-xl border border-gray-200 dark:bg-gray-700 dark:border-gray-600 outline-none focus:ring-2 focus:ring-green-500 transition-all font-medium"
                value={passwords.newPassword}
                onChange={e => setPasswords({...passwords, newPassword: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Confirm New Password</label>
              <input 
                type="password"
                required
                className="w-full p-4 rounded-xl border border-gray-200 dark:bg-gray-700 dark:border-gray-600 outline-none focus:ring-2 focus:ring-green-500 transition-all font-medium"
                value={passwords.confirmPassword}
                onChange={e => setPasswords({...passwords, confirmPassword: e.target.value})}
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
             <button 
                type="submit"
                disabled={updatePasswordMutation.isPending}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 disabled:bg-gray-400 shadow-lg transition-transform active:scale-95"
              >
                {updatePasswordMutation.isPending ? <Loader2 className="animate-spin" /> : <><Save size={20} /><span>Update Password</span></>}
              </button>
          </div>
        </form>
      </section>
    </div>
  );
}
