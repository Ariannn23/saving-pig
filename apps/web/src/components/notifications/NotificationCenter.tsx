import { useState, useRef, useEffect } from "react";
import {
  Bell,
  Check,
  Info,
  AlertTriangle,
  CheckCircle2,
  X,
  Sparkles,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useAlerts,
  useMarkAlertAsRead,
  useDeleteAlert,
} from "@/hooks/useFinance";

const TYPE_CONFIG = {
  warning: {
    icon: <AlertTriangle className="h-4 w-4" />,
    iconBg: "bg-amber-500/20",
    iconColor: "text-amber-400",
    border: "border-l-amber-500",
    bg: "bg-amber-950/30",
    badge: "bg-amber-500",
    label: "Alerta",
  },
  success: {
    icon: <CheckCircle2 className="h-4 w-4" />,
    iconBg: "bg-emerald-500/20",
    iconColor: "text-emerald-400",
    border: "border-l-emerald-500",
    bg: "bg-emerald-950/30",
    badge: "bg-emerald-500",
    label: "Logro",
  },
  info: {
    icon: <Info className="h-4 w-4" />,
    iconBg: "bg-indigo-500/20",
    iconColor: "text-indigo-400",
    border: "border-l-indigo-500",
    bg: "bg-indigo-950/30",
    badge: "bg-indigo-500",
    label: "Info",
  },
} as const;

type AlertType = keyof typeof TYPE_CONFIG;

export const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: alerts, isLoading } = useAlerts();
  const markAsRead = useMarkAlertAsRead();
  const deleteAlert = useDeleteAlert();
  const panelRef = useRef<HTMLDivElement>(null);

  const unreadCount = alerts?.filter((a: any) => !a.is_read).length || 0;

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  const cfg = (type: string) =>
    TYPE_CONFIG[(type as AlertType) ?? "info"] ?? TYPE_CONFIG.info;

  const markAll = () =>
    alerts
      ?.filter((a: any) => !a.is_read)
      .forEach((a: any) => markAsRead.mutate(a.id));

  const deleteAll = () => alerts?.forEach((a: any) => deleteAlert.mutate(a.id));

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="relative p-2 rounded-xl hover:bg-white/5 transition-colors group"
        aria-label="Notificaciones"
      >
        <Bell className="h-6 w-6 text-slate-400 group-hover:text-white transition-colors" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-black text-white border-2 border-[#080b14]"
            >
              {unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="fixed sm:absolute inset-x-2 sm:inset-auto right-0 sm:right-0 top-16 sm:top-full sm:mt-3 w-auto sm:w-96 z-[9999] rounded-2xl overflow-hidden shadow-2xl shadow-black/70"
            style={{ backgroundColor: "#0c0f1a" }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4 border-b border-white/5"
              style={{ backgroundColor: "rgba(255,255,255,0.02)" }}
            >
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-rose-600/20 flex items-center justify-center">
                  <Bell className="h-4 w-4 text-rose-400" />
                </div>
                <div>
                  <h3 className="text-sm font-black tracking-widest uppercase text-white leading-none">
                    Notificaciones
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {unreadCount > 0 ? `${unreadCount} sin leer` : "Todo leído"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={markAll}
                    title="Marcar todo como leído"
                    className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-emerald-400 hover:bg-emerald-500/10 transition-colors flex items-center gap-1"
                  >
                    <Check className="h-3 w-3" />
                    Todo
                  </button>
                )}
                {alerts && alerts.length > 0 && (
                  <button
                    onClick={deleteAll}
                    title="Eliminar todas"
                    className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-slate-500 hover:bg-rose-500/10 hover:text-rose-400 transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="h-3 w-3" />
                    Limpiar
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  title="Cerrar"
                  className="p-1.5 rounded-lg text-slate-600 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Body — custom thin scrollbar */}
            <div
              className="max-h-[420px] overflow-y-auto"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "rgba(255,255,255,0.08) transparent",
              }}
            >
              {isLoading ? (
                <div className="p-10 flex flex-col items-center gap-3">
                  <div className="w-7 h-7 border-2 border-rose-500/20 border-t-rose-500 rounded-full animate-spin" />
                  <p className="text-xs text-slate-500">Cargando...</p>
                </div>
              ) : !alerts || alerts.length === 0 ? (
                <div className="p-12 flex flex-col items-center gap-4 text-center">
                  <div className="h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center">
                    <Sparkles className="h-7 w-7 text-slate-700" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-400">
                      Todo tranquilo por aquí
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Sin notificaciones nuevas
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3 space-y-2">
                  <AnimatePresence initial={false}>
                    {alerts.map((alert: any) => {
                      const c = cfg(alert.type);
                      const isRead = !!alert.is_read;
                      return (
                        <motion.div
                          key={alert.id}
                          layout
                          initial={{ opacity: 0, x: 12 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{
                            opacity: 0,
                            x: -12,
                            height: 0,
                            marginBottom: 0,
                          }}
                          transition={{ duration: 0.2 }}
                          className={`group rounded-xl border-l-4 border border-white/5 p-3.5 transition-all ${c.border} ${
                            isRead ? "opacity-50" : c.bg
                          }`}
                        >
                          {/* Main row: icon | content | actions */}
                          <div className="flex gap-3 items-start">
                            {/* Type icon */}
                            <div
                              className={`h-8 w-8 rounded-lg ${c.iconBg} ${c.iconColor} flex items-center justify-center shrink-0 mt-0.5`}
                            >
                              {c.icon}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full text-white ${c.badge}`}
                                >
                                  {c.label}
                                </span>
                                {!isRead && (
                                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                                )}
                              </div>
                              <p
                                className={`text-sm font-bold leading-snug ${
                                  isRead ? "text-slate-500" : "text-white"
                                }`}
                              >
                                {alert.title}
                              </p>
                              <p className="text-xs text-slate-400 leading-relaxed">
                                {alert.message}
                              </p>
                              <p className="text-[10px] text-slate-600 font-semibold uppercase tracking-wider">
                                {new Date(alert.created_at).toLocaleDateString(
                                  "es",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  },
                                )}
                              </p>
                            </div>

                            {/* Action buttons — stacked, appear on hover */}
                            <div className="flex flex-col gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              {!isRead && (
                                <button
                                  onClick={() => markAsRead.mutate(alert.id)}
                                  title="Marcar como leída"
                                  className="h-7 w-7 rounded-lg border border-white/10 text-slate-600 flex items-center justify-center hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                </button>
                              )}
                              <button
                                onClick={() => deleteAlert.mutate(alert.id)}
                                title="Eliminar"
                                className="h-7 w-7 rounded-lg border border-white/10 text-slate-600 flex items-center justify-center hover:bg-rose-500/20 hover:text-rose-400 hover:border-rose-500/30 transition-all"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer */}
            {alerts && alerts.length > 0 && (
              <div
                className="px-5 py-3 border-t border-white/5 text-center"
                style={{ backgroundColor: "rgba(255,255,255,0.01)" }}
              >
                <p className="text-[10px] text-slate-600">
                  {alerts.length} alerta{alerts.length !== 1 ? "s" : ""} en
                  total
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
