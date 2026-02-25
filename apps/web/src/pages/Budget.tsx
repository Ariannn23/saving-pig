import { useState } from "react";
import {
  Wallet,
  AlertTriangle,
  CheckCircle2,
  Edit2,
  Check,
  X,
  TrendingDown,
  Loader2,
} from "lucide-react";
import {
  useCategories,
  useUpdateCategoryLimit,
  useMonthlySummary,
} from "@/hooks/useFinance";
import { getCategoryIcon } from "@/utils/categoryUtils";
import { useToast } from "@/store/useToastStore";

export default function Budget() {
  const { data: categories, isLoading } = useCategories();
  const { data: monthlySummary } = useMonthlySummary();
  const updateLimit = useUpdateCategoryLimit();
  const toast = useToast();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  // Only expense categories
  const expenseCategories = (categories ?? []).filter(
    (c: any) => c.type === "expense" || !c.type,
  );

  // Get monthly spending per category from summary (if available) or just show limit
  // We'll compute from the categories data if the summary has it
  const handleStartEdit = (cat: any) => {
    setEditingId(cat.id);
    setEditValue(cat.limit_amount ? String(cat.limit_amount) : "");
  };

  const handleSave = async (catId: string) => {
    const val = editValue.trim();
    const parsed = val === "" ? null : parseFloat(val);

    if (val !== "" && (isNaN(parsed!) || parsed! < 0)) {
      toast.warning(
        "Ingresa un límite válido mayor a 0, o déjalo vacío para sin límite.",
      );
      return;
    }

    try {
      await updateLimit.mutateAsync({ id: catId, limit: parsed });
      toast.success(
        parsed === null
          ? "Límite eliminado correctamente."
          : `Límite de $${parsed!.toLocaleString()} guardado.`,
      );
      setEditingId(null);
    } catch {
      toast.error("Error al guardar el límite.");
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValue("");
  };

  const totalBudget = expenseCategories
    .filter((c: any) => c.limit_amount)
    .reduce((sum: number, c: any) => sum + Number(c.limit_amount), 0);

  const totalSpent = monthlySummary?.expenses ?? 0;
  const overallProgress =
    totalBudget > 0 ? Math.min(100, (totalSpent / totalBudget) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Gasto Mensual */}
        <div className="data-card p-5 flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-rose-500/20 flex items-center justify-center shrink-0">
            <TrendingDown className="h-5 w-5 text-rose-400" />
          </div>
          <div className="min-w-0">
            <p className="text-slate-400 text-xs">Gasto Mensual</p>
            <h3 className="text-xl font-bold tabular-nums truncate">
              ${totalSpent.toLocaleString()}
            </h3>
            {totalBudget > 0 && (
              <p className="text-[11px] text-slate-500 mt-0.5">
                Disponible:{" "}
                <span
                  className={
                    totalBudget - totalSpent >= 0
                      ? "text-emerald-400"
                      : "text-rose-400"
                  }
                >
                  ${Math.max(0, totalBudget - totalSpent).toLocaleString()}
                </span>
              </p>
            )}
          </div>
        </div>

        {/* Presupuesto Total */}
        <div className="data-card p-5 flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0">
            <Wallet className="h-5 w-5 text-indigo-400" />
          </div>
          <div className="min-w-0">
            <p className="text-slate-400 text-xs">Presupuesto Total</p>
            <h3 className="text-xl font-bold tabular-nums">
              ${totalBudget.toLocaleString()}
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {expenseCategories.filter((c: any) => c.limit_amount).length}{" "}
              categorías con límite
            </p>
          </div>
        </div>

        {/* Uso General — total + desglose por categoría */}
        <div className="data-card p-5 flex flex-col gap-3 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <p className="text-slate-400 text-xs font-medium">Uso General</p>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                overallProgress >= 90
                  ? "bg-rose-500/15 text-rose-400"
                  : overallProgress >= 70
                    ? "bg-amber-500/15 text-amber-400"
                    : "bg-emerald-500/15 text-emerald-400"
              }`}
            >
              {Math.round(overallProgress)}%
            </span>
          </div>

          {/* Barra global */}
          <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                overallProgress >= 90
                  ? "bg-rose-500"
                  : overallProgress >= 70
                    ? "bg-amber-500"
                    : "bg-emerald-500"
              }`}
              style={{ width: `${overallProgress}%` }}
            />
          </div>

          {/* Desglose por categoría */}
          {totalBudget > 0 ? (
            <div className="space-y-1.5 mt-1">
              {expenseCategories
                .filter((c: any) => c.limit_amount)
                .map((c: any) => {
                  const pct = Math.round(
                    (Number(c.limit_amount) / totalBudget) * 100,
                  );
                  return (
                    <div key={c.id} className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400 truncate flex-1 min-w-0">
                        {c.name}
                      </span>
                      <span className="text-[11px] text-slate-500 tabular-nums shrink-0">
                        ${Number(c.limit_amount).toLocaleString()}
                      </span>
                      <span className="text-[11px] font-bold text-slate-300 w-8 text-right shrink-0">
                        {pct}%
                      </span>
                    </div>
                  );
                })}
            </div>
          ) : (
            <p className="text-[11px] text-slate-600 italic">
              Asigna límites a tus categorías para ver el desglose.
            </p>
          )}
        </div>
      </div>

      {/* Category Budget List */}
      <div className="data-card overflow-hidden">
        <div className="p-5 border-b border-white/5">
          <h3 className="font-bold text-base">Límites por Categoría</h3>
          <p className="text-sm text-slate-500 mt-0.5">
            Haz clic en editar para establecer un límite mensual de gasto por
            categoría.
          </p>
        </div>

        {isLoading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="h-8 w-8 text-rose-500 animate-spin" />
          </div>
        ) : (
          <ul className="divide-y divide-white/5">
            {expenseCategories.map((cat: any) => {
              const isEditing = editingId === cat.id;
              const limit = cat.limit_amount ? Number(cat.limit_amount) : null;
              const hasLimit = limit !== null;

              // We show a placeholder spend of 0 since we don't have per-category spend here
              // The real check happens via checkBudgetAlerts
              const isOver = false; // Real validation is server-side via alerts

              return (
                <li
                  key={cat.id}
                  className="flex items-center gap-2 sm:gap-4 px-3 sm:px-5 py-3 sm:py-4 hover:bg-white/3 transition-colors group"
                >
                  {/* Icon */}
                  <div
                    className={`h-9 w-9 sm:h-11 sm:w-11 rounded-xl flex items-center justify-center shrink-0 ${
                      hasLimit
                        ? "bg-rose-500/15 text-rose-400 border border-rose-500/20"
                        : "bg-slate-800 text-slate-500"
                    }`}
                  >
                    {getCategoryIcon(cat.icon, "expense", 16)}
                  </div>

                  {/* Name & status */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{cat.name}</p>
                    <p className="text-xs text-slate-500">
                      {hasLimit ? (
                        <span className="flex items-center gap-1">
                          {isOver ? (
                            <AlertTriangle className="h-3 w-3 text-rose-500" />
                          ) : (
                            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                          )}
                          Límite: ${limit!.toLocaleString()} / mes
                        </span>
                      ) : (
                        "Sin límite configurado"
                      )}
                    </p>
                  </div>

                  {/* Edit area */}
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold pointer-events-none">
                          $
                        </span>
                        <input
                          type="text"
                          inputMode="decimal"
                          className="glass-input !pl-7 w-24 sm:w-32 text-sm py-2"
                          placeholder="Sin límite"
                          value={editValue}
                          onChange={(e) => {
                            const v = e.target.value;
                            if (/^(\d+\.?\d{0,2})?$/.test(v)) setEditValue(v);
                          }}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSave(cat.id);
                            if (e.key === "Escape") handleCancel();
                          }}
                        />
                      </div>
                      <button
                        onClick={() => handleSave(cat.id)}
                        className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
                        title="Guardar"
                        disabled={updateLimit.isPending}
                      >
                        {updateLimit.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={handleCancel}
                        className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg transition-colors"
                        title="Cancelar"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleStartEdit(cat)}
                      className="p-2 text-slate-600 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      title="Editar límite"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Info box */}
      <div className="data-card p-5 bg-amber-500/5 border-amber-500/20 flex gap-4 items-start">
        <div className="h-10 w-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
          <AlertTriangle className="h-5 w-5 text-amber-400" />
        </div>
        <div className="space-y-0.5">
          <h4 className="font-bold text-amber-400 text-sm">
            ¿Cómo funcionan los límites?
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Cada vez que registres un gasto, el sistema verifica automáticamente
            si superaste el límite mensual de esa categoría. Si lo superas,
            recibirás una notificación en la campana de alertas.
          </p>
        </div>
      </div>
    </div>
  );
}
