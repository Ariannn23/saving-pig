import { useState, useRef, useEffect } from "react";
import {
  X,
  Upload,
  Camera,
  Loader2,
  CheckCircle2,
  Sparkles,
  Building2,
} from "lucide-react";
import {
  useCreateTransaction,
  useUpdateTransaction,
  useAccounts,
  useCategories,
} from "@/hooks/useFinance";
import { storageService } from "@/services/storageService";
import { useAuthStore } from "@/store/useAuthStore";
import { useAIClassification } from "@/hooks/useAI";
import { useUIStore } from "@/store/useUIStore";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { DatePicker } from "@/components/ui/DatePicker";
import { getCategoryIcon } from "@/utils/categoryUtils";
import { validators, validationMessages } from "@/utils/validators";
import { useToast } from "@/store/useToastStore";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TransactionModal = ({
  isOpen,
  onClose,
}: TransactionModalProps) => {
  const { user } = useAuthStore();
  const { transactionToEdit } = useUIStore();
  const { data: rawAccounts, isLoading: isLoadingAccounts } = useAccounts();
  const { data: rawCategories } = useCategories();
  const createTransaction = useCreateTransaction();
  const updateTransaction = useUpdateTransaction();
  const { classify } = useAIClassification();
  const toast = useToast();

  const isEditing = !!transactionToEdit;

  // Deduplicar categorías por nombre
  const categories = rawCategories?.reduce((acc: any[], current: any) => {
    const name = (current.name || "").trim().toLowerCase();
    const exists = acc.find(
      (item) => (item.name || "").trim().toLowerCase() === name,
    );
    return exists ? acc : [...acc, current];
  }, []);

  // Deduplicar cuentas por nombre (evita mostrar duplicados si el trigger de DB se disparó dos veces)
  const accounts = rawAccounts?.reduce((acc: any[], current: any) => {
    const name = (current.name || "").trim().toLowerCase();
    const exists = acc.find(
      (item) => (item.name || "").trim().toLowerCase() === name,
    );
    return exists ? acc : [...acc, current];
  }, []);
  const todayIso = () => new Date().toISOString().split("T")[0];

  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [accountId, setAccountId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState(todayIso());
  const [file, setFile] = useState<File | null>(null);
  const [evidenceUrl, setEvidenceUrl] = useState<string | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [isClassifying, setIsClassifying] = useState(false);
  const [step, setStep] = useState<"form" | "success">("form");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (!isOpen) {
      hasLoadedRef.current = false;
      return;
    }
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    if (isEditing && transactionToEdit) {
      setType(transactionToEdit.type);
      setAmount(String(transactionToEdit.amount));
      setDescription(transactionToEdit.description);
      setAccountId(transactionToEdit.account_id);
      setCategoryId(transactionToEdit.category_id || "");
      setEvidenceUrl(transactionToEdit.evidence_url || null);
      // date comes as ISO string e.g. "2024-02-14T00:00:00..."
      setDate(
        transactionToEdit.date
          ? transactionToEdit.date.split("T")[0]
          : todayIso(),
      );
    } else {
      setType("expense");
      setAmount("");
      setDescription("");
      setFile(null);
      setEvidenceUrl(null);
      setDate(todayIso());
      setStep("form");

      if (accounts && accounts.length > 0) {
        setAccountId(accounts[0].id);
      }
    }
  }, [isOpen, isEditing]);

  // Auto-select first account on load (create mode)
  useEffect(() => {
    if (isOpen && !isEditing && accounts && accounts.length > 0 && !accountId) {
      setAccountId(accounts[0].id);
    }
  }, [accounts, isOpen, isEditing]);

  if (!isOpen) return null;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/^(\d+\.?\d{0,2})?$/.test(val)) {
      setAmount(val);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);

    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.warning("Ingresa un monto válido mayor a 0.");
      return;
    }
    if (!categoryId || !description || !accountId) {
      toast.warning("Por favor completa todos los campos obligatorios.");
      return;
    }
    if (accountId.length < 30 || categoryId.length < 30) {
      toast.error(
        "Error de validación: Selección de cuenta o categoría inválida.",
      );
      return;
    }

    try {
      let finalEvidenceUrl = evidenceUrl;
      if (file) {
        setUploadingFile(true);
        finalEvidenceUrl = await storageService.uploadEvidence(file, user!.id);
        setUploadingFile(false);
      }

      if (isEditing && transactionToEdit) {
        await updateTransaction.mutateAsync({
          id: transactionToEdit.id,
          updates: {
            amount: parsedAmount,
            type,
            description,
            account_id: accountId,
            category_id: categoryId,
            evidence_url: finalEvidenceUrl || undefined,
            date,
            status: transactionToEdit.status,
          },
        });
      } else {
        await createTransaction.mutateAsync({
          amount: parsedAmount,
          type,
          description,
          account_id: accountId,
          category_id: categoryId,
          evidence_url: finalEvidenceUrl || undefined,
          date,
          status: "active",
        });
      }

      setStep("success");
    } catch (error) {
      console.error("Error saving transaction:", error);
      toast.error("Hubo un error al guardar la transacción.");
    }
  };

  const handleAIClassify = async () => {
    if (!description || !amount) {
      toast.warning("Introduce descripción y monto primero.");
      return;
    }
    setIsClassifying(true);
    const suggestedCategory = await classify(
      description,
      parseFloat(amount),
      type,
    );
    if (suggestedCategory && categories) {
      const category = categories.find(
        (c: any) =>
          c.name.toLowerCase().includes(suggestedCategory) ||
          suggestedCategory.includes(c.name.toLowerCase()),
      );
      if (category) setCategoryId(category.id);
    }
    setIsClassifying(false);
  };

  const resetForm = () => {
    setAmount("");
    setDescription("");
    setFile(null);
    setEvidenceUrl(null);
    setCategoryId("");
    setDate(todayIso());
    setStep("form");
    hasLoadedRef.current = false;
    onClose();
  };

  const categoryOptions = (categories ?? []).map((cat: any) => ({
    value: cat.id,
    label: cat.name,
    icon: getCategoryIcon(cat.icon, cat.type ?? "expense", 14),
  }));

  const accountOptions = (accounts ?? []).map((acc: any) => ({
    value: acc.id,
    label: acc.name,
    icon: <Building2 className="h-3.5 w-3.5" />,
  }));

  const isSubmitting =
    createTransaction.isPending || updateTransaction.isPending || uploadingFile;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="glass-card w-full max-w-md overflow-hidden shadow-2xl ring-1 ring-white/10 max-h-[calc(100vh-1.5rem)] overflow-y-auto scrollbar-subtle">
        {step === "form" ? (
          <>
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/5 sticky top-0 bg-slate-950/50 backdrop-blur-sm z-10">
              <h2 className="text-lg sm:text-xl font-bold truncate">
                {isEditing ? "Editar Registro" : "Nuevo Registro"}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors flex-shrink-0 ml-2"
                aria-label="Cerrar modal"
                title="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5">
              {/* Type Switcher */}
              <div className="flex bg-slate-900 p-1 rounded-xl border border-white/5">
                <button
                  type="button"
                  onClick={() => setType("expense")}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                    type === "expense"
                      ? "bg-rose-600 text-white shadow-lg"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  Gasto
                </button>
                <button
                  type="button"
                  onClick={() => setType("income")}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                    type === "income"
                      ? "bg-emerald-600 text-white shadow-lg"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  Ingreso
                </button>
              </div>

              {/* Monto */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                  Monto a Registrar
                </label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg group-focus-within:text-rose-500 transition-colors pointer-events-none">
                    $
                  </span>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="0.00"
                    className="glass-input w-full !pl-14 text-xl font-bold tracking-tight focus:bg-white/10"
                    value={amount}
                    onChange={handleAmountChange}
                    required
                    autoComplete="off"
                  />
                </div>
              </div>

              {/* Categoría */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between ml-1 h-5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Categoría
                  </label>
                  <button
                    type="button"
                    onClick={handleAIClassify}
                    disabled={isClassifying}
                    className="text-[10px] font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors disabled:opacity-50"
                  >
                    {isClassifying ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Sparkles className="w-3 h-3" />
                    )}
                    IA
                  </button>
                </div>
                <Select
                  value={categoryId}
                  onChange={setCategoryId}
                  options={categoryOptions}
                  placeholder="Seleccionar categoría..."
                />
              </div>

              {/* Descripción */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                  Descripción
                </label>
                <Input
                  type="text"
                  placeholder="Ej: Almuerzo trabajo"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  validation={validators.description}
                  validationMessage={validationMessages.description}
                  required
                />
              </div>

              {/* Fecha */}
              <DatePicker
                value={date}
                onChange={setDate}
                maxDate={todayIso()}
                label="Fecha"
              />

              {/* Cuenta */}
              {accounts && accounts.length > 1 && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    Cuenta
                  </label>
                  <Select
                    value={accountId}
                    onChange={setAccountId}
                    options={accountOptions}
                    placeholder="Seleccionar cuenta..."
                  />
                </div>
              )}

              {/* Evidence Upload */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                  Evidencia Visual
                </label>
                {/* Preview existing evidence when editing */}
                {evidenceUrl && !file && (
                  <div className="relative rounded-xl overflow-hidden border border-white/10">
                    <img
                      src={evidenceUrl}
                      alt="Evidencia actual"
                      className="w-full h-32 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2">
                      <span className="text-[10px] text-white/70 font-bold">
                        Evidencia actual — sube otra para reemplazar
                      </span>
                    </div>
                  </div>
                )}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${
                    file
                      ? "border-rose-500/50 bg-rose-500/5"
                      : "border-white/10 hover:border-white/20 hover:bg-white/5"
                  }`}
                >
                  <input
                    type="file"
                    className="hidden"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    aria-label="Subir evidencia"
                    title="Subir evidencia"
                  />
                  {file ? (
                    <>
                      <CheckCircle2 className="h-8 w-8 text-rose-500" />
                      <p className="text-sm font-medium text-rose-400">
                        {file.name}
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="flex gap-4">
                        <Upload className="h-6 w-6 text-slate-500" />
                        <Camera className="h-6 w-6 text-slate-500" />
                      </div>
                      <p className="text-sm text-slate-400">
                        Subir foto o tomar captura
                      </p>
                    </>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isLoadingAccounts}
                className="btn-primary w-full h-14 text-base font-black italic tracking-tight"
              >
                {isSubmitting ? (
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-white" />
                ) : (
                  <>
                    <CheckCircle2 className="h-5 w-5" />
                    {isEditing ? "Actualizar" : "Guardar"}{" "}
                    {type === "expense" ? "Gasto" : "Ingreso"}
                  </>
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="p-8 sm:p-12 text-center space-y-6">
            <div className="w-16 sm:w-20 h-16 sm:h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="h-8 sm:h-10 w-8 sm:w-10 text-emerald-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold italic tracking-tight">
                ¡{isEditing ? "Actualización" : "Registro"}{" "}
                <span className="text-emerald-400">Exitosa</span>!
              </h2>
              <p className="text-sm sm:text-base text-slate-400">
                Tu transacción ha sido guardada correctamente.
              </p>
            </div>
            <button onClick={resetForm} className="btn-secondary w-full">
              Cerrar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
