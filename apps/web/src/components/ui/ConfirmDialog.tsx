import { Ban, CheckCircle2, AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "success";
  onConfirm: () => void;
  onCancel: () => void;
}

const VARIANT_CONFIG = {
  danger: {
    icon: Ban,
    iconBg: "bg-rose-500/20",
    iconColor: "text-rose-400",
    btnClass: "bg-rose-600 hover:bg-rose-500 shadow-rose-900/40",
  },
  warning: {
    icon: AlertTriangle,
    iconBg: "bg-amber-500/20",
    iconColor: "text-amber-400",
    btnClass: "bg-amber-600 hover:bg-amber-500 shadow-amber-900/40",
  },
  success: {
    icon: CheckCircle2,
    iconBg: "bg-emerald-500/20",
    iconColor: "text-emerald-400",
    btnClass: "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/40",
  },
};

export const ConfirmDialog = ({
  isOpen,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "danger",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  if (!isOpen) return null;

  const { icon: Icon, iconBg, iconColor, btnClass } = VARIANT_CONFIG[variant];

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onCancel}
    >
      <div
        className="glass-card w-full max-w-sm p-6 shadow-2xl ring-1 ring-white/10 space-y-5 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div
            className={`h-12 w-12 rounded-2xl ${iconBg} flex items-center justify-center shrink-0`}
          >
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-colors"
            title="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-1">
          <h3 className="text-base font-bold">{title}</h3>
          <p className="text-sm text-slate-400 leading-relaxed">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 btn-secondary py-2.5 text-sm"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 text-sm font-bold rounded-xl text-white transition-all duration-200 shadow-lg active:scale-95 flex items-center justify-center ${btnClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
