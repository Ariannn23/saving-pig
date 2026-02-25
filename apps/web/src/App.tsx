import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./routes/AppRoutes";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";
import { useNotifications } from "@/hooks/useNotifications";
import {
  useAccounts,
  useCategories,
  useSeedAccount,
  useSeedCategories,
} from "@/hooks/useFinance";

function App() {
  const { session, setSession } = useAuthStore();
  const { requestPermission } = useNotifications();

  // Hooks para autoseed
  const { data: accounts } = useAccounts();
  const { data: categories } = useCategories();
  const seedAccount = useSeedAccount();
  const seedCategories = useSeedCategories();

  useEffect(() => {
    if (session?.user) {
      // Sembrar cuenta por defecto solo si el usuario no tiene ninguna
      if (
        accounts !== undefined &&
        accounts.length === 0 &&
        !seedAccount.isPending
      ) {
        seedAccount.mutate();
      }
      // Sembrar categorías por defecto solo si el usuario no tiene ninguna
      if (
        categories !== undefined &&
        categories.length === 0 &&
        !seedCategories.isPending
      ) {
        seedCategories.mutate();
      }
    }
  }, [session, accounts, categories]);

  useEffect(() => {
    // Solicitar permisos de notificación
    requestPermission();

    // Escuchar el estado inicial y cambios
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [setSession]);

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
