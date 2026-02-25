import { supabase } from "@/lib/supabase";

export interface Transaction {
  id: string;
  amount: number;
  type: "income" | "expense";
  category_id: string | null;
  account_id: string;
  description: string;
  date: string;
  evidence_url?: string | null;
  status: "active" | "voided";
  categories?: {
    name: string;
    icon: string;
    color: string;
  };
}

export const CATEGORY_ICONS: Record<string, string> = {
  Comida: "Utensils",
  Transporte: "Car",
  Salud: "Activity",
  Entretenimiento: "Gamepad2",
  Servicios: "Zap",
  Compras: "ShoppingBag",
  Hogar: "Home",
  Salario: "DollarSign",
  Otros: "Folder",
};

export interface Account {
  id: string;
  name: string;
  balance: number;
  currency: string;
}

export interface MonthlySummary {
  income: number;
  expenses: number;
}

export const financeService = {
  // --- Accounts ---
  async getAccounts() {
    const { data, error } = await supabase
      .from("accounts")
      .select("*")
      .order("name");
    if (error) throw error;
    return data as Account[];
  },

  // --- Transactions ---
  async getTransactions(limit = 10) {
    const { data, error } = await supabase
      .from("transactions")
      .select("*, categories(name, icon, color)")
      .order("date", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data as Transaction[];
  },

  async createTransaction(
    transaction: Omit<Transaction, "id" | "date"> & { date?: string },
  ) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not found");

    const { data, error } = await supabase
      .from("transactions")
      .insert([{ ...transaction, user_id: user.id }])
      .select();
    if (error) throw error;

    // Automatización: Verificar presupuestos tras crear un gasto
    if (transaction.type === "expense") {
      financeService.checkBudgetAlerts().catch(console.error);
    }

    return data[0];
  },

  async updateTransaction(id: string, updates: Partial<Transaction>) {
    const { data, error } = await supabase
      .from("transactions")
      .update(updates)
      .eq("id", id)
      .select();
    if (error) throw error;

    // Si se actualizó el monto de un gasto, re-verificar alertas
    if (
      updates.type === "expense" ||
      (updates.amount !== undefined && updates.amount > 0)
    ) {
      financeService.checkBudgetAlerts().catch(console.error);
    }

    return data[0];
  },

  async deleteTransaction(id: string) {
    const { error } = await supabase.from("transactions").delete().eq("id", id);
    if (error) throw error;
  },

  async voidTransaction(id: string) {
    // La anulación cambia el estado pero mantiene el monto original intacto
    return financeService.updateTransaction(id, { status: "voided" });
  },

  async reactivateTransaction(id: string) {
    // Vuelve a poner la transacción como activa
    return financeService.updateTransaction(id, { status: "active" });
  },

  // --- Summary / Stats ---
  async getBalanceSummary() {
    let queryResult = await supabase
      .from("transactions")
      .select("amount, type")
      .or("status.eq.active,status.is.null");

    // Fallback robusto por si la columna 'status' no existe
    if (queryResult.error && queryResult.error.message.includes("status")) {
      queryResult = await supabase.from("transactions").select("amount, type");
    }

    const { data: transactions, error } = queryResult;
    if (error && !transactions) throw error;

    const total = (transactions || []).reduce((acc, t) => {
      return t.type === "income"
        ? acc + Number(t.amount)
        : acc - Number(t.amount);
    }, 0);

    return total;
  },

  async getMonthlySummary() {
    const now = new Date();
    const firstDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
    ).toISOString();

    let queryResult = await supabase
      .from("transactions")
      .select("amount, type")
      .or("status.eq.active,status.is.null")
      .gte("date", firstDay);

    // Fallback robusto por si la columna 'status' no existe aún
    if (queryResult.error && queryResult.error.message.includes("status")) {
      queryResult = await supabase
        .from("transactions")
        .select("amount, type")
        .gte("date", firstDay);
    }

    const { data: transactions, error } = queryResult;

    if (error && !transactions) throw error;
    const finalTransactions = (transactions || []) as Array<{
      amount: number;
      type: string;
    }>;

    const summary = finalTransactions.reduce(
      (acc: MonthlySummary, t) => {
        if (t.type === "income") acc.income += Number(t.amount);
        else acc.expenses += Number(t.amount);
        return acc;
      },
      { income: 0, expenses: 0 },
    );

    return summary as MonthlySummary;
  },

  async getWeeklyStats() {
    const days = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];
    const now = new Date();
    const last7Days = new Date(now);
    last7Days.setDate(now.getDate() - 7);

    let queryResult = await supabase
      .from("transactions")
      .select("amount, type, date")
      .or("status.eq.active,status.is.null")
      .gte("date", last7Days.toISOString())
      .order("date", { ascending: true });

    // Fallback robusto por si la columna 'status' no existe aún o falla
    if (queryResult.error && queryResult.error.message.includes("status")) {
      queryResult = await supabase
        .from("transactions")
        .select("amount, type, date")
        .gte("date", last7Days.toISOString())
        .order("date", { ascending: true });
    }

    const { data: transactions, error } = queryResult;
    if (error && !transactions) throw error;
    const finalTransactions = (transactions || []) as Array<{
      amount: number;
      type: string;
      date: string;
    }>;

    // Inicializar los últimos 7 días con 0
    const stats: Record<
      string,
      { name: string; ingresos: number; gastos: number }
    > = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dayName = days[d.getDay()];
      // Usar fecha local YYYY-MM-DD
      const dayKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      stats[dayKey] = { name: dayName, ingresos: 0, gastos: 0 };
    }

    finalTransactions.forEach(
      (t: { date: string; type: string; amount: number }) => {
        const tDate = new Date(t.date);
        const dayKey = `${tDate.getFullYear()}-${String(tDate.getMonth() + 1).padStart(2, "0")}-${String(tDate.getDate()).padStart(2, "0")}`;
        if (stats[dayKey]) {
          if (t.type === "income") stats[dayKey].ingresos += Number(t.amount);
          else stats[dayKey].gastos += Number(t.amount);
        }
      },
    );

    return Object.values(stats);
  },

  async getGoalsSummary() {
    const { data: goals, error } = await supabase
      .from("goals")
      .select("current_amount, target_amount");

    if (error) throw error;

    if (!goals || goals.length === 0) return 0;

    const totalCurrent = goals.reduce(
      (acc, g) => acc + Number(g.current_amount),
      0,
    );
    const totalTarget = goals.reduce(
      (acc, g) => acc + Number(g.target_amount),
      0,
    );

    if (totalTarget === 0) return 0;
    return Math.round((totalCurrent / totalTarget) * 100);
  },

  // --- Categories ---
  async getCategories() {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");
    if (error) throw error;
    return data;
  },

  async updateCategoryLimit(id: string, limit_amount: number | null) {
    const { data, error } = await supabase
      .from("categories")
      .update({ limit_amount })
      .eq("id", id)
      .select();
    if (error) throw error;
    return data[0];
  },

  async seedDefaultCategories() {
    const defaultCategories = [
      { name: "Comida", icon: "Utensils", color: "#F43F5E", type: "expense" },
      { name: "Transporte", icon: "Car", color: "#3B82F6", type: "expense" },
      { name: "Salud", icon: "Activity", color: "#10B981", type: "expense" },
      {
        name: "Entretenimiento",
        icon: "Gamepad2",
        color: "#8B5CF6",
        type: "expense",
      },
      { name: "Servicios", icon: "Zap", color: "#F59E0B", type: "expense" },
      {
        name: "Compras",
        icon: "ShoppingBag",
        color: "#EC4899",
        type: "expense",
      },
      { name: "Hogar", icon: "Home", color: "#6366F1", type: "expense" },
      { name: "Salario", icon: "DollarSign", color: "#059669", type: "income" },
      { name: "Otros", icon: "Folder", color: "#64748B", type: "both" },
    ];

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not found");

    // 1. Obtener todas las categorías actuales del usuario
    const { data: currentCategories } = await supabase
      .from("categories")
      .select("*")
      .eq("user_id", user.id);

    if (!currentCategories) return [];

    // 2. Identificar categorías "malas" (con emojis o duplicadas)
    // Una categoría es "mala" si su icono no es uno de los nombres permitidos
    const validIcons = new Set(defaultCategories.map((c) => c.icon));
    const badCategories = currentCategories.filter(
      (cat) => !validIcons.has(cat.icon),
    );

    // 3. Eliminar categorías malas (esto limpiará la base de datos de emojis)
    if (badCategories.length > 0) {
      const { error: deleteError } = await supabase
        .from("categories")
        .delete()
        .in(
          "id",
          badCategories.map((c) => c.id),
        );
      if (deleteError) throw deleteError;
    }

    // 4. Re-leer tras limpieza para evitar duplicados por nombre
    const { data: afterCleanup } = await supabase
      .from("categories")
      .select("name")
      .eq("user_id", user.id);

    const existingNames = new Set(afterCleanup?.map((e: any) => e.name) || []);
    const categoriesToSeed = defaultCategories
      .filter((cat) => !existingNames.has(cat.name))
      .map((cat) => ({
        ...cat,
        user_id: user.id,
      }));

    if (categoriesToSeed.length === 0) return [];

    const { data, error } = await supabase
      .from("categories")
      .insert(categoriesToSeed)
      .select();

    if (error) throw error;
    return data;
  },

  async seedDefaultAccount() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not found");

    const { data: existing } = await supabase
      .from("accounts")
      .select("*")
      .eq("user_id", user.id)
      .limit(1);

    if (existing && existing.length > 0) return existing[0];

    const { data, error } = await supabase
      .from("accounts")
      .insert([
        {
          name: "Cuenta Personal",
          balance: 0,
          user_id: user.id,
        },
      ])
      .select();

    if (error) throw error;
    return data[0];
  },

  // --- Alerts ---
  async getAlerts() {
    const { data, error } = await supabase
      .from("alerts")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  async markAlertAsRead(id: string) {
    const { data, error } = await supabase
      .from("alerts")
      .update({ is_read: true })
      .eq("id", id)
      .select();
    if (error) throw error;
    return data[0];
  },

  // --- Goals ---
  async getGoals() {
    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  async createGoal(goal: {
    name: string;
    target_amount: number;
    current_amount: number;
    deadline?: string;
    color?: string;
  }) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not found");

    const { data, error } = await supabase
      .from("goals")
      .insert([{ ...goal, user_id: user.id }])
      .select();
    if (error) throw error;
    return data[0];
  },

  async updateGoal(
    id: string,
    updates: Partial<{
      name: string;
      target_amount: number;
      current_amount: number;
      color: string;
    }>,
  ) {
    const { data, error } = await supabase
      .from("goals")
      .update(updates)
      .eq("id", id)
      .select();
    if (error) throw error;
    return data[0];
  },

  async deleteGoal(id: string) {
    const { error } = await supabase.from("goals").delete().eq("id", id);
    if (error) throw error;
  },

  async completeGoal(id: string) {
    const { data, error } = await supabase
      .from("goals")
      .update({ completed_at: new Date().toISOString() })
      .eq("id", id)
      .select();
    if (error) throw error;
    return data[0];
  },

  async deleteAlert(id: string) {
    const { error } = await supabase.from("alerts").delete().eq("id", id);
    if (error) throw error;
  },

  async checkGoalAlerts() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Get total balance
    const balance = await financeService.getBalanceSummary();
    const totalBalance = typeof balance === "number" ? balance : 0;

    // Get all goals
    const { data: goals, error } = await supabase
      .from("goals")
      .select("id, name, target_amount, color");
    if (error || !goals) return;

    for (const goal of goals) {
      const target = Number(goal.target_amount);
      if (totalBalance < target) continue; // not completed yet

      const alertTitle = `Meta cumplida: ${goal.name}`;

      // Only create once (ever)
      const { data: exists } = await supabase
        .from("alerts")
        .select("id")
        .eq("user_id", user.id)
        .eq("title", alertTitle)
        .limit(1);

      if (!exists || exists.length === 0) {
        await supabase.from("alerts").insert([
          {
            user_id: user.id,
            title: alertTitle,
            message: `Alcanzaste tu objetivo de $${target.toLocaleString()}. Tu balance actual es $${totalBalance.toLocaleString()}. Sigue ahorrando.`,
            type: "success",
          },
        ]);
      }
    }
  },

  async checkBudgetAlerts() {
    // 0. Obtener usuario actual (necesario para RLS)
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return; // No autenticado, nada que hacer

    // 1. Obtener gastos del mes actual por categoría
    const now = new Date();
    const firstDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
    ).toISOString();

    let queryResult = await supabase
      .from("transactions")
      .select("amount, category_id, categories(name, limit_amount)")
      .eq("type", "expense")
      .or("status.eq.active,status.is.null")
      .gte("date", firstDay);

    // Fallback if status missing
    if (queryResult.error && queryResult.error.message.includes("status")) {
      queryResult = await supabase
        .from("transactions")
        .select("amount, category_id, categories(name, limit_amount)")
        .eq("type", "expense")
        .gte("date", firstDay);
    }

    const { data: transactions, error: tError } = queryResult;
    if (tError) throw tError;

    // 2. Obtener categorías con límites
    const { data: categories, error: cError } = await supabase
      .from("categories")
      .select("id, name, limit_amount")
      .not("limit_amount", "is", null);

    if (cError) throw cError;

    // 3. Calcular totales por categoría y comparar
    const categoryTotals: Record<string, number> = {};
    transactions.forEach((t: any) => {
      if (t.category_id) {
        categoryTotals[t.category_id] =
          (categoryTotals[t.category_id] || 0) + Number(t.amount);
      }
    });

    for (const cat of categories) {
      const total = categoryTotals[cat.id] || 0;
      const limit = Number(cat.limit_amount);

      if (total > limit) {
        const alertTitle = `Presupuesto Excedido: ${cat.name}`;

        // Crear alerta si no existe una este mes para esta categoría y usuario
        const { data: existingAlert } = await supabase
          .from("alerts")
          .select("id")
          .eq("user_id", user.id)
          .eq("title", alertTitle)
          .gte("created_at", firstDay)
          .limit(1);

        if (!existingAlert || existingAlert.length === 0) {
          await supabase.from("alerts").insert([
            {
              user_id: user.id,
              title: alertTitle,
              message: `Has gastado $${total.toLocaleString()} en ${cat.name}, superando tu límite de $${limit.toLocaleString()}.`,
              type: "warning",
            },
          ]);
        }
      }
    }
  },
};
