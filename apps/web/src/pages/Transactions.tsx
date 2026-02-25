import { useState, useMemo, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  Inbox,
  Edit2,
  RotateCcw,
  Ban,
  FileText,
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from "lucide-react";
import {
  useTransactions,
  useVoidTransaction,
  useReactivateTransaction,
  useCategories,
} from "@/hooks/useFinance";
import { useUIStore } from "@/store/useUIStore";
import { TransactionDetailModal } from "@/components/transactions/TransactionDetailModal";
import { Transaction } from "@/services/financeService";
import { getCategoryIcon } from "@/utils/categoryUtils";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/store/useToastStore";

type FilterType = "all" | "income" | "expense";
type FilterStatus = "all" | "active" | "voided";

export default function Transactions() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  // Confirm dialog state
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    transactionId: string | null;
    action: "void" | "reactivate" | null;
  }>({ isOpen: false, transactionId: null, action: null });

  const { data: transactions, isLoading } = useTransactions(500);
  const { data: categories } = useCategories();
  const { openTransactionModal } = useUIStore();
  const voidTransaction = useVoidTransaction();
  const reactivateTransaction = useReactivateTransaction();
  const toast = useToast();

  const openConfirm = (id: string, action: "void" | "reactivate") => {
    setConfirmState({ isOpen: true, transactionId: id, action });
  };

  const closeConfirm = () => {
    setConfirmState({ isOpen: false, transactionId: null, action: null });
  };

  const handleConfirm = async () => {
    const { transactionId, action } = confirmState;
    if (!transactionId || !action) return;
    closeConfirm();

    try {
      if (action === "void") {
        await voidTransaction.mutateAsync(transactionId);
        toast.warning("Transacción anulada. No contará en tus totales.");
      } else {
        await reactivateTransaction.mutateAsync(transactionId);
        toast.success("Transacción reactivada correctamente.");
      }
    } catch {
      toast.error(
        action === "void"
          ? "Error al anular la transacción."
          : "Error al reactivar la transacción.",
      );
    }
  };

  const handleViewDetails = (t: Transaction) => {
    setSelectedTransaction(t);
    setIsDetailModalOpen(true);
  };

  // Client-side filtering
  const filteredTransactions = useMemo(
    () =>
      (transactions ?? []).filter((t) => {
        const matchesSearch =
          !searchTerm ||
          t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (t.categories?.name || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        const matchesType = filterType === "all" || t.type === filterType;
        const matchesCategory =
          !filterCategory || t.category_id === filterCategory;
        const matchesStatus =
          filterStatus === "all" ||
          (filterStatus === "active"
            ? t.status !== "voided"
            : t.status === "voided");
        const txDate = t.date ? t.date.split("T")[0] : "";
        const matchesDateFrom = !filterDateFrom || txDate >= filterDateFrom;
        const matchesDateTo = !filterDateTo || txDate <= filterDateTo;

        return (
          matchesSearch &&
          matchesType &&
          matchesCategory &&
          matchesStatus &&
          matchesDateFrom &&
          matchesDateTo
        );
      }),
    [
      transactions,
      searchTerm,
      filterType,
      filterCategory,
      filterStatus,
      filterDateFrom,
      filterDateTo,
    ],
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    filterType,
    filterCategory,
    filterStatus,
    filterDateFrom,
    filterDateTo,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredTransactions.length / PAGE_SIZE),
  );
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const activeFiltersCount = [
    filterType !== "all",
    !!filterCategory,
    filterStatus !== "all",
    !!filterDateFrom,
    !!filterDateTo,
  ].filter(Boolean).length;

  const clearFilters = () => {
    setFilterType("all");
    setFilterCategory("");
    setFilterStatus("all");
    setFilterDateFrom("");
    setFilterDateTo("");
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar transacciones..."
            className="glass-input w-full !pl-14"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setFilterOpen((prev) => !prev)}
            className={`btn-secondary px-4 whitespace-nowrap relative ${filterOpen ? "ring-2 ring-rose-500/30" : ""}`}
          >
            <Filter className="h-5 w-5" />
            Filtrar
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-rose-600 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
          <button
            onClick={() => openTransactionModal()}
            className="btn-primary"
          >
            <Plus className="h-5 w-5" />
            Nuevo Registro
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {filterOpen && (
        <div className="data-card p-4 flex flex-wrap items-end gap-4">
          {/* Type */}
          <div className="flex flex-col gap-1.5 w-40">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Tipo
            </label>
            <div className="flex h-10 bg-slate-900 p-1 rounded-xl border border-white/5">
              {(["all", "expense", "income"] as FilterType[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setFilterType(v)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    filterType === v
                      ? "bg-rose-600 text-white shadow"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {v === "all"
                    ? "Todos"
                    : v === "expense"
                      ? "Gasto"
                      : "Ingreso"}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1.5 w-48">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Categoría
            </label>
            <Select
              value={filterCategory}
              onChange={setFilterCategory}
              placeholder="Todas las categorías"
              options={
                categories?.map((c: any) => ({
                  value: c.id,
                  label: c.name,
                })) ?? []
              }
            />
          </div>

          {/* Status */}
          <div className="flex flex-col gap-1.5 w-40">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Estado
            </label>
            <div className="flex h-10 bg-slate-900 p-1 rounded-xl border border-white/5">
              {(["all", "active", "voided"] as FilterStatus[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setFilterStatus(v)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    filterStatus === v
                      ? "bg-rose-600 text-white shadow"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {v === "all"
                    ? "Todos"
                    : v === "active"
                      ? "Activo"
                      : "Anulado"}
                </button>
              ))}
            </div>
          </div>

          {/* Date From */}
          <div className="flex flex-col gap-1.5 w-40">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Desde
            </label>
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="glass-input h-10 w-full text-sm [color-scheme:dark]"
              title="Fecha desde"
            />
          </div>

          {/* Date To */}
          <div className="flex flex-col gap-1.5 w-40">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Hasta
            </label>
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              min={filterDateFrom || undefined}
              className="glass-input h-10 w-full text-sm [color-scheme:dark]"
              title="Fecha hasta"
            />
          </div>

          {/* Clear button */}
          <button
            onClick={clearFilters}
            disabled={activeFiltersCount === 0}
            className="flex items-center gap-2 h-10 px-4 rounded-xl border text-xs font-bold transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20"
          >
            <X className="h-3.5 w-3.5" />
            {activeFiltersCount > 0
              ? `Limpiar (${activeFiltersCount})`
              : "Limpiar"}
          </button>
        </div>
      )}

      {/* Transactions Table */}
      <div className="data-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Detalles
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Categoría
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Fecha
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Monto
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-4">
                      <div className="h-10 bg-white/5 rounded-lg w-full"></div>
                    </td>
                  </tr>
                ))
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-16 w-16 bg-white/5 rounded-full flex items-center justify-center">
                        <Inbox className="w-8 h-8 text-slate-600" />
                      </div>
                      <p className="text-slate-500 italic">
                        {searchTerm || activeFiltersCount > 0
                          ? "No hay resultados para los filtros aplicados."
                          : "No hay transacciones registradas."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((t) => (
                  <tr
                    key={t.id}
                    className={`hover:bg-white/5 transition-colors group ${
                      t.status === "voided" ? "opacity-40 grayscale" : ""
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-10 w-10 rounded-xl flex items-center justify-center shadow-lg ${
                            t.type === "income"
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
                              : "bg-rose-500/20 text-rose-400 border border-rose-500/20"
                          }`}
                        >
                          {getCategoryIcon(t.categories?.icon, t.type)}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">
                            {t.description}
                          </p>
                          <p className="text-xs text-slate-500">
                            Cuenta Personal
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-white/5">
                        {t.categories?.name || "Sin categoría"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {t.date ? new Date(t.date).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`font-bold tabular-nums ${t.type === "income" ? "text-emerald-400" : "text-rose-400"}`}
                      >
                        {t.type === "income" ? "+" : "-"}$
                        {Math.abs(t.amount || 0).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          title="Ver Comprobante"
                          onClick={() => handleViewDetails(t)}
                          className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        >
                          <FileText className="h-4 w-4" />
                        </button>
                        <button
                          title="Editar"
                          onClick={() => openTransactionModal(t)}
                          className="p-2 text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        {t.status === "voided" ? (
                          <button
                            title="Reactivar Transacción"
                            onClick={() => openConfirm(t.id, "reactivate")}
                            className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            title="Anular Transacción"
                            onClick={() => openConfirm(t.id, "void")}
                            className="p-2 text-slate-500 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors"
                          >
                            <Ban className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {filteredTransactions.length > PAGE_SIZE && (
        <div className="data-card px-5 py-3 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Mostrando{" "}
            <span className="text-white font-bold">
              {(currentPage - 1) * PAGE_SIZE + 1}–
              {Math.min(currentPage * PAGE_SIZE, filteredTransactions.length)}
            </span>{" "}
            de{" "}
            <span className="text-white font-bold">
              {filteredTransactions.length}
            </span>
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-8 w-8 flex items-center justify-center rounded-lg bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              title="Página anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (p) =>
                    p === 1 ||
                    p === totalPages ||
                    Math.abs(p - currentPage) <= 1,
                )
                .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1)
                    acc.push("...");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, idx) =>
                  p === "..." ? (
                    <span
                      key={`ellipsis-${idx}`}
                      className="h-8 w-8 flex items-center justify-center text-slate-600 text-xs"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p as number)}
                      className={`h-8 w-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
                        currentPage === p
                          ? "bg-rose-600 text-white"
                          : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {p}
                    </button>
                  ),
                )}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="h-8 w-8 flex items-center justify-center rounded-lg bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              title="Página siguiente"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <TransactionDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        transaction={selectedTransaction}
      />

      {/* Custom Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        title={
          confirmState.action === "void"
            ? "¿Anular transacción?"
            : "¿Reactivar transacción?"
        }
        message={
          confirmState.action === "void"
            ? "Esta transacción se mantendrá en el historial pero no contará en tus totales ni balances."
            : "La transacción volverá a ser activa y se incluirá nuevamente en tus totales y balances."
        }
        confirmLabel={
          confirmState.action === "void" ? "Sí, anular" : "Sí, reactivar"
        }
        cancelLabel="Cancelar"
        variant={confirmState.action === "void" ? "warning" : "success"}
        onConfirm={handleConfirm}
        onCancel={closeConfirm}
      />
    </div>
  );
}
