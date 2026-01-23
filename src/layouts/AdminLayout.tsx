import { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useI18n } from '@/contexts/I18nContext';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import {
    LayoutDashboard,
    Users,
    FileText,
    Wallet,
    CreditCard,
    Settings,
    History,
    LogOut
} from 'lucide-react';
import secureIcon from '@/assets/secure-icon.svg';

export function AdminLayout() {
    const { signOut, userData } = useAuth();
    const { t } = useI18n();
    const navigate = useNavigate();
    const location = useLocation();
    const [isScrolled, setIsScrolled] = useState(false);

    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    async function handleLogout() {
        try {
            await signOut();
            navigate('/');
        } catch (error) {
            console.error('Failed to logout:', error);
        }
    }

    const navigationLinks = [
        { to: '/admin', label: t('nav.dashboard'), icon: LayoutDashboard },
        { to: '/admin/requests', label: t('nav.requests'), icon: FileText },
        { to: '/admin/loans', label: t('nav.loans'), icon: Wallet },
        { to: '/admin/payments', label: t('nav.payments'), icon: CreditCard },
        { to: '/admin/clients', label: t('nav.clients'), icon: Users },
    ];

    const secondaryLinks = [
        { to: '/admin/audit', label: t('nav.audit'), icon: History },
        { to: '/admin/settings', label: t('nav.settings'), icon: Settings },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="min-h-screen bg-[#f8f9fd] flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
            <motion.div className="fixed top-0 left-0 right-0 h-1 bg-indigo-600 origin-left z-[100]" style={{ scaleX }} />

            {/* HIGH-TECH ADMIN HEADER */}
            <header className={`sticky top-0 z-50 transition-all duration-500 border-b ${isScrolled ? 'bg-slate-900 shadow-2xl py-3 border-slate-800' : 'bg-slate-950 py-5 border-transparent'
                }`}>
                <div className="container mx-auto px-6 flex items-center justify-between">
                    <div className="flex items-center gap-12">
                        <Link to="/admin" className="flex items-center gap-3 group">
                            <motion.div
                                whileHover={{ rotate: 10 }}
                                className="w-11 h-11 rounded-2xl overflow-hidden border border-indigo-500/30 shadow-lg shadow-indigo-500/30 bg-slate-900/80 flex items-center justify-center"
                            >
                                <img src={secureIcon} alt="Secure logo" className="w-9 h-9" loading="lazy" />
                            </motion.div>
                            <div className="flex flex-col leading-tight">
                                <span className="font-black text-white tracking-[0.3em] text-[10px] uppercase">Secure</span>
                                <span className="font-bold text-indigo-200 text-[9px] uppercase tracking-[0.2em]">Admin Control</span>
                            </div>
                        </Link>

                        {/* Static Desktop Nav */}
                        <nav className="hidden lg:flex items-center gap-2">
                            {navigationLinks.map((link) => {
                                const active = isActive(link.to);
                                return (
                                    <Link
                                        key={link.to}
                                        to={link.to}
                                        className={`relative px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${active ? 'text-indigo-400' : 'text-slate-500 hover:text-white'
                                            }`}
                                    >
                                        {link.label}
                                        {active && (
                                            <motion.div
                                                layoutId="admin-nav-indicator"
                                                className="absolute bottom-0 left-5 right-5 h-[2px] bg-indigo-500 rounded-full"
                                            />
                                        )}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center bg-slate-900/50 border border-slate-800 rounded-full p-1 h-10">
                            <LanguageSelector />
                        </div>

                        <div className="h-6 w-[1px] bg-slate-800 mx-2 hidden md:block"></div>

                        {/* User Pill */}
                        <div className="flex items-center gap-3 pl-1 pr-1 py-1 bg-slate-900 border border-slate-800 rounded-full group cursor-pointer">
                            <div className="w-8 h-8 rounded-full bg-slate-800 border border-indigo-500/30 flex items-center justify-center font-black text-indigo-400 text-xs shadow-inner">
                                {userData?.fullName?.charAt(0)}
                            </div>
                            <span className="text-[10px] font-black text-slate-300 pr-3 hidden sm:inline group-hover:text-white transition-colors uppercase tracking-widest">{userData?.fullName?.split(' ')[0]}</span>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handleLogout}
                            className="w-10 h-10 flex items-center justify-center bg-slate-900 text-slate-500 hover:text-red-400 border border-slate-800 rounded-[1.25rem] transition-all"
                        >
                            <LogOut className="h-4 w-4" />
                        </motion.button>
                    </div>
                </div>
            </header>

            {/* MAIN PORTAL AREA */}
            <main className="flex-1 container mx-auto px-6 py-12 relative">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 10, filter: "blur(5px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        exit={{ opacity: 0, y: -10, filter: "blur(5px)" }}
                        transition={{ duration: 0.4, ease: "circOut" }}
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* ADMIN BOTTOM DOCK */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 px-6 pb-12 pointer-events-none flex justify-center">
                <div className="max-w-3xl w-full pointer-events-auto">
                    <motion.div
                        initial={{ y: 100 }}
                        animate={{ y: 0 }}
                        className="bg-white/80 backdrop-blur-3xl border border-slate-200/60 shadow-[0_40px_120px_rgba(0,0,0,0.15)] rounded-[3rem] p-3 flex items-center justify-around"
                    >
                        {/* Primary Icons */}
                        <div className="flex items-center gap-1">
                            {navigationLinks.map((link) => {
                                const active = isActive(link.to);
                                const Icon = link.icon;
                                return (
                                    <Link key={link.to} to={link.to} className="relative p-4 flex flex-col items-center group">
                                        <motion.div
                                            animate={{ y: active ? -4 : 0, scale: active ? 1.15 : 1 }}
                                            className={`${active ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-900'} transition-all duration-300`}
                                        >
                                            <Icon className="h-5 w-5" />
                                        </motion.div>
                                        <AnimatePresence>
                                            {active && (
                                                <motion.span
                                                    initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                                                    className="text-[8px] font-black uppercase tracking-widest text-slate-900 absolute -bottom-1"
                                                >
                                                    {link.label}
                                                </motion.span>
                                            )}
                                        </AnimatePresence>
                                        {active && (
                                            <motion.div layoutId="admin-dock-blob" className="absolute inset-2 bg-indigo-50 border border-indigo-100 rounded-[2rem] -z-10" />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>

                        <div className="h-10 w-[1px] bg-slate-100 mx-4"></div>

                        {/* Secondary Icons */}
                        <div className="flex items-center gap-1">
                            {secondaryLinks.map((link) => {
                                const active = isActive(link.to);
                                const Icon = link.icon;
                                return (
                                    <Link key={link.to} to={link.to} className="relative p-4 flex flex-col items-center group">
                                        <Icon className={`h-5 w-5 ${active ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-900'}`} />
                                        {active && <motion.div layoutId="admin-dock-blob" className="absolute inset-2 bg-indigo-50 border border-indigo-100 rounded-[2rem] -z-10" />}
                                    </Link>
                                );
                            })}
                        </div>
                    </motion.div>
                </div>
            </nav>
        </div>
    );
}
