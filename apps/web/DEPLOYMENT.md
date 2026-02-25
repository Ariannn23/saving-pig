# Guía de Despliegue - SAVING PIG

SAVING PIG está diseñado para ser desplegado en **Vercel** para el frontend y en **Supabase** para el backend.

## Requisitos Previos

- Cuenta en Supabase con el esquema aplicado (`backend/database/`).
- Cuenta en Vercel vinculada a tu repositorio.

## Pasos para el Despliegue

### 1. Preparar el Proyecto

Asegúrate de que el comando `npm run build` en `apps/web` no tenga errores de TypeScript.

### 2. Configurar Variables de Entorno en Vercel

Debes añadir las siguientes variables en el dashboard de Vercel:

- `VITE_SUPABASE_URL`: Tu URL del proyecto Supabase.
- `VITE_SUPABASE_ANON_KEY`: Tu clave anónima de la API de Supabase.

### 3. Build & Deploy

- Directorio Raíz: `apps/web`
- Comando de Build: `npm run build`
- Directorio de Salida: `dist`

### 4. Configuración de Storage

Recuerda configurar el bucket `evidences` en Supabase como **Privado** y aplicar las políticas definidas en `backend/database/storage.sql`.
