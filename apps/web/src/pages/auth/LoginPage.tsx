import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";
import { Mail, Lock, Loader2, UserPlus, LogIn, User, CheckCircle2, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { validators, validationMessages } from "@/utils/validators";

export const LoginPage = () => {
  const { session } = useAuthStore();
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("error");
  const [confirmationSent, setConfirmationSent] = useState(false);

  useEffect(() => {
    if (session) {
      if (confirmationSent) {
        // Usuario está confirmado, redirigir después de 3 segundos
        const timer = setTimeout(() => {
          navigate("/");
        }, 3000);
        return () => clearTimeout(timer);
      } else {
        // Usuario ya tiene sesión, ir al dashboard
        navigate("/");
      }
    }
  }, [session, navigate, confirmationSent]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (isRegistering) {
      // Validar campos
      if (!fullName.trim()) {
        setMessage("Por favor ingresa tu nombre completo.");
        setMessageType("error");
        setLoading(false);
        return;
      }

      if (!validators.nameOnly(fullName)) {
        setMessage("El nombre solo puede contener letras y espacios.");
        setMessageType("error");
        setLoading(false);
        return;
      }

      if (!validators.email(email)) {
        setMessage("Por favor ingresa un email válido.");
        setMessageType("error");
        setLoading(false);
        return;
      }

      if (!validators.password(password)) {
        setMessage("La contraseña debe tener al menos 6 caracteres.");
        setMessageType("error");
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });
      
      if (error) {
        setMessage(error.message);
        setMessageType("error");
      } else {
        setMessage(
          "¡Cuenta creada! Revisa tu email para confirmar y acceder a tu cuenta."
        );
        setMessageType("success");
        setConfirmationSent(true);
      }
    } else {
      // Login validation
      if (!validators.email(email)) {
        setMessage("Por favor ingresa un email válido.");
        setMessageType("error");
        setLoading(false);
        return;
      }

      if (!password) {
        setMessage("Por favor ingresa tu contraseña.");
        setMessageType("error");
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setMessage(error.message);
        setMessageType("error");
      } else {
        setMessageType("success");
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="glass-card p-6 sm:p-8 w-full max-w-md space-y-8 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-rose-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <img
              src="/saving-pig-icono2.png"
              alt="Saving Pig"
              className="w-10 h-10 object-contain"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {isRegistering ? "Crear Cuenta" : "Bienvenido a"}{" "}
            <span className="gradient-text">SAVING PIG</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-400">
            {isRegistering
              ? "Únete y empieza a ahorrar hoy mismo."
              : "Toma el control de tus finanzas hoy."}
          </p>
        </div>

        {confirmationSent ? (
          <div className="space-y-6">
            {session ? (
              // Pantalla de confirmación exitosa
              <div className="space-y-6">
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-8 space-y-4">
                  <div className="flex justify-center">
                    <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center animate-pulse">
                      <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                    </div>
                  </div>
                  <div className="text-center space-y-3">
                    <h2 className="text-2xl font-bold text-emerald-300">
                      ¡Cuenta Confirmada!
                    </h2>
                    <p className="text-sm text-slate-400">
                      Tu email ha sido verificado exitosamente.
                    </p>
                    <p className="text-xs text-emerald-400 font-medium">
                      Te estamos redirigiendo al dashboard...
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate("/")}
                  className="btn-primary w-full h-12 flex items-center justify-center gap-2"
                >
                  <span>Ir al Dashboard</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            ) : (
              // Pantalla de espera de confirmación
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center">
                    <Mail className="w-8 h-8 text-emerald-400" />
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <h2 className="text-lg font-bold text-emerald-300">
                    Confirma tu email
                  </h2>
                  <p className="text-sm text-slate-400">
                    Hemos enviado un enlace de confirmación a:
                  </p>
                  <p className="text-sm font-medium text-white break-all">{email}</p>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-4 space-y-2">
                  <p className="text-xs text-slate-500 font-medium">
                    PRÓXIMOS PASOS:
                  </p>
                  <ol className="text-xs text-slate-400 space-y-1 list-decimal list-inside">
                    <li>Abre el email que recibiste</li>
                    <li>Haz clic en el enlace de confirmación</li>
                    <li>Serás redirigido aquí automáticamente</li>
                  </ol>
                </div>
              </div>
            )}
            <button
              onClick={() => {
                setConfirmationSent(false);
                setIsRegistering(false);
                setEmail("");
                setPassword("");
                setFullName("");
              }}
              className="text-sm text-rose-400 hover:text-rose-300 w-full py-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              ← Volver a inicio de sesión
            </button>
          </div>
        ) : (
          <form onSubmit={handleAuth} className="space-y-4">
            {isRegistering && (
              <Input
                type="text"
                placeholder="Ej: Juan Pérez"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                label="Nombre Completo"
                icon={User}
                validation={validators.nameOnly}
                validationMessage={validationMessages.nameOnly}
              />
            )}
            <Input
              type="text"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              label="Email"
              icon={Mail}
              validation={validators.email}
              validationMessage={validationMessages.email}
            />

            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              label="Contraseña"
              icon={Lock}
              validation={validators.password}
              validationMessage={validationMessages.password}
            />

            {message && (
              <div
                className={`text-sm text-center font-medium p-3 rounded-lg border ${
                  messageType === "success"
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                    : "bg-rose-500/10 border-rose-500/20 text-rose-300"
                }`}
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={
                loading ||
                !email ||
                !password ||
                (isRegistering
                  ? !fullName ||
                    !validators.nameOnly(fullName) ||
                    !validators.email(email) ||
                    !validators.password(password)
                  : !validators.email(email))
              }
              className="btn-primary w-full h-12 text-base font-bold disabled:opacity-40"
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
        )}

        <p className="text-center text-xs sm:text-sm text-slate-500 pt-4">
          {isRegistering ? "¿Ya tienes una cuenta?" : "¿No tienes una cuenta?"}{" "}
          <button
            onClick={() => {
              setIsRegistering(!isRegistering);
              setMessage("");
              setConfirmationSent(false);
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
