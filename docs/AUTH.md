# Sistema de Autenticación - SAVING PIG

## Tecnologías

- **Supabase Auth:** Soporte para Email/Password, Magic Link y Google OAuth.
- **Zustand:** Gestión del estado global de la sesión del usuario.
- **React Router:** Enrutamiento protegido y redirección automática.

## Componentes Clave

- `LoginPage.tsx`: Interfaz de usuario premium con estética glassmorphism.
- `ProtectedRoute.tsx`: Componente de alto orden para asegurar que solo usuarios autenticados accedan al sistema.
- `useAuthStore.ts`: Estado centralizado para el manejo de la sesión y carga del usuario.

## Seguridad y Base de Datos

- **Tabla `profiles`**: Extendiendo `auth.users` para información adicional.
- **Row Level Security (RLS)**: Políticas estrictas para proteger los datos del usuario.
- **Triggers**: Automatización de la creación de perfiles al registrarse.

## Configuración Requerida

Asegúrate de configurar las siguientes variables en tu archivo `.env`:

```env
VITE_SUPABASE_URL=tu_url
VITE_SUPABASE_ANON_KEY=tu_anon_key
```
