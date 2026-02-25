import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { financeService } from "@/services/financeService";

export const useAccounts = () => {
  return useQuery({
    queryKey: ["accounts"],
    queryFn: financeService.getAccounts,
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: financeService.getCategories,
  });
};

export const useUpdateCategoryLimit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, limit }: { id: string; limit: number | null }) =>
      financeService.updateCategoryLimit(id, limit),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

export const useSeedCategories = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => financeService.seedDefaultCategories(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

export const useSeedAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => financeService.seedDefaultAccount(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
};

export const useTransactions = (limit?: number) => {
  return useQuery({
    queryKey: ["transactions", limit],
    queryFn: () => financeService.getTransactions(limit),
  });
};

export const useBalanceSummary = () => {
  return useQuery({
    queryKey: ["balance-summary"],
    queryFn: financeService.getBalanceSummary,
  });
};

export const useMonthlySummary = () => {
  return useQuery({
    queryKey: ["monthly-summary"],
    queryFn: () => financeService.getMonthlySummary(),
  });
};

export const useWeeklyStats = () => {
  return useQuery({
    queryKey: ["weekly-stats"],
    queryFn: financeService.getWeeklyStats,
  });
};

export const useGoalsSummary = () => {
  return useQuery({
    queryKey: ["goals-summary"],
    queryFn: financeService.getGoalsSummary,
  });
};

export const useAlerts = () => {
  return useQuery({
    queryKey: ["alerts"],
    queryFn: () => financeService.getAlerts(),
  });
};

export const useMarkAlertAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => financeService.markAlertAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
  });
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: financeService.createTransaction,
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["balance-summary"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["monthly-summary"] });
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      // Check budget limits after every new transaction
      try {
        await financeService.checkBudgetAlerts();
        queryClient.invalidateQueries({ queryKey: ["alerts"] });
      } catch {
        // checkBudgetAlerts es opcional; el fallo no debe interrumpir la UI
      }
    },
  });
};

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      financeService.updateTransaction(id, updates),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["balance-summary"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["monthly-summary"] });
      // Re-check budget alerts on edit too
      try {
        await financeService.checkBudgetAlerts();
        queryClient.invalidateQueries({ queryKey: ["alerts"] });
      } catch {
        // checkBudgetAlerts es opcional; el fallo no debe interrumpir la UI
      }
    },
  });
};

export const useVoidTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => financeService.voidTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["balance-summary"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["monthly-summary"] });
      queryClient.invalidateQueries({ queryKey: ["weekly-stats"] });
    },
  });
};

export const useReactivateTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => financeService.reactivateTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["balance-summary"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["monthly-summary"] });
      queryClient.invalidateQueries({ queryKey: ["weekly-stats"] });
    },
  });
};

export const useGoals = () => {
  return useQuery({
    queryKey: ["goals"],
    queryFn: financeService.getGoals,
  });
};

export const useCreateGoal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: financeService.createGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });
};

export const useUpdateGoal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      financeService.updateGoal(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });
};

export const useDeleteGoal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: financeService.deleteGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });
};

export const useCompleteGoal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => financeService.completeGoal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });
};

export const useDeleteAlert = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => financeService.deleteAlert(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
  });
};
