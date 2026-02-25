import { create } from "zustand";
import { Transaction } from "@/services/financeService";

interface UIState {
  isTransactionModalOpen: boolean;
  transactionToEdit: Transaction | null;
  openTransactionModal: (transaction?: Transaction) => void;
  closeTransactionModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isTransactionModalOpen: false,
  transactionToEdit: null,
  openTransactionModal: (transaction) =>
    set({
      isTransactionModalOpen: true,
      transactionToEdit: transaction || null,
    }),
  closeTransactionModal: () =>
    set({ isTransactionModalOpen: false, transactionToEdit: null }),
}));
