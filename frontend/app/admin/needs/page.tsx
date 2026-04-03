'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useState } from 'react';
import { Search, CheckCircle2, MoreHorizontal, User, X, Tag, Save, MessageSquare, ClipboardList, RefreshCw, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Location from 'nigeria-geo';

const categoryKeys = [
  'edu', 'water', 'health', 'power', 'roads', 'security', 
  'waste', 'transport', 'jobs', 'markets', 'housing', 
  'agri', 'youth', 'env', 'others'
];

const categoryLabels = {
  "edu": "Education (Schools, Teachers)",
  "water": "Water & Sanitation (Boreholes, Repairs)",
  "health": "Healthcare (Clinics, Drugs)",
  "power": "Power & Electricity (Transformers, Wiring)",
  "roads": "Roads & Infrastructure (Potholes, Bridges)",
  "security": "Public Security (Police, Lighting)",
  "waste": "Waste Management (Refuse, Dumping)",
  "transport": "Transportation (Bus Stops, Traffic)",
  "jobs": "Job & Skills Training",
  "markets": "Markets & Small Business Support",
  "housing": "Housing & Shelter",
  "agri": "Agriculture & Food Support",
  "youth": "Youth & Sports Development",
  "env": "Drainage & Erosion Control",
  "others": "Other Issues"
};

export default function AdminNeedsList() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ status: '', categoryId: '', stateId: '', lgaId: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNeeds, setSelectedNeeds] = useState<string[]>([]);
  
  const allStates = Location.states();
  const selectedStateData = filters.stateId ? Location.all().find((s: any) => s.state === filters.stateId) : null;
  const lgas = selectedStateData ? selectedStateData.lgas : [];
  const [selectedNeedPanel, setSelectedNeedPanel] = useState<any | null>(null);
  
  // States for Side Panel Edits
  const [panelStatus, setPanelStatus] = useState('');
  const [panelNotes, setPanelNotes] = useState('');
  const [panelPartnerId, setPanelPartnerId] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['adminNeeds', filters, searchTerm],
    queryFn: () => {
      const token = localStorage.getItem('nn_admin_token');
      return api.get('/api/admin/needs', {
        params: { ...filters, search: searchTerm },
        headers: { Authorization: `Bearer ${token}` }
      }).then(r => r.data);
    }
  });

  const { data: partnersData } = useQuery({
    queryKey: ['adminPartners'],
    queryFn: () => {
      const token = localStorage.getItem('nn_admin_token');
      return api.get('/api/admin/partners', {
        headers: { Authorization: `Bearer ${token}` }
      }).then(r => r.data);
    }
  });

  const updateNeedMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => {
      const token = localStorage.getItem('nn_admin_token');
      return api.patch(`/api/admin/needs/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminNeeds'] });
    }
  });

  const handleStatusChange = (id: string, newStatus: string) => {
    updateNeedMutation.mutate({ id, payload: { status: newStatus } });
  };

  const handleBulkAction = (action: string) => {
    if (selectedNeeds.length === 0) return;
    if (action === 'status_fulfilled') {
      Promise.all(selectedNeeds.map(id => 
        updateNeedMutation.mutateAsync({ id, payload: { status: 'Fulfilled' } })
      )).then(() => setSelectedNeeds([]));
    }
    if (action === 'status_assigned') {
      Promise.all(selectedNeeds.map(id => 
        updateNeedMutation.mutateAsync({ id, payload: { status: 'Assigned' } })
      )).then(() => setSelectedNeeds([]));
    }
  };

  const toggleNeedSelection = (id: string) => {
    setSelectedNeeds(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedNeeds.length === data?.needs?.length) {
      setSelectedNeeds([]);
    } else {
      setSelectedNeeds(data?.needs?.map((n: any) => n.id) || []);
    }
  };

  const openPanel = (need: any) => {
    setSelectedNeedPanel(need);
    setPanelStatus(need.status || '');
    setPanelNotes(need.admin_notes || '');
    setPanelPartnerId(need.assigned_partner_id || '');
  };

  const savePanelEdits = () => {
    if (!selectedNeedPanel) return;
    updateNeedMutation.mutate({
      id: selectedNeedPanel.id,
      payload: {
        status: panelStatus,
        admin_notes: panelNotes,
        assigned_partner_id: panelPartnerId || null
      }
    }, {
      onSuccess: () => {
        setSelectedNeedPanel(null);
      }
    });
  };

  const handleExportCSV = async () => {
    try {
      const token = localStorage.getItem('nn_admin_token');
      
      const queryParams = new URLSearchParams();
      if (selectedNeeds.length > 0) {
        queryParams.append('ids', selectedNeeds.join(','));
      } else {
        if (filters.status) queryParams.append('status', filters.status);
        if (filters.categoryId) queryParams.append('categoryId', filters.categoryId);
        if (filters.stateId) queryParams.append('stateId', filters.stateId);
        if (filters.lgaId) queryParams.append('lgaId', filters.lgaId);
        if (searchTerm) queryParams.append('search', searchTerm);
      }

      const response = await api.get(`/api/admin/reports/needs/csv?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'naijaneed_needs_report.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed', error);
    }
  };

  if (isLoading) return (
    <div className="flex justify-center items-center h-96">
      <RefreshCw className="animate-spin text-green-500" size={32} />
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      <header className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <div className="flex w-full md:w-auto justify-between items-center md:items-start">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Submissions Table</h2>
            <p className="text-sm text-gray-500 mt-1">Manage and track citizen needs across regions.</p>
          </div>
          <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold shadow-sm transition ml-4">
            <Download size={16} />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
        
        <div className="flex items-center space-x-3 bg-white dark:bg-gray-800 p-1.5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="relative group flex-1 w-full md:w-auto">
            <Search className="absolute left-3 top-2.5 text-gray-400 group-focus-within:text-green-500 transition-colors" size={18} />
            <input 
              placeholder="Search needs..." 
              className="pl-10 p-2 rounded-xl border border-gray-100 dark:bg-gray-700 dark:border-gray-600 bg-transparent outline-none focus:ring-2 focus:ring-green-500 transition-all text-sm w-full md:w-64"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex space-x-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            <select 
              className="p-2 rounded-xl border border-gray-100 dark:bg-gray-700 dark:border-gray-600 bg-transparent outline-none text-sm font-medium"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Fulfilled">Fulfilled</option>
            </select>
            <select 
              className="p-2 rounded-xl border border-gray-100 dark:bg-gray-700 dark:border-gray-600 bg-transparent outline-none text-sm font-medium"
              value={filters.categoryId}
              onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}
            >
              <option value="">All Categories</option>
              {categoryKeys.map((key) => (
                <option key={key} value={key}>{categoryLabels[key as keyof typeof categoryLabels]}</option>
              ))}
            </select>
            <select 
              className="p-2 rounded-xl border border-gray-100 dark:bg-gray-700 dark:border-gray-600 bg-transparent outline-none text-sm font-medium"
              value={filters.stateId}
              onChange={(e) => setFilters({ ...filters, stateId: e.target.value, lgaId: '' })}
            >
              <option value="">All States</option>
              {allStates.map((state: string) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
            <select 
              className="p-2 rounded-xl border border-gray-100 dark:bg-gray-700 dark:border-gray-600 bg-transparent outline-none text-sm font-medium"
              value={filters.lgaId}
              onChange={(e) => setFilters({ ...filters, lgaId: e.target.value })}
              disabled={!filters.stateId}
            >
              <option value="">All LGAs</option>
              {lgas.map((lga: string) => (
                <option key={lga} value={lga}>{lga}</option>
              ))}
            </select>
            <input 
              type="date"
              className="p-2 rounded-xl border border-gray-100 dark:bg-gray-700 dark:border-gray-600 bg-transparent outline-none text-sm font-medium text-gray-500"
            />
          </div>
        </div>
      </header>

      {selectedNeeds.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3 rounded-2xl flex items-center justify-between shadow-sm"
        >
          <span className="text-sm font-medium text-green-800 dark:text-green-300 px-2">
            {selectedNeeds.length} items selected
          </span>
          <div className="flex space-x-2">
            <button onClick={() => handleBulkAction('status_assigned')} className="text-xs font-semibold px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 transition">
              Mark as Assigned
            </button>
            <button onClick={() => handleBulkAction('status_fulfilled')} className="text-xs font-semibold px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 transition">
              Mark as Fulfilled
            </button>
          </div>
        </motion.div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/80 dark:bg-gray-700/50 text-gray-500 font-semibold text-xs uppercase tracking-wider border-b dark:border-gray-700">
                <th className="p-4 pl-6 w-12">
                  <input 
                    type="checkbox" 
                    className="rounded text-green-600 focus:ring-green-500 cursor-pointer w-4 h-4"
                    checked={data?.needs?.length > 0 && selectedNeeds.length === data?.needs?.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="p-4">Citizen / Location</th>
                <th className="p-4">Category</th>
                <th className="p-4">Snapshot</th>
                <th className="p-4">Status</th>
                <th className="p-4">Submitted</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {data?.needs?.map((need: any) => (
                <tr 
                  key={need.id} 
                  className={`hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group cursor-pointer ${
                    selectedNeeds.includes(need.id) ? 'bg-green-50/50 dark:bg-green-900/10' : ''
                  }`}
                  onClick={(e) => {
                    // Prevent row click if clicking checkbox or action buttons
                    if ((e.target as HTMLElement).tagName.toLowerCase() === 'input' || (e.target as HTMLElement).closest('button')) return;
                    openPanel(need);
                  }}
                >
                  <td className="p-4 pl-6">
                    <input 
                      type="checkbox" 
                      className="rounded text-green-600 focus:ring-green-500 cursor-pointer w-4 h-4"
                      checked={selectedNeeds.includes(need.id)}
                      onChange={() => toggleNeedSelection(need.id)}
                    />
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div className="h-9 w-9 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/50 dark:to-green-800/50 text-green-700 dark:text-green-300 rounded-full flex items-center justify-center font-bold shadow-sm">
                        <User size={16} />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">{need.users?.name || 'Anonymous'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{need.users?.lgas?.name}, {need.users?.states?.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap border border-gray-200 dark:border-gray-600">
                      {need.categories?.name}
                    </span>
                  </td>
                  <td className="p-4 max-w-[200px]">
                    <p className="text-sm truncate text-gray-600 dark:text-gray-300" title={need.description}>
                      {need.description}
                    </p>
                  </td>
                  <td className="p-4">
                    <StatusBadge status={need.status} />
                  </td>
                  <td className="p-4 whitespace-nowrap text-xs font-medium text-gray-500">
                    {new Date(need.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric'})}
                  </td>
                  <td className="p-4 text-right">
                     <button 
                      onClick={() => handleStatusChange(need.id, 'Fulfilled')}
                      className="text-gray-400 hover:text-emerald-600 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 hover:border-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 p-1.5 rounded-lg transition-all shadow-sm opacity-0 group-hover:opacity-100"
                      title="Quick Complete"
                     >
                       <CheckCircle2 size={16} />
                     </button>
                  </td>
                </tr>
              ))}
              {data?.needs?.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    No submissions found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Panel for Details */}
      <AnimatePresence>
        {selectedNeedPanel && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setSelectedNeedPanel(null)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full md:w-[480px] bg-white dark:bg-gray-900 shadow-2xl z-50 border-l border-gray-200 dark:border-gray-800 overflow-y-auto flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center sticky top-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md z-10">
                <h3 className="text-lg font-bold">Submission Details</h3>
                <button 
                  onClick={() => setSelectedNeedPanel(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-8 flex-1">
                {/* Header Info */}
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xl font-bold">{selectedNeedPanel.users?.name || 'Anonymous User'}</h4>
                    <p className="text-gray-500 text-sm mt-1">
                      {selectedNeedPanel.users?.lgas?.name}, {selectedNeedPanel.users?.states?.name}
                    </p>
                  </div>
                  <StatusBadge status={panelStatus} />
                </div>

                {/* Core Details */}
                <div className="space-y-4 bg-gray-50 dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-700/50">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">Category</p>
                    <p className="font-medium flex items-center gap-2">
                       <Tag size={14} className="text-green-500"/>
                       {selectedNeedPanel.categories?.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">Full Description</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {selectedNeedPanel.description}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1 mt-4">Tags</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                       <span className="px-2 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 text-xs font-bold rounded-lg flex items-center gap-1"><Tag size={12}/> High Priority</span>
                       <span className="px-2 py-1 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 text-xs font-bold rounded-lg flex items-center gap-1"><Tag size={12}/> Follow Up</span>
                       <button className="px-2 py-1 bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400 text-xs font-bold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition flex items-center gap-1">
                          + Add Tag
                       </button>
                    </div>
                  </div>
                </div>

                {/* Actions & Overrides */}
                <div className="space-y-5">
                  <h5 className="font-semibold text-sm border-b border-gray-100 dark:border-gray-800 pb-2">Management Controls</h5>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Update Status</label>
                    <select 
                      value={panelStatus}
                      onChange={(e) => setPanelStatus(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 outline-none focus:ring-2 focus:ring-green-500/50"
                    >
                      <option value="Submitted">Submitted</option>
                      <option value="Assigned">Assigned</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Fulfilled">Fulfilled</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Assign Partner</label>
                    <select 
                      value={panelPartnerId}
                      onChange={(e) => setPanelPartnerId(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 outline-none focus:ring-2 focus:ring-green-500/50"
                    >
                      <option value="">-- No Partner Assigned --</option>
                      {partnersData?.map((p: any) => (
                        <option key={p.id} value={p.id}>{p.name} ({p.type})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <MessageSquare size={16} /> Admin Notes
                    </label>
                    <textarea 
                      value={panelNotes}
                      onChange={(e) => setPanelNotes(e.target.value)}
                      className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 outline-none focus:ring-2 focus:ring-green-500/50 text-sm min-h-[100px]"
                      placeholder="Add internal notes about this submission..."
                    />
                  </div>
                </div>
              </div>

              {/* Panel Footer */}
              <div className="p-6 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-800 sticky bottom-0 z-10 flex gap-3">
                <button 
                  onClick={() => setSelectedNeedPanel(null)}
                  className="px-5 py-2.5 rounded-xl text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={savePanelEdits}
                  className="flex-1 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  Save Changes
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: any = {
    'Submitted': 'text-gray-600 bg-gray-100 border-gray-200 dark:text-gray-400 dark:bg-gray-800 dark:border-gray-700',
    'Assigned': 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-900/10 dark:border-amber-900/30',
    'In Progress': 'text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-900/10 dark:border-blue-900/30',
    'Fulfilled': 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-900/10 dark:border-emerald-900/30'
  };

  return (
    <div className={`px-2.5 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider border ${colors[status] || colors['Submitted']} inline-flex items-center shadow-sm`}>
      {status}
    </div>
  );
}
