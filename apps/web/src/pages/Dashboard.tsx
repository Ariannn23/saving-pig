import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Target,
  Inbox,
  Sparkles,
  Loader2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  useTransactions,
  useBalanceSummary,
  useMonthlySummary,
  useWeeklyStats,
  useGoalsSummary,
} from "@/hooks/useFinance";
import { useAIAdvice } from "@/hooks/useAI";
import { getCategoryIcon } from "@/utils/categoryUtils";

/* ─── Skeleton helpers ─────────────────────────────────────────── */
const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse rounded-xl bg-white/5 ${className}`} />
);

const KpiCardSkeleton = () => (
  <div className="data-card p-6 flex flex-col gap-4">
    <div className="flex items-center justify-between">
      <Skeleton className="h-12 w-12 rounded-xl" />
      <Skeleton className="h-6 w-14 rounded-full" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-7 w-32" />
    </div>
  </div>
);

/* ─── KPI Card ─────────────────────────────────────────────────── */
const KpiCard = ({
  title,
  amount,
  icon: Icon,
  color,
  trend,
}: {
  title: string;
  amount: string;
  icon: any;
  color: string;
  trend?: string;
}) => (
  <div className="data-card p-6 flex flex-col gap-4 group hover:ring-2 hover:ring-white/10 transition-all duration-200">
    <div className="flex items-center justify-between">
      <div
        className={`h-12 w-12 rounded-xl ${color} flex items-center justify-center text-white shadow-lg`}
      >
        <Icon className="h-6 w-6" />
      </div>
      {trend && (
        <span
          className={`text-xs font-bold px-2 py-1 rounded-full ${trend.startsWith("+") ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}
        >
          {trend}
        </span>
      )}
    </div>
    <div>
      <p className="text-slate-400 text-sm font-medium">{title}</p>
      <h3 className="text-2xl font-bold mt-1 tabular-nums tracking-tight">
        {amount}
      </h3>
    </div>
  </div>
);

