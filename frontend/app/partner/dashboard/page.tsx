'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useState } from 'react';
import { ClipboardList, CheckCircle2, MoreHorizontal, User, Filter, Search } from 'lucide-react';

export default function PartnerDashboard() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: needs, isLoading } = useQuery({
    queryKey: ['partnerNeeds'],
    queryFn: () => {
      const token = localStorage.getItem('nn_partner_token');
      return api.get('/api/partner/needs', {
        headers: { Authorization: `Bearer ${token}` }
      }).then(r => r.data);
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => {
      const token = localStorage.getItem('nn_partner_token');
      return api.patch(`/api/partner/needs/${id}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partnerNeeds'] });
    }
  });

  const handleStatusChange = (id: string, newStatus: string) => {
    updateStatusMutation.mutate({ id, status: newStatus });
  };

  if (isLoading) return <div className="h-40 w-full animate-pulse bg-gray-100 rounded-3xl" />;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <header className="flex flex-col md:flex-row md:justify-between md:items-end space-y-6 md:space-y-0">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white">Assigned Civic Needs</h2>
          <p className="text-gray-500 font-bold mt-2">Manage solutions for your designated regions.</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative group">
            <Search className="absolute left-4 top-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
            <input 
              placeholder="Search by ID or description..." 
              className="pl-14 p-4 rounded-3xl bg-white dark:bg-gray-800 border-2 border-transparent focus:border-emerald-500 outline-none transition-all text-sm font-bold w-72 shadow-xl"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {(needs || []).map((need: any) => (
          <div key={need.id} className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl border-2 border-transparent hover:border-emerald-500 transition-all p-8 flex flex-col group h-full">
            <div className="flex justify-between items-start mb-6">
              <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest">
                {need.categories?.name}
              </span>
              <StatusBadge status={need.status} />
            </div>

            <div className="flex-1 space-y-4">
               <h3 className="font-black text-lg line-clamp-3 text-gray-800 dark:text-gray-200">{need.description}</h3>
               <div className="flex items-center space-x-3 text-gray-500 p-4 bg-gray-50 dark:bg-gray-800 rounded-3xl">
                  <div className="h-10 w-10 bg-emerald-600 text-white rounded-full flex items-center justify-center font-black text-xs">
                     {need.users?.name?.charAt(0) || 'C'}
                  </div>
                  <div>
                    <p className="text-sm font-bold truncate">{need.users?.name || 'Citizen'}</p>
                    <p className="text-[10px] font-black uppercase tracking-wider opacity-60">LGA/State: {need.users?.lga_id || 'N/A'}</p>
                  </div>
               </div>
            </div>

            <div className="mt-8 flex items-center justify-between border-t dark:border-gray-800 pt-6">
               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Added {new Date(need.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric'})}</span>
               
               <div className="flex space-x-2">
                  {need.status !== 'Fulfilled' && (
                    <button 
                      onClick={() => handleStatusChange(need.id, 'In Progress')}
                      className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-xl text-xs font-black uppercase transition-all hover:scale-105 active:scale-95"
                    >
                      Start
                    </button>
                  )}
                  {need.status !== 'Fulfilled' && (
                    <button 
                      onClick={() => handleStatusChange(need.id, 'Fulfilled')}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase shadow-lg shadow-emerald-500/30 transition-all hover:scale-110 active:scale-95"
                    >
                      Resolve
                    </button>
                  )}
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: any = {
    'Submitted': 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800',
    'Assigned': 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/10',
    'In Progress': 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/10',
    'Fulfilled': 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/10'
  };

  return (
    <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${colors[status] || colors['Submitted']} border-none`}>
      {status}
    </div>
  );
}
