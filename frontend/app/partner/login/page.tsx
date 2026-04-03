'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ShieldCheck } from 'lucide-react';

export default function PartnerLogin() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await api.post('/api/partner/auth/login', formData);
      localStorage.setItem('nn_partner_token', data.token);
      localStorage.setItem('nn_partner_data', JSON.stringify(data.partner));
      router.push('/partner/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50 dark:bg-gray-950 flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-[3rem] shadow-3xl overflow-hidden border border-emerald-100 dark:border-gray-800">
        <div className="p-14">
          <div className="flex flex-col items-center text-center mb-12">
            <div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-3xl text-emerald-600 mb-6">
               <ShieldCheck size={48} />
            </div>
            <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Partner Portal</h1>
            <p className="text-gray-500 font-medium">Connect civic needs to real solutions.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-rose-50 dark:bg-rose-900/10 border-l-4 border-rose-500 text-rose-700 dark:text-rose-400 text-sm font-bold rounded-xl animate-bounce">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-black uppercase text-gray-400 tracking-widest mb-3 ml-2">Official Email</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-5 text-gray-300 group-focus-within:text-emerald-500 transition-colors" size={20} />
                <input
                  name="email"
                  type="email"
                  placeholder="contact@ngo-org.ng"
                  className="w-full p-5 pl-14 rounded-3xl bg-gray-50 dark:bg-gray-800 border border-transparent outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-bold"
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-gray-400 tracking-widest mb-3 ml-2">Secure Password</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-5 text-gray-300 group-focus-within:text-emerald-500 transition-colors" size={20} />
                <input
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  className="w-full p-5 pl-14 rounded-3xl bg-gray-50 dark:bg-gray-800 border border-transparent outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-bold"
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-6 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-3xl text-xl shadow-2xl hover:shadow-emerald-500/40 transition-all disabled:opacity-50 mt-4 active:scale-95"
            >
              {loading ? 'Verifying Credentials...' : 'Access Hub'}
            </button>
          </form>
        </div>
        
        <div className="bg-emerald-50/50 dark:bg-gray-800/50 p-8 text-center border-t dark:border-gray-800">
           <p className="text-[10px] text-gray-400 font-black tracking-[0.2em] uppercase">Trusted Partner Infrastructure · v1.2</p>
        </div>
      </div>
    </div>
  );
}
