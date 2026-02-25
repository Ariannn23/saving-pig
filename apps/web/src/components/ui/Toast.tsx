import { useToastStore } from "@/store/useToastStore";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";

const ICONS = {
  success: {
    Icon: CheckCircle2,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
  },
  error: {
    Icon: XCircle,
    color: "text-rose-400",
    bg: "bg-rose-500/10 border-rose-500/20",
  },
  warning: {
    Icon: AlertTriangle,
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
  },
  info: {
    Icon: Info,
    color: "text-indigo-400",
    bg: "bg-indigo-500/10 border-indigo-500/20",
  },
};

export const ToastContainer = () => {
  const { toasts, remove } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-[100] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => {
        const { Icon, color, bg } = ICONS[toast.type];
        return (
          <div
            key={toast.id}
            className={`flex items-start gap-3 px-4 py-3.5 rounded-2xl border backdrop-blur-2xl shadow-2xl shadow-black/30 pointer-events-auto min-w-[260px] max-w-sm animate-in slide-in-from-right-4 fade-in duration-300 ${bg}`}
          >
            <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${color}`} />
            <p className="text-sm font-medium text-white flex-1 leading-snug">
              {toast.message}
            </p>
            <button
              onClick={() => remove(toast.id)}
              className="text-slate-500 hover:text-white transition-colors shrink-0"
              title="Cerrar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
