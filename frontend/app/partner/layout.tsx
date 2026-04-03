'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, ClipboardList, LogOut, ShieldCheck, User } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function PartnerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [partner, setPartner] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('nn_partner_token');
    const storedPartner = localStorage.getItem('nn_partner_data');
    if (!token && pathname !== '/partner/login') {
      router.push('/partner/login');
    } else if (storedPartner) {
      setPartner(JSON.parse(storedPartner));
    }
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem('nn_partner_token');
    localStorage.removeItem('nn_partner_data');
    router.push('/partner/login');
  };

  if (pathname === '/partner/login') return <>{children}</>;

  return (
    <div className="flex min-h-screen bg-emerald-50/30 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-900 shadow-2xl hidden md:flex flex-col border-r dark:border-gray-800">
        <div className="p-8 border-b dark:border-gray-800">
          <h1 className="text-xl font-black text-emerald-600 flex items-center space-x-2">
            <ShieldCheck size={24} />
            <span>Partner Hub</span>
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-gray-400 mt-1 font-bold">NaijaNeed Solutions</p>
        </div>
        
        <nav className="flex-1 p-6 space-y-3">
          <PartnerNavLink href="/partner/dashboard" icon={<LayoutDashboard size={20} />} active={pathname === '/partner/dashboard'}>
            Dashboard
          </PartnerNavLink>
          <PartnerNavLink href="/partner/needs" icon={<ClipboardList size={20} />} active={pathname === '/partner/needs'}>
            Assigned Needs
          </PartnerNavLink>
          <PartnerNavLink href="/partner/profile" icon={<User size={20} />} active={pathname === '/partner/profile'}>
            Profile
          </PartnerNavLink>
        </nav>

        <div className="p-6 border-t dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
          <div className="mb-4">
             <p className="text-xs font-bold text-gray-400 uppercase tracking-tight">Organization</p>
             <p className="font-bold text-sm truncate">{partner?.name || 'Loading...'}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 w-full p-3 rounded-xl transition-all font-bold text-sm"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-10 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

function PartnerNavLink({ href, icon, children, active }: { href: string; icon: any; children: string; active: boolean }) {
  return (
    <Link 
      href={href}
      className={`flex items-center space-x-4 p-4 rounded-2xl transition-all ${
        active 
          ? 'bg-emerald-600 text-white shadow-xl scale-[1.02]' 
          : 'hover:bg-emerald-50 dark:hover:bg-emerald-900/10 text-gray-500 dark:text-gray-400 font-bold'
      }`}
    >
      {icon}
      <span className="text-sm">{children}</span>
    </Link>
  );
}
