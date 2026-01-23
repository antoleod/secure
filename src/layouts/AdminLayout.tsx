import { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useI18n } from '@/contexts/I18nContext';
import {
    LayoutDashboard,
    Users,
    FileText,
    Wallet,
    CreditCard,
    Settings,
    History,
    LogOut,
    ShieldAlert,
    Search,
    HelpCircle
} from 'lucide-react';

export function AdminLayout() {
    const { signOut, userData } = useAuth();
    const { t } = useI18n();
    const navigate = useNavigate();
    const location = useLocation();

    async function handleLogout() {
        try {
            await signOut();
            navigate('/');
        } catch (error) {
            console.error('Failed to logout:', error);
        }
    }

    // Main operational links for the BOTTOM DOCK
    const footerLinks = [
        { to: '/admin', label: 'Panel', icon: LayoutDashboard },
        { to: '/admin/clients', label: 'Clientes', icon: Users },
        { to: '/admin/requests', label: 'Pedidos', icon: FileText },
        { to: '/admin/loans', label: 'Préstamos', icon: Wallet },
        { to: '/admin/payments', label: 'Pagos', icon: CreditCard },
    ];

    // Administrative & config links for the HEADER
    const headerLinks = [
        { to: '/admin/settings', label: 'Ajustes', icon: Settings },
        { to: '/admin/audit', label: 'Auditoría', icon: History },
        { to: '/app/help', label: 'Soporte', icon: HelpCircle },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="min-h-screen bg-[#f8f9fc] flex flex-col pb-24 md:pb-28">
            {/* Admin Header with Config & Language */}
            <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link to="/admin" className="flex items-center gap-2 mr-2">
                            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                <ShieldAlert className="text-white h-5 w-5" />
                            </div>
                            <span className="font-black text-white tracking-widest text-[10px] uppercase italic hidden sm:inline">Admin Portal</span>
                        </Link>

                        {/* Desktop Admin Header Links */}
                        <nav className="hidden md:flex items-center gap-1">
                            {headerLinks.map((link) => (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${isActive(link.to)
                                            ? 'bg-indigo-500/20 text-indigo-400'
                                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex items-center gap-1 mr-2 border-r border-slate-700 pr-2">
                            <LanguageSelector />
                        </div>

                        <div className="hidden sm:flex flex-col items-end px-2">
                            <span className="text-xs font-bold text-white leading-none">{userData?.fullName}</span>
                            <span className="text-[9px] text-indigo-400 font-black uppercase tracking-widest mt-1">Super Admin</span>
                        </div>

                        <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-indigo-400 text-sm overflow-hidden ring-2 ring-slate-800 shadow-lg">
                            {userData?.fullName?.charAt(0)}
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-slate-500 hover:text-white hover:bg-slate-800 rounded-full"
                            onClick={handleLogout}
                        >
                            <LogOut className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 container mx-auto px-4 py-6 md:py-10">
                <div className="animate-in fade-in zoom-in-95 duration-500">
                    <Outlet />
                </div>
            </main>

            {/* PROFESSIONAL BOTTOM NAVIGATION (ADMIN DOCK) */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pointer-events-none">
                <div className="container mx-auto max-w-2xl pointer-events-auto">
                    <div className="bg-white/80 backdrop-blur-2xl border border-slate-200/50 shadow-[0_20px_60px_rgba(15,23,42,0.15)] rounded-[2.5rem] p-2 flex items-center justify-around">
                        {footerLinks.map((link) => {
                            const active = isActive(link.to);
                            const Icon = link.icon;
                            return (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    className={`
                                        relative group flex flex-col items-center justify-center 
                                        min-w-[4.8rem] py-3 rounded-[1.8rem] transition-all duration-300
                                        ${active ? 'bg-indigo-600 shadow-xl shadow-indigo-100' : 'hover:bg-slate-100'}
                                    `}
                                >
                                    <Icon className={`
                                        h-5 w-5 mb-1 transition-all duration-300
                                        ${active ? 'text-white' : 'text-slate-400 group-hover:text-slate-900'}
                                    `} />
                                    <span className={`
                                        text-[9px] uppercase font-black tracking-wider transition-all
                                        ${active ? 'text-white' : 'text-slate-400 group-hover:text-slate-900'}
                                    `}>
                                        {link.label}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </nav>
        </div>
    );
}
