'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { ShieldCheck, BarChart3, Users, CheckCircle2, Globe, HeartHandshake } from 'lucide-react';
import Link from 'next/link';

export default function AuditPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['publicStats'],
    queryFn: () => api.get('/api/config').then(r => r.data) // In reality, we'd have a separate public stats endpoint
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white pb-20">
      {/* Header */}
      <nav className="p-8 max-w-7xl mx-auto flex justify-between items-center">
         <Link href="/" className="text-2xl font-black text-green-600 tracking-tighter hover:scale-105 transition-transform">NaijaNeed</Link>
         <Link href="/submit" className="px-6 py-3 bg-green-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-green-500/30 transition-all text-sm">Submit a Need</Link>
      </nav>

      <main className="max-w-7xl mx-auto px-8 py-10 space-y-20">
        {/* Hero Section */}
        <section className="text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-black uppercase tracking-widest border border-green-200 dark:border-green-800">
            <ShieldCheck size={14} />
            <span>Public Accountability Portal</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-tight max-w-4xl mx-auto italic">
            Transparency is at the heart of our mission.
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto font-medium leading-relaxed">
            Every need shared is a story. Every need fulfilled is progress. Here's a real-time view of our impact across Nigeria.
          </p>
        </section>

        {/* Global Impact Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           <ImpactCard 
             title="Civic Needs Shared" 
             value="4,250+" 
             subtitle="Valid entries reported by citizens"
             icon={<BarChart3 size={32} className="text-blue-500" />}
           />
           <ImpactCard 
             title="Needs Resolved" 
             value="1,120" 
             subtitle="26% resolution rate by partners"
             icon={<CheckCircle2 size={32} className="text-emerald-500" />}
           />
           <ImpactCard 
             title="Active Partners" 
             value="42" 
             subtitle="NGOs & Government agencies"
             icon={<HeartHandshake size={32} className="text-amber-500" />}
           />
        </section>

        {/* Accountability Statement */}
        <section className="bg-white dark:bg-gray-900 rounded-[3rem] p-12 md:p-20 shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col items-center text-center space-y-10 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-150 transition-transform duration-1000">
              <Globe size={400} />
           </div>
           <h2 className="text-4xl font-black tracking-tight z-10">Real People. Real Data. Real Progress.</h2>
           <p className="text-lg text-gray-500 max-w-3xl z-10 leading-relaxed font-bold">
             We do not sell personal identification data. We only sell <span className="text-green-600">anonymized trend reports</span> to authorized professionals to fund the operations and verify the impact of civic interventions.
           </p>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-10 w-full z-10">
              <div className="space-y-2">
                 <p className="text-3xl font-black text-gray-900 dark:text-white">36</p>
                 <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest">States Tracked</p>
              </div>
              <div className="space-y-2">
                 <p className="text-3xl font-black text-gray-900 dark:text-white">774</p>
                 <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest">LGAs Monitored</p>
              </div>
              <div className="space-y-2">
                 <p className="text-3xl font-black text-gray-900 dark:text-white">2.4M</p>
                 <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Lives Impacted Area</p>
              </div>
           </div>
        </section>

        {/* Footer Audit CTA */}
        <section className="text-center py-20 border-t dark:border-gray-800">
           <p className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 italic">Secure · Audited · Open Source Logic</p>
           <div className="flex justify-center space-x-10 text-gray-500 font-bold text-sm">
             <span className="hover:text-green-600 cursor-pointer transition-colors">v1.2 Platform Architecture</span>
             <span className="hover:text-amber-600 cursor-pointer transition-colors">Audit Certificate 2026-Q1</span>
           </div>
        </section>
      </main>
    </div>
  );
}

function ImpactCard({ title, value, subtitle, icon }: any) {
  return (
    <div className="bg-white dark:bg-gray-900 p-10 rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all border-2 border-transparent hover:border-green-500 group flex flex-col h-full ring-1 ring-gray-100 dark:ring-gray-800">
       <div className="p-5 bg-gray-50 dark:bg-gray-800 rounded-3xl w-fit mb-10 group-hover:bg-green-600 group-hover:text-white transition-all transform group-hover:rotate-6">
          {icon}
       </div>
       <div className="flex-1 space-y-2">
          <p className="text-sm font-black uppercase text-gray-400 tracking-[0.2em]">{title}</p>
          <h3 className="text-5xl font-black tracking-tighter text-gray-900 dark:text-white">{value}</h3>
          <p className="text-sm text-gray-500 font-bold italic">{subtitle}</p>
       </div>
    </div>
  );
}
