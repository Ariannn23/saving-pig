import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";
import { Mail, Lock, Loader2, UserPlus, LogIn, User } from "lucide-react";

export const LoginPage = () => {
  const { session } = useAuthStore();
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (session) {
      navigate("/");
    }
  }, [session, navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (isRegistering) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) {
        setMessage(error.message);
      } else {
        setMessage("¡Cuenta creada! Revisa tu email para confirmar.");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) setMessage(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card p-8 w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-rose-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <img
              src="/saving-pig-icono2.png"
              alt="Saving Pig"
              className="w-10 h-10 object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isRegistering ? "Crear Cuenta" : "Bienvenido a"}{" "}
            <span className="gradient-text">SAVING PIG</span>
          </h1>
          <p className="text-slate-400">
            {isRegistering
              ? "Únete y empieza a ahorrar hoy mismo."
              : "Toma el control de tus finanzas hoy."}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {isRegistering && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">
                Nombre Completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Tu nombre"
                  className="glass-input w-full !pl-14"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 ml-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="email"
                placeholder="tu@email.com"
                className="glass-input w-full !pl-14"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 ml-1">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="password"
                placeholder="••••••••"
                className="glass-input w-full !pl-14"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {message && (
            <p
              className={`text-sm text-center font-medium ${message.includes("enviado") ? "text-emerald-400" : "text-rose-400"}`}
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            ) : isRegistering ? (
              <span className="flex items-center justify-center gap-2">
                <UserPlus className="w-5 h-5" /> Registrarse
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <LogIn className="w-5 h-5" /> Entrar
              </span>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 pt-4">
          {isRegistering ? "¿Ya tienes una cuenta?" : "¿No tienes una cuenta?"}{" "}
          <button
            onClick={() => {
              setIsRegistering(!isRegistering);
              setMessage("");
            }}
            className="text-rose-400 hover:text-rose-300 cursor-pointer font-medium hover:underline"
          >
            {isRegistering ? "Inicia Sesión" : "Regístrate"}
          </button>
        </p>
      </div>
    </div>
  );
};
