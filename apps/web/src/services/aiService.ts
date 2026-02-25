import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" });

const AI_QUOTA_KEY = "sb_ai_quota_exceeded";
const AI_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

function isQuotaExceeded(): boolean {
  const ts = sessionStorage.getItem(AI_QUOTA_KEY);
  if (!ts) return false;
  return Date.now() - Number(ts) < AI_COOLDOWN_MS;
}

function markQuotaExceeded() {
  sessionStorage.setItem(AI_QUOTA_KEY, Date.now().toString());
}

export const aiService = {
  /**
   * Clasifica una transacción basada en su descripción y monto.
   */
  async classifyTransaction(
    description: string,
    amount: number,
    type: "income" | "expense",
  ) {
    if (!import.meta.env.VITE_GEMINI_API_KEY) return "otros";
    if (isQuotaExceeded()) return "otros";

    try {
      const prompt = `Eres un experto en finanzas personales. Tu tarea es categorizar transacciones financieras. 
      Responde únicamente con el nombre de la categoría sugerida en minúsculas y sin acentos. 
      Categorías comunes: alimentacion, transporte, vivienda, salud, entretenimiento, compras, servicios, otros.
      Analiza esta transaccion de tipo ${type}: "${description}" por un monto de ${amount}.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim().toLowerCase();

      return text || "otros";
    } catch (error) {
      if ((error as any)?.message?.includes("429")) markQuotaExceeded();
      return "otros";
    }
  },

  /**
   * Genera un consejo financiero basado en el balance actual y transacciones recientes.
   */
  async getFinancialAdvice(summary: {
    balance: number;
    income: number;
    expenses: number;
  }) {
    if (!import.meta.env.VITE_GEMINI_API_KEY)
      return "Configura tu API Key de Gemini para recibir consejos personalizados.";

    if (isQuotaExceeded())
      return "El pequeño cerdito está descansando. Vuelve pronto.";

    try {
      const prompt = `Eres un mentor financiero sarcástico pero muy útil (estilo Saving Pig). Da consejos cortos (máximo 2 frases) y directos.
      Mi balance actual es $${summary.balance}. Este mes he ingresado $${summary.income} y gastado $${summary.expenses}. Dame un consejo.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error: any) {
      if (
        error?.message?.includes("429") ||
        error?.message?.includes("quota")
      ) {
        markQuotaExceeded();
        return "El pequeño cerdito está descansando (Límite de API alcanzado). Vuelve pronto.";
      }
      return "Sigue ahorrando, pequeño cerdito.";
    }
  },

  /**
   * Proyecta el tiempo necesario para alcanzar una meta.
   */
  async predictGoalTimeline(
    goalName: string,
    targetAmount: number,
    currentAmount: number,
    avgMonthlySavings: number,
  ) {
    if (!import.meta.env.VITE_GEMINI_API_KEY) return null;
    if (isQuotaExceeded()) return null;

    try {
      const prompt = `Analista financiero. Calcula tiempo estimado de cumplimiento de metas. 
      Responde únicamente con un objeto JSON (sin markdown): { "months": number, "difficulty": "baja" | "media" | "alta", "tip": string }
      Meta: ${goalName}. Objetivo: ${targetAmount}. Actual: ${currentAmount}. Ahorro Promedio Mensual: ${avgMonthlySavings}.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response
        .text()
        .replace(/```json|```/g, "")
        .trim();

      return JSON.parse(text || "{}");
    } catch (error: any) {
      if (
        error?.message?.includes("429") ||
        error?.message?.includes("quota")
      ) {
        markQuotaExceeded();
      }
      return null;
    }
  },
};
