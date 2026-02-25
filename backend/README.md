# Estructura del Backend - SAVING PIG

Este directorio centraliza toda la lógica de negocio, configuración de datos e inteligencia artificial que no pertenece a la interfaz de usuario (Frontend).

## Directorios y Propósito

### 📁 `database/`

Contiene todas las migraciones SQL, esquemas de tablas y configuraciones de seguridad (RLS).

- `migrations/`: Scripts de creación y actualización de tablas.
- `seed.sql`: Datos de prueba iniciales.
- `storage.sql`: Configuración de buckets y políticas de archivos.

### 📁 `ai/`

Lógica central del motor de Inteligencia Artificial.

- `prompts/`: Definición de plantillas para OpenAI.
- `models/`: Esquemas de datos para predicciones y consejos.
- `services/`: Integración con la API de OpenAI.

### 📁 `services/`

Capa de servicios compartidos. Aquí se definen los "Helpers" que interactúan con Supabase para mantener el código limpio y DRY.

### 📁 `types/`

Definiciones de TypeScript para toda la lógica de backend y modelos de datos.

---

**Nota:** Aunque SAVING PIG utiliza un modelo BaaS (Supabase), esta carpeta asegura que la lógica de negocio esté documentada y organizada independientemente del cliente (web app).
