import {
  X,
  Calendar,
  Tag,
  CreditCard,
  ExternalLink,
  ArrowUpCircle,
  ArrowDownCircle,
  Utensils,
  Car,
  Activity,
  Gamepad2,
  Zap,
  ShoppingBag,
  Home,
  DollarSign,
  Folder,
} from "lucide-react";
import { Transaction } from "@/services/financeService";
import { storageService } from "@/services/storageService";
import { useEffect, useState } from "react";

interface TransactionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

export const TransactionDetailModal = ({
  isOpen,
  onClose,
  transaction,
}: TransactionDetailModalProps) => {
  if (!isOpen || !transaction) return null;

  const [fullImageUrl, setFullImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadUrl = async () => {
      if (transaction?.evidence_url) {
        // Si ya es una URL completa, usarla
        if (transaction.evidence_url.startsWith("http")) {
          setFullImageUrl(transaction.evidence_url);
        } else {
          // Si es un path relativo de Supabase, obtener la URL pública
          const url = await storageService.getPublicUrl(
            transaction.evidence_url,
          );
          setFullImageUrl(url);
        }
      } else {
        setFullImageUrl(null);
      }
    };
    loadUrl();
  }, [transaction]);

  const getCategoryIcon = (iconName: string | undefined, type: string) => {
    const icons: Record<string, any> = {
      Utensils,
      Car,
      Activity,
      Gamepad2,
      Zap,
      ShoppingBag,
      Home,
      DollarSign,
      Folder,
    };
    const Icon =
      (iconName && icons[iconName]) ||
      (type === "income" ? ArrowUpCircle : ArrowDownCircle);
    return <Icon size={24} />;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="glass-card w-full max-w-lg relative overflow-hidden group">
        {/* Decorative Background */}
        <div
          className={`absolute -top-24 -right-24 h-64 w-64 rounded-full blur-3xl opacity-20 ${transaction.type === "income" ? "bg-emerald-500" : "bg-rose-500"}`}
        />

        <div className="p-8 relative z-10">
          <button
            onClick={onClose}
            className="absolute right-6 top-6 p-2 rounded-xl text-slate-500 hover:bg-white/10 hover:text-white transition-all"
            title="Cerrar"
          >
            <X size={20} />
          </button>

          <div className="space-y-8">
            {/* Header Detail */}
            <div className="flex items-center gap-6">
              <div
                className={`h-16 w-16 rounded-2xl flex items-center justify-center shadow-xl ${
                  transaction.type === "income"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
                    : "bg-rose-500/20 text-rose-400 border border-rose-500/20"
                }`}
              >
                {getCategoryIcon(
                  transaction.categories?.icon,
                  transaction.type,
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight">
                  {transaction.description}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-widest ${
                      transaction.type === "income"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-rose-500/10 text-rose-400"
                    }`}
                  >
                    {transaction.type === "income" ? "Ingreso" : "Gasto"}
                  </span>
                  <span className="text-slate-500">•</span>
                  <p className="text-slate-400 text-sm font-medium">
                    Cuenta Personal
                  </p>
                </div>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-6 p-6 rounded-2xl bg-white/[0.03] border border-white/5">
              <div className="space-y-1">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2">
                  <Calendar size={12} className="text-rose-500" />
                  Fecha
                </p>
                <p className="text-sm font-semibold capitalize text-slate-200">
                  {formatDate(transaction.date)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2">
                  <Tag size={12} className="text-rose-500" />
                  Categoría
                </p>
                <p className="text-sm font-semibold text-slate-200">
                  {transaction.categories?.name || "Sin categoría"}
                </p>
              </div>
              <div className="space-y-1 col-span-2">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2">
                  Monto Total
                </p>
                <p
                  className={`text-4xl font-black tabular-nums tracking-tighter ${
                    transaction.type === "income"
                      ? "text-emerald-400"
                      : "text-rose-400"
                  }`}
                >
                  {transaction.type === "income" ? "+" : "-"}$
                  {Math.abs(transaction.amount).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>

            {/* Evidence/Proof Section */}
            {fullImageUrl ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">
                    Comprobante
                  </p>
                  <a
                    href={fullImageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-rose-500 font-bold hover:underline flex items-center gap-1 uppercase tracking-widest"
                  >
                    Abrir original
                    <ExternalLink size={12} />
                  </a>
                </div>
                <div className="rounded-2xl overflow-hidden border border-white/10 aspect-video bg-slate-900 flex items-center justify-center relative group/img">
                  <img
                    src={fullImageUrl}
                    alt="Comprobante"
                    className="w-full h-full object-contain transition-transform duration-700 group-hover/img:scale-105"
                  />
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-xs font-bold text-white uppercase tracking-widest">
                      Previsualización
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center gap-2">
                <CreditCard className="text-slate-700 w-8 h-8" />
                <p className="text-xs text-slate-500 italic">
                  No se adjuntó comprobante
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
