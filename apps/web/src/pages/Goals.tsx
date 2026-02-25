import { useState, useEffect } from "react";
import {
  Target,
  Plus,
  Sparkles,
  Loader2,
  Trash2,
  Info,
  CheckCircle2,
} from "lucide-react";
import { useAIGoalPrediction } from "@/hooks/useAI";
import {
  useMonthlySummary,
  useGoals,
  useCreateGoal,
  useDeleteGoal,
  useCompleteGoal,
  useBalanceSummary,
} from "@/hooks/useFinance";
import { motion, AnimatePresence } from "framer-motion";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/store/useToastStore";
import { financeService } from "@/services/financeService";
import { useQueryClient } from "@tanstack/react-query";

const GoalAIIcon = ({
  goal,
  avgMonthlySavings,
}: {
  goal: any;
  avgMonthlySavings: number;
}) => {
  const { data: prediction, isLoading } = useAIGoalPrediction({
    name: goal.name,
    target: goal.target,
    current: goal.current,
    avgMonthlySavings: avgMonthlySavings,
  });

  if (isLoading)
    return <div className="h-4 w-20 bg-white/5 animate-pulse rounded-full" />;
  if (!prediction) return null;

  return (
    <div className="flex items-center gap-1 text-[10px] font-bold text-rose-400 uppercase">
      <Sparkles className="h-3 w-3" />
      <span>~{prediction.months} meses</span>
    </div>
  );
};

