import { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useI18n } from '@/contexts/I18nContext';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import {
    LayoutDashboard,
    UserCheck,
    ShieldCheck,
    Wallet,
    CreditCard,
    ShoppingBag,
    HelpCircle,
    LogOut,
    Bell,
    User,
    ChevronRight,
    Search
} from 'lucide-react';

export function CustomerLayout() {
    const { signOut, userData } = useAuth();
    const { t } = useI18n();
    const navigate = useNavigate();
    const location = useLocation();
    const [isScrolled, setIsScrolled] = useState(false);

    // Scroll progress line
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
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

    const footerLinks = [
        { to: '/app', label: t('nav.dashboard'), icon: LayoutDashboard },
        { to: '/app/collateral', label: t('nav.collateral'), icon: ShieldCheck },
        { to: '/app/loans', label: t('nav.loans'), icon: Wallet },
        { to: '/app/payments', label: t('nav.payments'), icon: CreditCard },
    ];

    const headerLinks = [
        { to: '/app/verify-identity', label: t('nav.identity'), icon: UserCheck },
        { to: '/app/store', label: t('nav.marketplace'), icon: ShoppingBag },
        { to: '/app/help', label: t('nav.support'), icon: HelpCircle },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="min-h-screen bg-[#fcfcfd] flex flex-col selection:bg-blue-100 selection:text-blue-900">
            {/* SCROLL PROGRESS BAR */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-1 bg-blue-600 origin-left z-[100]"
                style={{ scaleX }}
            />

            {/* ULTRA-MODERN HEADER */}
            <header
                className={`sticky top-0 z-50 transition-all duration-500 ${isScrolled
                        ? 'bg-white/80 backdrop-blur-2xl py-3 shadow-[0_4px_30px_rgba(0,0,0,0.03)] border-b border-slate-200/50'
                        : 'bg-transparent py-6 border-b border-transparent'
                    }`}
            >
                <div className="container mx-auto px-6 flex items-center justify-between">
                    <div className="flex items-center gap-10">
                        {/* Logo */}
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Link to="/app" className="flex items-center gap-3 group">
                                <div className="w-10 h-10 bg-slate-900 rounded-[1.25rem] flex items-center justify-center shadow-xl shadow-slate-200 group-hover:shadow-blue-500/20 transition-all duration-500 relative overflow-hidden">
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                    />
                                    <span className="text-white font-black text-xl italic z-10">O</span>
                                </div>
                                <span className="font-black text-slate-900 tracking-tighter text-2xl hidden lg:inline-block">Oryxen<span className="text-blue-600">.</span></span>
                            </Link>
                        </motion.div>

                        {/* Desktop Nav */}
                        <nav className="hidden md:flex items-center gap-1 bg-slate-100/50 p-1 rounded-full border border-slate-200/30">
                            {headerLinks.map((link) => {
                                const active = isActive(link.to);
                                return (
                                    <Link
                                        key={link.to}
                                        to={link.to}
                                        className={`relative px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${active ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
                                            }`}
                                    >
                                        <span className="relative z-10">{link.label}</span>
                                        {active && (
                                            <motion.div
                                                layoutId="header-active-pill"
                                                className="absolute inset-0 bg-white shadow-sm border border-slate-200/50 rounded-full"
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden sm:block">
                            <LanguageSelector />
                        </div>

                        {/* Notification Bell */}
                        <motion.button
                            whileHover={{ y: -2 }}
                            className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200/60 rounded-full shadow-sm relative"
                        >
                            <Bell className="h-4 w-4 text-slate-500" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full border-2 border-white"></span>
                        </motion.button>

                        <div className="h-8 w-[1px] bg-slate-200 mx-1 hidden md:block"></div>

                        {/* User Profile */}
                        <Link to="/app/verify-identity">
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="flex items-center gap-3 pl-1 pr-4 py-1 bg-white border border-slate-200/60 rounded-full shadow-sm hover:shadow-md transition-all cursor-pointer"
                            >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-100 to-slate-50 border border-slate-200 flex items-center justify-center font-black text-slate-700 text-xs overflow-hidden">
                                    {userData?.fullName?.charAt(0) || 'U'}
                                </div>
                                <div className="hidden lg:flex flex-col leading-none">
                                    <span className="text-[10px] font-black text-slate-900">{userData?.fullName?.split(' ')[0]}</span>
                                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{t('nav.profile')}</span>
                                </div>
                                <ChevronRight className="h-3 w-3 text-slate-300 ml-1" />
                            </motion.div>
                        </Link>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                            onClick={handleLogout}
                        >
                            <LogOut className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </header>

            {/* ROUTE CONTENT WITH SPRING ANIMATIONS */}
            <main className="flex-1 container mx-auto px-6 py-10 relative">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ type: "spring", stiffness: 200, damping: 25 }}
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* FLOATING ACTION DOCK (IOS STYLE) */}
            <nav className="fixed bottom-0 left-0 right-0 z-[100] px-6 pb-10 pointer-events-none">
                <div className="container mx-auto max-w-xl pointer-events-auto">
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
                        className="bg-slate-900/90 backdrop-blur-3xl border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.4)] rounded-[3rem] p-2 flex items-center justify-around"
                    >
                        {footerLinks.map((link) => {
                            const active = isActive(link.to);
                            const Icon = link.icon;
                            return (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    className="relative flex flex-col items-center justify-center py-4 min-w-[5rem] group"
                                >
                                    <motion.div
                                        animate={{
                                            scale: active ? 1.2 : 1,
                                            y: active ? -4 : 0
                                        }}
                                        className={`${active ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-300'} transition-colors duration-300`}
                                    >
                                        <Icon className="h-6 w-6" />
                                    </motion.div>

                                    <AnimatePresence>
                                        {active && (
                                            <motion.span
                                                initial={{ opacity: 0, scale: 0.5 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.5 }}
                                                className="text-[9px] font-black text-white uppercase tracking-[0.2em] absolute -bottom-1"
                                            >
                                                {link.label}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>

                                    {active && (
                                        <motion.div
                                            layoutId="dock-bubble"
                                            className="absolute inset-x-2 inset-y-1 bg-blue-500/10 border border-blue-500/20 rounded-[2rem] -z-10"
                                            transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                                        />
                                    )}
                                </Link>
                            );
                        })}
                    </motion.div>
                </div>
            </nav>
        </div>
    );
}
