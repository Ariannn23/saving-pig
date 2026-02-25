# IA Financiera en SAVING PIG 🤖🐷

SAVING PIG utiliza modelos avanzados de lenguaje (OpenAI GPT-3.5 Turbo) para transformar datos financieros crudos en información accionable.

## Funcionalidades de IA

### 1. Clasificación Automática (Categorización)

Cuando registras un gasto, la IA analiza la descripción y el monto para sugerir la categoría más adecuada.

- **Prompt:** Identifica la categoría basándose en palabras clave.
- **Categorías Soporte:** alimentacion, transporte, vivienda, salud, entretenimiento, compras, servicios.

### 2. Consejos Personalizados (Saving Pig Mentor)

En el Dashboard, recibes consejos directos y con un toque de personalidad basados en tu balance actual y tus hábitos de gasto del mes.

- **Lógica:** Analiza la relación Ingresos vs. Gastos.
- **Estilo:** Directo, motivador y a veces sarcástico.

### 3. Proyecciones Temporales de Metas

Calcula el tiempo estimado para alcanzar tus objetivos de ahorro basándose en tu capacidad de ahorro mensual real.

- **Fórmula:** `(Objetivo - Actual) / Ahorro Mensual Promedio`.
- **Ajuste:** La IA estima la dificultad y proporciona un "tip" para cada meta.

## Configuración Técnica

La integración se realiza a través de `aiService.ts` utilizando el SDK oficial de OpenAI. Los resultados se gestionan con React Query para optimizar las llamadas y el caché.

### Variable de Entorno

- `VITE_OPENAI_API_KEY`: Requerida para activar todas las funciones de IA.

> [!TIP]
> Si la API Key no está configurada, el sistema entra en modo "Pasivo", mostrando mensajes predeterminados sin realizar llamadas externas.
