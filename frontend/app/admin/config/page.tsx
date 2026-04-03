'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useState, useEffect } from 'react';
import { Settings, Save, RefreshCw, AlertCircle, Info } from 'lucide-react';

export default function AdminConfigPanel() {
  const queryClient = useQueryClient();
  const [localConfig, setLocalConfig] = useState<any>({});
  const [isChanged, setIsChanged] = useState(false);

  const { data: config, isLoading, isError } = useQuery({
    queryKey: ['platformConfig'],
    queryFn: () => api.get('/api/config').then(r => r.data)
  });

  useEffect(() => {
    if (config) {
      setLocalConfig(config);
    }
  }, [config]);

  const updateConfigMutation = useMutation({
    mutationFn: (updates: any) => {
      const token = localStorage.getItem('nn_admin_token');
      return api.patch('/api/admin/config', updates, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platformConfig'] });
      setIsChanged(false);
      alert('Configuration updated successfully!');
    }
  });

  const handleInputChange = (key: string, value: string) => {
    setLocalConfig({ ...localConfig, [key]: value });
    setIsChanged(true);
  };

  const handleSave = () => {
    updateConfigMutation.mutate(localConfig);
  };

  if (isLoading) return <div className="flex items-center justify-center h-full min-h-screen"><RefreshCw className="animate-spin text-green-500" /></div>;

  return (
    <div className="max-w-4xl space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Platform Configuration</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Control global settings without touching the code.</p>
        </div>
        
        <button
          onClick={handleSave}
          disabled={!isChanged || updateConfigMutation.isPending}
          className={`flex items-center space-x-2 px-8 py-4 rounded-2xl font-bold shadow-xl transition-all active:scale-95 ${
            isChanged 
              ? 'bg-green-600 hover:bg-green-700 text-white' 
              : 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
          }`}
        >
          <Save size={20} />
          <span>{updateConfigMutation.isPending ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      {isChanged && (
        <div className="flex items-center space-x-3 p-4 bg-amber-50 dark:bg-amber-900/10 border-l-4 border-amber-400 rounded-lg text-amber-700 dark:text-amber-400 font-medium">
          <Info size={20} />
          <span>You have unsaved changes. Remember to save to apply them globally.</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <ConfigCard title="Branding">
           <ConfigInput 
            label="Platform Name" 
            placeholder="NaijaNeed" 
            value={localConfig.PLATFORM_NAME} 
            onChange={(val: string) => handleInputChange('PLATFORM_NAME', val)} 
            icon={<Settings size={18} />}
           />
           <ConfigInput 
            label="Platform Tagline" 
            placeholder="Tell us what you need." 
            value={localConfig.PLATFORM_TAGLINE} 
            onChange={(val: string) => handleInputChange('PLATFORM_TAGLINE', val)} 
            icon={<Settings size={18} />}
           />
        </ConfigCard>

        <ConfigCard title="Rules & Limits">
           <ConfigInput 
            label="Weekly Limit" 
            placeholder="1" 
            type="number" 
            value={localConfig.WEEKLY_LIMIT} 
            onChange={(val: string) => handleInputChange('WEEKLY_LIMIT', val)} 
            icon={<AlertCircle size={18} />}
           />
           <ConfigInput 
            label="Map Visible" 
            type="select" 
            options={['true', 'false']} 
            value={localConfig.MAP_VISIBLE} 
            onChange={(val: string) => handleInputChange('MAP_VISIBLE', val)} 
            icon={<Settings size={18} />}
           />
        </ConfigCard>
      </div>

      <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700 text-center opacity-60">
         <p className="text-sm font-bold text-gray-400 italic">Advanced config variables (SMS APIs, Google Maps) coming in Phase 2</p>
      </div>
    </div>
  );
}

function ConfigCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-50 dark:border-gray-700 space-y-6 hover:shadow-2xl transition-all">
      <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest">{title}</h3>
      <div className="space-y-6">{children}</div>
    </div>
  );
}

function ConfigInput({ label, value, onChange, placeholder, type = 'text', icon, options }: any) {
  return (
    <div className="space-y-2 group">
      <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center space-x-2">
        <span>{label}</span>
      </label>
      <div className="relative">
        <div className="absolute left-4 top-4 text-gray-400 group-focus-within:text-green-500 transition-colors pointer-events-none">
          {icon}
        </div>
        {type === 'select' ? (
           <select
            className="w-full p-4 pl-12 rounded-xl bg-gray-50 dark:bg-gray-700 border border-transparent outline-none focus:ring-2 focus:ring-green-500 transition-all font-medium appearance-none"
            value={value}
            onChange={(e) => onChange(e.target.value)}
           >
             {options.map((opt: string) => <option key={opt} value={opt}>{opt.toUpperCase()}</option>)}
           </select>
        ) : (
          <input
            type={type}
            placeholder={placeholder}
            className="w-full p-4 pl-12 rounded-xl bg-gray-50 dark:bg-gray-700 border border-transparent outline-none focus:ring-2 focus:ring-green-500 transition-all font-medium"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
          />
        )}
      </div>
    </div>
  );
}