export default function Goals() {
  const { data: monthlySummary } = useMonthlySummary();
  const { data: balanceSummary } = useBalanceSummary();
  const { data: goals, isLoading: isGoalsLoading } = useGoals();
  const createGoal = useCreateGoal();
  const deleteGoal = useDeleteGoal();
  const completeGoal = useCompleteGoal();
  const toast = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newTarget, setNewTarget] = useState("");
  const [newColor, setNewColor] = useState("#F43F5E");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [completeConfirm, setCompleteConfirm] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // getBalanceSummary returns a plain number (total balance)
  const totalBalance = typeof balanceSummary === "number" ? balanceSummary : 0;

  // Sum of target_amount for already-completed goals
  // Completed goals are simply archived — active goals use the full totalBalance
  // Defensive: if completed_at column doesn't exist yet, treat all goals as active
  const hasCompletedGoals = (goals ?? []).some(
    (g: any) => g?.completed_at != null,
  );

  // Active goals share the full balance — completed goals are just archived
  const availableBalance = Math.max(0, totalBalance);

  // Check goal completion alerts whenever goals or balance changes
  useEffect(() => {
    if (!goals || totalBalance === 0) return;
    financeService
      .checkGoalAlerts()
      .then(() => queryClient.invalidateQueries({ queryKey: ["alerts"] }))
      .catch(() => {}); // silent fail
  }, [goals, totalBalance]);

  const avgMonthlySavings =
    (monthlySummary?.income ?? 0) - (monthlySummary?.expenses ?? 0);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newTarget) return;

    await createGoal.mutateAsync({
      name: newName,
      target_amount: parseFloat(newTarget),
      current_amount: 0,
      color: newColor,
    });

    toast.success(`¡Meta "${newName}" creada!`);
    setIsModalOpen(false);
    setNewName("");
    setNewTarget("");
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteGoal.mutateAsync(deleteConfirm);
      toast.success("Meta eliminada.");
    } catch {
      toast.error("Error al eliminar la meta.");
    }
    setDeleteConfirm(null);
  };

  const handleComplete = async () => {
    if (!completeConfirm) return;
    try {
      await completeGoal.mutateAsync(completeConfirm);
      toast.success("¡Meta finalizada! El monto queda reservado.");
    } catch {
      toast.error("Error al finalizar la meta.");
    }
    setCompleteConfirm(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Mis Metas</h2>
          <p className="text-slate-500 text-sm">
            Balance disponible:{" "}
            <span className="text-emerald-400 font-bold">
              ${availableBalance.toLocaleString()}
            </span>
            {hasCompletedGoals && (
              <span className="text-slate-600">
                {" "}
                · Tienes metas completadas archivadas
              </span>
            )}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setIsModalOpen(true)}
          className="btn-primary"
        >
          <Plus className="h-5 w-5" />
          Nueva Meta
        </motion.button>
      </div>

      {/* Info banner */}
      {totalBalance > 0 && (goals?.length ?? 0) > 0 && !hasCompletedGoals && (
        <div className="data-card p-4 bg-indigo-600/10 border-indigo-500/20 flex items-center gap-3">
          <Info className="h-5 w-5 text-indigo-400 shrink-0" />
          <p className="text-sm text-slate-400">
            El progreso de tus metas refleja tu{" "}
            <strong className="text-white">balance total acumulado</strong>.
            Cuando completes una meta, su monto queda reservado y{" "}
            <strong className="text-emerald-400">
              las demás metas avanzan por separado
            </strong>
            .
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isGoalsLoading ? (
          <div className="col-span-full py-20 text-center space-y-4">
            <Loader2 className="w-10 h-10 text-rose-500 animate-spin mx-auto" />
            <p className="text-slate-500 italic font-medium">
              Cargando tus sueños financieros...
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {goals?.map((goal: any, index: number) => {
              const isFinalized = !!goal.completed_at;

              // Completed goals always show 100%
              // Active goals use the available balance (totalBalance minus completed goals)
              const current = isFinalized
                ? goal.target_amount
                : Math.min(availableBalance, goal.target_amount);
              const progress =
                goal.target_amount > 0
                  ? (current / goal.target_amount) * 100
                  : 0;
              const isReadyToComplete =
                !isFinalized && availableBalance >= goal.target_amount;

              return (
                <motion.div
                  key={goal.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.08 }}
                  whileHover={{ y: -4 }}
                  className={`data-card p-6 flex flex-col gap-6 relative overflow-hidden group transition-all duration-300 ${
                    isFinalized
                      ? "opacity-70 hover:opacity-100 ring-1 ring-emerald-500/20"
                      : "hover:ring-2 hover:ring-white/10"
                  }`}
                >
                  {/* Completed badge */}
                  {isFinalized && (
                    <motion.div
                      initial={{ x: 50 }}
                      animate={{ x: 0 }}
                      className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl shadow-lg z-10"
                    >
                      ✓ COMPLETADO
                    </motion.div>
                  )}

                  {/* Ready-to-complete indicator (before user clicks) */}
                  {isReadyToComplete && (
                    <motion.div
                      initial={{ x: 50 }}
                      animate={{ x: 0 }}
                      className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl shadow-lg z-10"
                    >
                      ¡Lista!
                    </motion.div>
                  )}

                  <div className="flex items-start justify-between">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="h-14 w-14 rounded-2xl flex items-center justify-center shadow-inner ring-1 ring-white/10"
                      style={{
                        backgroundColor: `${goal.color}20`,
                        color: goal.color,
                      }}
                    >
                      <Target className="w-8 h-8" />
                    </motion.div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      {isReadyToComplete && (
                        <button
                          onClick={() => setCompleteConfirm(goal.id)}
                          className="h-9 px-3 rounded-full bg-emerald-500/10 flex items-center gap-1.5 text-emerald-400 hover:bg-emerald-500/20 transition-all text-xs font-bold"
                          title="Dar por finalizada esta meta"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Completar
                        </button>
                      )}
                      {!isFinalized && (
                        <button
                          onClick={() => setDeleteConfirm(goal.id)}
                          className="h-9 w-9 rounded-full bg-white/5 flex items-center justify-center text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                          title="Eliminar meta"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-bold text-lg">{goal.name}</h3>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400 font-medium">
                        $
                        {Math.min(
                          isFinalized ? goal.target_amount : availableBalance,
                          goal.target_amount,
                        ).toLocaleString("en-US", { maximumFractionDigits: 2 })}
                      </span>
                      <span className="text-slate-200 font-bold">
                        ${Number(goal.target_amount).toLocaleString()}
                      </span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
                      <motion.div
                        className="h-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, progress)}%` }}
                        transition={{
                          duration: 1,
                          ease: "easeOut",
                          delay: 0.2 + index * 0.08,
                        }}
                        style={{
                          backgroundColor: isFinalized ? "#10B981" : goal.color,
                          boxShadow: `0 0 10px ${isFinalized ? "#10B981" : goal.color}50`,
                        }}
                      />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <p className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">
                        {Math.round(progress)}% Logrado
                      </p>
                      {!isFinalized && (
                        <GoalAIIcon
                          goal={{
                            name: goal.name,
                            target: goal.target_amount,
                            current: current,
                          }}
                          avgMonthlySavings={
                            avgMonthlySavings > 0 ? avgMonthlySavings : 100
                          }
                        />
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}

        {/* Add Card */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: (goals?.length || 0) * 0.08 }}
          whileHover={{ scale: 1.02, borderColor: "#f43f5e" }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsModalOpen(true)}
          className="data-card p-6 border-dashed border-2 border-white/10 hover:bg-rose-500/5 transition-all flex flex-col items-center justify-center gap-4 text-slate-500 hover:text-rose-400 group h-full min-h-[220px]"
        >
          <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center border-2 border-dashed border-white/10 group-hover:border-rose-500/30">
            <Plus className="h-8 w-8" />
          </div>
          <span className="font-bold italic">Añadir nueva meta</span>
        </motion.button>
      </div>

      {/* Modal Nueva Meta */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-card bg-slate-950 w-full max-w-sm p-8 space-y-6 relative z-10"
            >
              <h2 className="text-2xl font-black tracking-tight italic">
                Nueva <span className="text-rose-500">Meta</span>
              </h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="glass-input w-full text-sm"
                    placeholder="Ej: Viaje a la playa"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                    Objetivo ($)
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={newTarget}
                    onChange={(e) => setNewTarget(e.target.value)}
                    className="glass-input w-full text-sm"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                    Color Identificador
                  </label>
                  <div className="flex gap-2 p-1">
                    {[
                      "#F43F5E",
                      "#10B981",
                      "#3B82F6",
                      "#8B5CF6",
                      "#F59E0B",
                    ].map((color) => (
                      <motion.button
                        key={color}
                        type="button"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setNewColor(color)}
                        className={`h-8 w-8 rounded-lg transition-transform ${newColor === color ? "scale-110 ring-2 ring-white/50 shadow-lg" : "opacity-50 hover:opacity-100"}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 btn-secondary text-xs"
                  >
                    Cancelar
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 btn-primary text-xs"
                    disabled={createGoal.isPending}
                  >
                    {createGoal.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                    ) : (
                      "Crear Meta"
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        title="¿Eliminar meta?"
        message="Esta acción es permanente. La meta y su configuración se eliminarán definitivamente."
        confirmLabel="Sí, eliminar"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
      />

      {/* Complete Confirm */}
      <ConfirmDialog
        isOpen={!!completeConfirm}
        title="¿Dar por finalizada esta meta?"
        message="Al completarla, su monto quedará reservado y las demás metas calcularán su progreso con el balance restante. Esta acción no se puede deshacer."
        confirmLabel="Sí, completar"
        cancelLabel="Cancelar"
        variant="success"
        onConfirm={handleComplete}
        onCancel={() => setCompleteConfirm(null)}
      />

      {/* Mini Tips Section */}
      <div className="data-card p-6 bg-indigo-600/10 border-indigo-500/20 flex gap-4 items-center">
        <div className="h-12 w-12 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-900/40">
          <Target className="text-white h-6 w-6" />
        </div>
        <div>
          <h4 className="font-bold text-indigo-400">Tip de Ahorro</h4>
          <p className="text-sm text-slate-400">
            Automatiza tus transferencias a tus metas el día que recibes tu
            salario para asegurar tu crecimiento.
          </p>
        </div>
      </div>
    </div>
  );
}
