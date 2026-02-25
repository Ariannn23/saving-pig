import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Target,
  Settings,
  Plus,
  PieChart,
} from "lucide-react";
import { useUIStore } from "@/store/useUIStore";
import { useAuthStore } from "@/store/useAuthStore";
import { TransactionModal } from "@/components/transactions/TransactionModal";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { motion, AnimatePresence } from "framer-motion";
import { ToastContainer } from "@/components/ui/Toast";

interface MainLayoutProps {
  children: ReactNode;
}

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: ArrowLeftRight, label: "Transacciones", path: "/transactions" },
  { icon: PieChart, label: "Presupuesto", path: "/budget" },
  { icon: Target, label: "Metas", path: "/goals" },
  { icon: Settings, label: "Ajustes", path: "/settings" },
];

export const MainLayout = ({ children }: MainLayoutProps) => {
  const location = useLocation();
  const { user } = useAuthStore();
  const {
    isTransactionModalOpen,
    openTransactionModal,
    closeTransactionModal,
  } = useUIStore();

  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
    : user?.email?.substring(0, 2).toUpperCase() || "SP";

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-rose-500/30">
      {/* Sidebar (Desktop) */}
      <aside className="fixed left-0 top-0 hidden h-full w-64 bg-[#020617]/95 backdrop-blur-2xl lg:block z-40">
        <div className="flex h-full flex-col p-6">
          <Link to="/" className="mb-12 flex items-center gap-3 group">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-600 to-rose-400 shadow-xl shadow-rose-950/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 ring-1 ring-white/20">
              <img
                src="/src/public/saving-pig-icono2.png"
                alt="Saving Pig"
                className="h-7 w-7 object-contain drop-shadow-md"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-widest text-white leading-none">
                SAVING
              </span>
              <span className="text-sm font-bold tracking-[0.3em] text-rose-500 leading-none mt-1 opacity-80">
                PIG
              </span>
            </div>
          </Link>

          <nav className="flex-1 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path} className="relative block">
                  <motion.div
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 transition-all duration-300 group ${
                      isActive
                        ? "text-white font-bold"
                        : "text-slate-500 hover:text-slate-200"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute inset-0 bg-gradient-to-r from-rose-600/10 to-transparent rounded-2xl border-l-2 border-rose-500 shadow-[inset_4px_0_12px_-4px_rgba(244,63,94,0.2)]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                    <item.icon
                      className={`h-5 w-5 transition-colors duration-300 ${isActive ? "text-rose-500" : "group-hover:text-rose-400"}`}
                    />
                    <span className="relative z-10">{item.label}</span>
                  </motion.div>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto pt-8">
            <div className="relative group overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-4 transition-all duration-500 hover:bg-white/[0.04]">
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-3">
                Usuario
              </p>
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-full bg-gradient-to-tr from-rose-600 via-rose-400 to-orange-400 p-[1.5px] shadow-lg shadow-rose-950/20">
                  <div className="h-full w-full rounded-full bg-[#020617] flex items-center justify-center text-white text-[13px] font-black italic">
                    {initials}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-200 truncate tracking-tight">
                    {user?.user_metadata?.full_name ||
                      user?.email?.split("@")[0]}
                  </p>
                  <p className="text-[10px] text-slate-500 font-bold truncate tracking-wide">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="lg:pl-64 pb-24 lg:pb-0">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between bg-slate-950/40 px-6 backdrop-blur-xl lg:h-20">
          <h1 className="text-lg font-bold lg:text-3xl lg:tracking-tighter">
            {navItems.find((i) => i.path === location.pathname)?.label ||
              "SAVING PIG"}
          </h1>
          <div className="flex items-center gap-2 lg:gap-4">
            <NotificationCenter />
            {location.pathname === "/" && (
              <motion.button
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 0 20px rgba(244, 63, 94, 0.4)",
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => openTransactionModal()}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-600 text-white shadow-lg shadow-rose-900/40 lg:h-12 lg:w-32 lg:rounded-xl lg:gap-2 transition-all duration-200"
              >
                <Plus className="h-6 w-6" />
                <span className="hidden lg:inline font-bold">Nuevo</span>
              </motion.button>
            )}
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="p-6 max-w-7xl mx-auto"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Nav (Mobile) */}
      <nav className="fixed bottom-0 left-0 z-40 flex h-20 w-full items-center justify-around border-t border-white/5 bg-slate-950/80 backdrop-blur-3xl lg:hidden px-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${
                isActive
                  ? "text-rose-500 scale-110"
                  : "text-slate-500 hover:text-white"
              }`}
            >
              <div
                className={`p-2 rounded-xl ${isActive ? "bg-rose-500/10" : ""}`}
              >
                <item.icon className="h-6 w-6" />
              </div>
              <span className="text-[9px] font-bold leading-none uppercase tracking-widest">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Global Modals */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={closeTransactionModal}
      />

      {/* Global Toasts */}
      <ToastContainer />
    </div>
  );
};