export const Dashboard = () => {
  const { data: totalBalance, isLoading: isBalanceLoading } =
    useBalanceSummary();
  const { data: monthlySummary, isLoading: isMonthlyLoading } =
    useMonthlySummary();
  const { data: transactions, isLoading: isTransactionsLoading } =
    useTransactions(5);
  const { data: weeklyStats } = useWeeklyStats();
  const { data: goalsSummary, isLoading: isGoalsLoading } = useGoalsSummary();

  const isKpiLoading = isBalanceLoading || isMonthlyLoading || isGoalsLoading;

  const { data: aiAdvice, isLoading: isAdviceLoading } = useAIAdvice({
    balance: totalBalance ?? 0,
    income: monthlySummary?.income ?? 0,
    expenses: monthlySummary?.expenses ?? 0,
  });

  return (
    <div className="space-y-8">
      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isKpiLoading ? (
          <>
            <KpiCardSkeleton />
            <KpiCardSkeleton />
            <KpiCardSkeleton />
            <KpiCardSkeleton />
          </>
        ) : (
          <>
            <KpiCard
              title="Balance Total"
              amount={`$${(totalBalance ?? 0).toLocaleString()}`}
              icon={Wallet}
              color="bg-indigo-600"
            />
            <KpiCard
              title="Ingresos del Mes"
              amount={`$${(monthlySummary?.income ?? 0).toLocaleString()}`}
              icon={TrendingUp}
              color="bg-emerald-600"
            />
            <KpiCard
              title="Gastos del Mes"
              amount={`$${(monthlySummary?.expenses ?? 0).toLocaleString()}`}
              icon={TrendingDown}
              color="bg-rose-600"
            />
            <KpiCard
              title="Meta de Ahorro"
              amount={`${goalsSummary ?? 0}%`}
              icon={Target}
              color="bg-amber-600"
            />
          </>
        )}
      </div>

      {/* ── AI Advice ── */}
      <div className="data-card p-6 bg-rose-500/5 border-rose-500/20 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Sparkles className="w-24 h-24 text-rose-500" />
        </div>
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-rose-500/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6 text-rose-500" />
          </div>
          <div className="space-y-1 pr-12 flex-1">
            <h4 className="text-sm font-bold text-rose-400 uppercase tracking-widest flex items-center gap-2">
              Consejo de Saving Pig
              {isAdviceLoading && <Loader2 className="w-3 h-3 animate-spin" />}
            </h4>
            {isAdviceLoading ? (
              <div className="space-y-2 pt-1">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-4/5" />
              </div>
            ) : (
              <p className="text-slate-300 italic font-medium leading-relaxed">
                {aiAdvice || "Analizando tus finanzas..."}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Charts & History ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 space-y-8">
          <div className="data-card p-6 flex flex-col min-h-[400px]">
            <div className="flex items-center justify-between mb-8">
              <h4 className="font-bold text-lg italic uppercase tracking-widest text-slate-400">
                Rendimiento Semanal
              </h4>
              <div className="flex gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-bold text-emerald-400 uppercase">
                    Ingresos
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 rounded-full border border-rose-500/20">
                  <div className="h-2 w-2 rounded-full bg-rose-500" />
                  <span className="text-[10px] font-bold text-rose-400 uppercase">
                    Gastos
                  </span>
                </div>
              </div>
            </div>

            <div className="w-full h-[320px] relative">
              {!weeklyStats ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="h-8 w-8 text-rose-500 animate-spin" />
                  <p className="text-xs text-slate-500 font-medium italic">
                    Calculando rendimiento...
                  </p>
                </div>
              ) : weeklyStats.length === 0 ||
                weeklyStats.every(
                  (s: any) => s.ingresos === 0 && s.gastos === 0,
                ) ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-slate-900 flex items-center justify-center border border-white/5">
                    <TrendingUp className="h-6 w-6 text-slate-700" />
                  </div>
                  <p className="text-xs text-slate-500 font-medium italic">
                    No hay movimientos esta semana
                  </p>
                </div>
              ) : (
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                  key={weeklyStats.length}
                >
                  <AreaChart
                    data={weeklyStats}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="colorIngresos"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#10b981"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#10b981"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient
                        id="colorGastos"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#f43f5e"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#f43f5e"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="rgba(255,255,255,0.05)"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: "#64748b",
                        fontSize: 10,
                        fontWeight: "bold",
                      }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#64748b", fontSize: 10 }}
                      tickFormatter={(val) => `$${val}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderColor: "rgba(255,255,255,0.1)",
                        borderRadius: "12px",
                        boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
                      }}
                      itemStyle={{ fontSize: "11px", fontWeight: "bold" }}
                      labelStyle={{
                        color: "#94a3b8",
                        marginBottom: "4px",
                        fontSize: "10px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="ingresos"
                      stroke="#10b981"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorIngresos)"
                      animationDuration={600}
                    />
                    <Area
                      type="monotone"
                      dataKey="gastos"
                      stroke="#f43f5e"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorGastos)"
                      animationDuration={600}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="data-card p-6 flex flex-col h-fit">
          <div className="flex items-center justify-between mb-8">
            <h4 className="font-bold text-lg italic uppercase tracking-widest text-slate-400">
              Historial
            </h4>
          </div>
          <div className="space-y-4">
            {isTransactionsLoading ? (
              [1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-11 w-11 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-2.5 w-1/3" />
                  </div>
                  <Skeleton className="h-4 w-16 rounded-full" />
                </div>
              ))
            ) : transactions?.length === 0 ? (
              <div className="text-center py-10 space-y-4">
                <Inbox className="w-12 h-12 text-slate-700 mx-auto" />
                <p className="text-xs text-slate-500 italic">
                  No hay movimientos registrados
                </p>
              </div>
            ) : (
              transactions?.map((t) => (
                <div
                  key={t.id}
                  className={`flex items-center gap-4 group p-3 rounded-2xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5 ${t.status === "voided" ? "opacity-40 grayscale" : ""}`}
                >
                  <div
                    className={`h-11 w-11 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${t.type === "income" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/20 text-rose-400 border border-rose-500/20"}`}
                  >
                    {getCategoryIcon(t.categories?.icon, t.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate leading-tight">
                      {t.description}
                    </p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
                      {new Date(t.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div
                    className={`text-sm font-black tabular-nums ${t.type === "income" ? "text-emerald-400" : "text-rose-400"}`}
                  >
                    {t.type === "income" ? "+" : "-"}$
                    {Math.abs(t.amount).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
