import { useQuery } from "@tanstack/react-query";
import { aiService } from "@/services/aiService";

export const useAIAdvice = (summary: {
  balance: number;
  income: number;
  expenses: number;
}) => {
  return useQuery({
    queryKey: ["ai-advice", summary],
    queryFn: () => aiService.getFinancialAdvice(summary),
    staleTime: 1000 * 60 * 10, // 10 minutos
    enabled: !!summary.balance || !!summary.income || !!summary.expenses,
  });
};

export const useAIClassification = () => {
  return {
    classify: async (
      description: string,
      amount: number,
      type: "income" | "expense",
    ) => {
      return await aiService.classifyTransaction(description, amount, type);
    },
  };
};

export const useAIGoalPrediction = (goal: {
  name: string;
  target: number;
  current: number;
  avgMonthlySavings: number;
}) => {
  return useQuery({
    queryKey: ["ai-goal-prediction", goal.name],
    queryFn: () =>
      aiService.predictGoalTimeline(
        goal.name,
        goal.target,
        goal.current,
        goal.avgMonthlySavings,
      ),
    enabled: !!goal.name && goal.avgMonthlySavings > 0,
    staleTime: 1000 * 60 * 60, // 1 hora
  });
};
