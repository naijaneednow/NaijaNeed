'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useState } from 'react';
import { HeartHandshake, Mail, Phone, MapPin, Plus, Loader2 } from 'lucide-react';

export default function AdminPartnersList() {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [newPartner, setNewPartner] = useState({ name: '', type: '', contact_email: '', contact_phone: '', password: '' });

  const { data: partners, isLoading } = useQuery({
    queryKey: ['adminPartners'],
    queryFn: () => {
      const token = localStorage.getItem('nn_admin_token');
      return api.get('/api/admin/partners', {
        headers: { Authorization: `Bearer ${token}` }
      }).then(r => r.data);
    }
  });

  const createPartnerMutation = useMutation({
    mutationFn: (partner: any) => {
      const token = localStorage.getItem('nn_admin_token');
      return api.post('/api/admin/partners', partner, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPartners'] });
      setIsAdding(false);
      setNewPartner({ name: '', type: '', contact_email: '', contact_phone: '', password: '' });
    }
  });

  const handleAddPartner = (e: React.FormEvent) => {
    e.preventDefault();
    createPartnerMutation.mutate(newPartner);
  };

  if (isLoading) return <p className="p-8 text-center text-gray-500 animate-pulse">Loading partners list...</p>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:justify-between md:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">System Partners</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Partners assigned to fulfill citizen needs.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="mt-4 md:mt-0 flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-2xl font-bold shadow-lg transition-transform active:scale-95"
        >
          <Plus size={20} />
          <span>{isAdding ? 'Cancel' : 'Add Partner'}</span>
        </button>
      </header>

      {/* Add Partner Form */}
      {isAdding && (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-green-100 dark:border-green-900/30 animate-in zoom-in-95 duration-200">
          <form onSubmit={handleAddPartner} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Partner Name</label>
              <input 
                required
                className="w-full p-3 rounded-xl border border-gray-100 dark:bg-gray-700 dark:border-gray-600 outline-none focus:ring-2 focus:ring-green-500 transition-all"
                value={newPartner.name}
                onChange={e => setNewPartner({...newPartner, name: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Type</label>
              <input 
                placeholder="NGO, Govt, Private..."
                className="w-full p-3 rounded-xl border border-gray-100 dark:bg-gray-700 dark:border-gray-600 outline-none focus:ring-2 focus:ring-green-500 transition-all"
                value={newPartner.type}
                onChange={e => setNewPartner({...newPartner, type: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Email</label>
              <input 
                type="email"
                required
                className="w-full p-3 rounded-xl border border-gray-100 dark:bg-gray-700 dark:border-gray-600 outline-none focus:ring-2 focus:ring-green-500 transition-all"
                value={newPartner.contact_email}
                onChange={e => setNewPartner({...newPartner, contact_email: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Initial Password</label>
              <input 
                type="password"
                required
                placeholder="Set temporary password"
                className="w-full p-3 rounded-xl border border-gray-100 dark:bg-gray-700 dark:border-gray-600 outline-none focus:ring-2 focus:ring-green-500 transition-all"
                value={newPartner.password}
                onChange={e => setNewPartner({...newPartner, password: e.target.value})}
              />
            </div>
            <div className="flex items-end">
              <button 
                type="submit"
                disabled={createPartnerMutation.isPending}
                className="w-full bg-green-600 h-12 rounded-xl text-white font-bold flex items-center justify-center space-x-2 disabled:bg-gray-400 shadow-md transition-all active:scale-95"
              >
                {createPartnerMutation.isPending ? <Loader2 className="animate-spin" /> : <span>Save Partner</span>}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 transition-all hover:shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 font-semibold text-xs uppercase tracking-widest border-b dark:border-gray-700">
                <th className="p-6">Partner</th>
                <th className="p-6">Contact Details</th>
                <th className="p-6">Coverage</th>
                <th className="p-6">Onboarded</th>
                <th className="p-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700">
              {partners?.map((partner: any) => (
                <tr key={partner.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors group">
                  <td className="p-6 whitespace-nowrap">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-2xl flex items-center justify-center font-bold shadow-sm transition-transform group-hover:scale-110">
                        <HeartHandshake size={22} />
                      </div>
                      <div>
                        <p className="font-bold text-base text-gray-900 dark:text-gray-100">{partner.name}</p>
                        <span className="text-[10px] bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full text-gray-500 uppercase tracking-widest font-bold">
                          {partner.type || 'Standard'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Mail size={14} className="mr-2 text-gray-400" />
                        {partner.contact_email}
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Phone size={14} className="mr-2 text-gray-400" />
                        {partner.contact_phone || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 font-medium">
                      <MapPin size={14} className="mr-2 text-green-500" />
                      {partner.states_covered?.length || 0} States Covered
                    </div>
                  </td>
                  <td className="p-6 whitespace-nowrap text-sm text-gray-500 font-medium">
                    {new Date(partner.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric'})}
                  </td>
                  <td className="p-6">
                    <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-widest border border-emerald-200 dark:border-emerald-900/30">
                      Active
                    </span>
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
