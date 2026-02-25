import {
  User,
  Bell,
  Shield,
  LogOut,
  ChevronRight,
  ChevronDown,
  Save,
  Key,
  Trash2,
  Eye,
  EyeOff,
  AlertCircle,
  BellRing,
  BellOff,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAlerts, useMarkAlertAsRead } from "@/hooks/useFinance";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/store/useToastStore";

/* ─── Toggle Switch ────────────────────────────────────────────── */
const Toggle = ({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    title={checked ? "Desactivar" : "Activar"}
    onClick={() => onChange(!checked)}
    className={`relative flex items-center shrink-0 cursor-pointer rounded-full border-2 transition-all duration-300 focus:outline-none ${
      checked
        ? "border-rose-600 bg-rose-600 shadow-[0_0_12px_rgba(225,29,72,0.35)]"
        : "border-slate-700 bg-slate-800"
    }`}
    style={{ width: "52px", height: "28px" }}
  >
    <motion.span
      layout
      transition={{ type: "spring", stiffness: 700, damping: 35 }}
      className={`pointer-events-none absolute h-5 w-5 rounded-full shadow-lg ${
        checked ? "bg-white" : "bg-slate-500"
      }`}
      style={{ left: checked ? "22px" : "2px" }}
    />
  </button>
);

/* ─── SettingRow ──────────────────────────────────────────────── */
const SettingRow = ({
  icon: Icon,
  label,
  value,
  onClick,
  danger,
  expanded,
}: {
  icon: any;
  label: string;
  value?: string;
  onClick?: () => void;
  danger?: boolean;
  expanded?: boolean;
}) => (
  <button
    onClick={onClick}
    className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors group text-left"
  >
    <div className="flex items-center gap-4">
      <div
        className={`h-10 w-10 rounded-xl flex items-center justify-center ${
          danger
            ? "bg-rose-500/10 text-rose-500"
            : "bg-slate-800 text-slate-400 group-hover:text-white transition-colors"
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p
          className={`font-semibold text-sm ${danger ? "text-rose-500" : "text-slate-200"}`}
        >
          {label}
        </p>
        {value && <p className="text-xs text-slate-500">{value}</p>}
      </div>
    </div>
    {expanded !== undefined ? (
      <ChevronDown
        className={`h-4 w-4 text-slate-600 transition-transform duration-200 ${
          expanded ? "rotate-180 text-rose-400" : ""
        }`}
      />
    ) : (
      <ChevronRight className="h-5 w-5 text-slate-600 group-hover:text-slate-400 transition-colors" />
    )}
  </button>
);

/* ─── Section wrapper ──────────────────────────────────────────── */
const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="data-card divide-y divide-white/5 overflow-hidden">
    <div className="px-6 py-4 bg-white/2">
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
        {title}
      </h3>
    </div>
    {children}
  </div>
);

/* ─── Expandable panel ─────────────────────────────────────────── */
const Panel = ({
  open,
  children,
}: {
  open: boolean;
  children: React.ReactNode;
}) => (
  <AnimatePresence initial={false}>
    {open && (
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.22, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <div className="px-4 sm:px-6 py-5 bg-white/2 border-t border-white/5 space-y-4">
          {children}
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

/* ─── Main page ────────────────────────────────────────────────── */
export default function Settings() {
  const { user, signOut } = useAuthStore();
  const toast = useToast();

  const [openPanel, setOpenPanel] = useState<string | null>(null);
  const toggle = (id: string) => setOpenPanel((p) => (p === id ? null : id));

  // ── Profile fields
  const [displayName, setDisplayName] = useState(
    user?.email?.split("@")[0] || "",
  );
  const [isSavingName, setIsSavingName] = useState(false);
  const handleSaveName = async () => {
    if (!displayName.trim()) return;
    setIsSavingName(true);
    try {
      await supabase.auth.updateUser({ data: { display_name: displayName } });
      toast.success("Nombre actualizado correctamente.");
    } catch {
      toast.error("Error al actualizar el nombre.");
    } finally {
      setIsSavingName(false);
    }
  };

  // ── Password change
  const [newPw, setNewPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [isSavingPw, setIsSavingPw] = useState(false);
  const handleChangePassword = async () => {
    if (newPw.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    setIsSavingPw(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPw });
      if (error) throw error;
      toast.success("Contraseña actualizada.");
      setNewPw("");
    } catch {
      toast.error("No se pudo actualizar la contraseña.");
    } finally {
      setIsSavingPw(false);
    }
  };

  // ── Notification prefs (stored in localStorage for now)
  const [notifBudget, setNotifBudget] = useState(
    () => localStorage.getItem("notif_budget") !== "false",
  );
  const [notifGoals, setNotifGoals] = useState(
    () => localStorage.getItem("notif_goals") !== "false",
  );

  // ── Delete account
  const [confirmDelete, setConfirmDelete] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const { data: alerts } = useAlerts();
  const markAsRead = useMarkAlertAsRead();
  const handleDeleteAccount = async () => {
    if (confirmDelete !== "ELIMINAR") {
      toast.error("Escribe ELIMINAR para confirmar.");
      return;
    }
    setIsDeletingAccount(true);
    try {
      const { error } = await supabase.functions.invoke("delete-account");
      if (error) throw error;
      toast.success("Cuenta eliminada correctamente. Hasta pronto.");
      await signOut();
    } catch {
      toast.error("No se pudo eliminar la cuenta. Intenta de nuevo.");
      setIsDeletingAccount(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* ── Profile Header ── */}
      <div className="data-card p-5 sm:p-8 flex flex-col md:flex-row items-center gap-4 sm:gap-6 text-center md:text-left">
        <div className="h-24 w-24 rounded-3xl bg-rose-600 flex items-center justify-center shadow-lg shadow-rose-900/40">
          <img
            src="/src/public/saving-pig-icono2.png"
            alt="Saving Pig"
            className="w-12 h-12 object-contain"
          />
        </div>
        <div className="flex-1 space-y-1">
          <h2 className="text-2xl font-bold">
            {user?.user_metadata?.display_name ||
              user?.email?.split("@")[0] ||
              "Usuario"}
          </h2>
          <p className="text-slate-500 font-medium italic">{user?.email}</p>
          <div className="pt-2 flex flex-wrap justify-center md:justify-start gap-2">
            <span className="px-3 py-1 bg-rose-500/10 text-rose-400 text-[10px] font-bold rounded-full border border-rose-500/20 uppercase tracking-wider">
              Plan Personal
            </span>
            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-bold rounded-full border border-indigo-500/20 uppercase tracking-wider">
              Verificado
            </span>
          </div>
        </div>
        {/* Quick action */}
        <button
          onClick={() => {
            setOpenPanel("profile");
          }}
          className="shrink-0 px-4 py-2 rounded-xl border border-white/10 text-sm font-bold text-slate-400 hover:text-white hover:bg-white/5 hover:border-white/20 transition-all flex items-center gap-2"
        >
          <User className="h-4 w-4" />
          Editar Perfil
        </button>
      </div>

      {/* ── Cuenta y Seguridad ── */}
      <div className="space-y-1">
        <Section title="Cuenta y Seguridad">
          {/* Información del Perfil */}
          <SettingRow
            icon={User}
            label="Información del Perfil"
            value="Cambia tu nombre de usuario"
            expanded={openPanel === "profile"}
            onClick={() => toggle("profile")}
          />
          <Panel open={openPanel === "profile"}>
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                Nombre de usuario
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="flex-1 min-w-0 bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-rose-500/60 focus:ring-1 focus:ring-rose-500/30"
                  placeholder="Tu nombre"
                />
                <button
                  onClick={handleSaveName}
                  disabled={isSavingName}
                  className="btn-primary px-3 sm:px-4 py-2.5 text-sm flex items-center gap-1.5 shrink-0"
                >
                  <Save className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {isSavingName ? "Guardando..." : "Guardar"}
                  </span>
                  <span className="sm:hidden">
                    {isSavingName ? "..." : "OK"}
                  </span>
                </button>
              </div>
              <p className="text-[11px] text-slate-600">
                Este nombre se muestra en tu perfil de Saving Pig.
              </p>
            </div>
          </Panel>

          {/* Privacidad y Datos */}
          <SettingRow
            icon={Shield}
            label="Privacidad y Datos"
            value="Cambia tu contraseña o elimina tu cuenta"
            expanded={openPanel === "privacy"}
            onClick={() => toggle("privacy")}
          />
          <Panel open={openPanel === "privacy"}>
            <div className="space-y-5">
              {/* Change password */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Key className="h-3.5 w-3.5" />
                  Cambiar Contraseña
                </p>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 pr-10 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-rose-500/60 focus:ring-1 focus:ring-rose-500/30"
                    placeholder="Nueva contraseña (mín. 6 caracteres)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  >
                    {showPw ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <button
                  onClick={handleChangePassword}
                  disabled={isSavingPw || !newPw}
                  className="btn-primary px-4 py-2 text-sm flex items-center gap-2 disabled:opacity-40"
                >
                  <Key className="h-4 w-4" />
                  {isSavingPw ? "Actualizando..." : "Actualizar contraseña"}
                </button>
              </div>

              {/* Danger zone */}
              <div className="border border-rose-500/20 rounded-xl p-4 bg-rose-500/5 space-y-3">
                <p className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Zona de Peligro
                </p>
                <p className="text-xs text-slate-500">
                  Escribe{" "}
                  <span className="text-rose-400 font-bold">ELIMINAR</span> para
                  confirmar la eliminación permanente de tu cuenta y todos tus
                  datos.
                </p>
                <input
                  type="text"
                  value={confirmDelete}
                  onChange={(e) => setConfirmDelete(e.target.value)}
                  className="w-full bg-slate-900 border border-rose-500/30 rounded-xl px-4 py-2.5 text-sm text-rose-400 placeholder:text-slate-700 focus:outline-none focus:border-rose-500"
                  placeholder="Escribe ELIMINAR"
                />
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeletingAccount || confirmDelete !== "ELIMINAR"}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600/10 border border-rose-500/20 text-rose-400 text-sm font-bold hover:bg-rose-600/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Trash2 className="h-4 w-4" />
                  {isDeletingAccount ? "Eliminando..." : "Eliminar mi cuenta"}
                </button>
              </div>
            </div>
          </Panel>

          {/* Notificaciones */}
          <SettingRow
            icon={Bell}
            label="Notificaciones"
            value="Configura qué alertas recibes"
            expanded={openPanel === "notifications"}
            onClick={() => toggle("notifications")}
          />
          <Panel open={openPanel === "notifications"}>
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                Controla qué tipos de alertas deseas recibir en el centro de
                notificaciones.
              </p>

              {/* Toggle: Budget alerts */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/3 border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center">
                    <AlertCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-200">
                      Alertas de presupuesto
                    </p>
                    <p className="text-xs text-slate-500">
                      Cuando superas un límite de gasto
                    </p>
                  </div>
                </div>
                <Toggle
                  checked={notifBudget}
                  onChange={(next) => {
                    setNotifBudget(next);
                    localStorage.setItem("notif_budget", String(next));
                    toast.success(
                      next
                        ? "Alertas de presupuesto activadas."
                        : "Alertas de presupuesto desactivadas.",
                    );
                  }}
                />
              </div>

              {/* Toggle: Goal alerts */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/3 border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                    <BellRing className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-200">
                      Metas cumplidas
                    </p>
                    <p className="text-xs text-slate-500">
                      Cuando alcanzas un objetivo de ahorro
                    </p>
                  </div>
                </div>
                <Toggle
                  checked={notifGoals}
                  onChange={(next) => {
                    setNotifGoals(next);
                    localStorage.setItem("notif_goals", String(next));
                    toast.success(
                      next
                        ? "Alertas de metas activadas."
                        : "Alertas de metas desactivadas.",
                    );
                  }}
                />
              </div>

              {/* Read-all shortcut */}
              {alerts && alerts.filter((a: any) => !a.is_read).length > 0 && (
                <button
                  onClick={() =>
                    alerts
                      .filter((a: any) => !a.is_read)
                      .forEach((a: any) => markAsRead.mutate(a.id))
                  }
                  className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors font-bold"
                >
                  <BellOff className="h-3.5 w-3.5" />
                  Marcar todas las notificaciones como leídas
                </button>
              )}
            </div>
          </Panel>
        </Section>
      </div>

      {/* ── Aplicación ── */}
      <Section title="Aplicación">
        <SettingRow
          icon={LogOut}
          label="Cerrar Sesión"
          danger
          onClick={signOut}
        />
      </Section>

      <div className="text-center">
        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em]">
          Saving Pig v0.1.0 • By SharkCorp. S.A.C.
        </p>
      </div>
    </div>
  );
}
