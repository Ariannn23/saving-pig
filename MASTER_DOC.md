# MASTERDOC.md

# SAVING PIG – Proyecto Personal de Gestión Financiera

**Tipo de proyecto:** Personal
**Propietario:** Uso exclusivo del autor
**Plataforma:** Aplicación Web Responsive
**Modo de uso:** Desktop + Mobile (PWA Ready)

---

# PROPÓSITO

SAVING PIG es una aplicación web personal diseñada para:

* Registrar ingresos mensuales
* Registrar gastos por cada ingreso o salida de dinero
* Adjuntar evidencia visual (foto o imagen) por cada gasto
* Visualizar historial financiero
* Analizar hábitos de consumo
* Crear y gestionar metas financieras
* Visualizar gráficas financieras
* Recibir alertas por exceso de gasto
* Obtener consejos de ahorro
* Usar IA para proyección de metas

Proyecto creado para uso  **100% personal** , no multiusuario, no comercial.

---

# OBJETIVOS FUNCIONALES

* Control financiero personal
* Evidencia visual de gastos
* Conciencia financiera
* Automatización de análisis
* Disciplina de ahorro
* Inteligencia financiera asistida por IA

---

# ARQUITECTURA GENERAL

Usuario
↓
Web App React (Responsive UI)
↓
Supabase SDK
↓
Supabase Services:

* Auth
* PostgreSQL
* Storage
* Realtime
  ↓
  IA Engine (OpenAI API)

---

# PLATAFORMA

* Web App
* Responsive
* Mobile-first
* Compatible con móviles
* Compatible con tablets
* Compatible con desktop
* Instalación como PWA

---

# FUNCIONALIDADES PRINCIPALES

## Finanzas

* Registro de ingresos
* Registro de gastos
* Evidencia fotográfica por gasto
* Clasificación automática
* Historial financiero
* Balance automático

## Visualización

* Tablas mensuales
* Tablas históricas
* Gráficos de ingresos
* Gráficos de gastos
* Gráficos por días
* Gráficos por categorías

## Metas

* Crear metas financieras
* Editar metas
* Eliminar metas
* Seguimiento automático
* Progreso visual

## Alertas

* Exceso de gasto
* Gastos repetitivos
* Gasto fuera de patrón
* Alertas personalizadas

## IA

* Consejos de ahorro
* Análisis de hábitos
* Predicción de gastos
* Proyección de metas
* Plan de ahorro automático
* Cálculo de tiempo para lograr metas

---

# DATOS FINANCIEROS

* Ingresos mensuales
* Gastos diarios
* Gastos mensuales
* Balance
* Historial
* Evidencias

---

# MODELO DE DATOS

User
Account
Transaction
Category
Goal
Alert
Advice
Prediction
Evidence

---

# ESTRUCTURA DEL PROYECTO

```
savings-pig/
MASTERDOC.md
README.md
apps/
  web/
    src/
      components/
      pages/
      services/
      store/
      hooks/
      lib/
      layouts/
      assets/
      styles/
    public/
    index.html
    vite.config.ts
    tsconfig.json

supabase/
  migrations/
  seed.sql
  schema.sql
  policies.sql

packages/
  ui/
  utils/
  config/

docs/
  PROJECT_OVERVIEW.md
  ARCHITECTURE.md
  DATABASE.md
  RULES.md
  DEPLOYMENT.md
  SECURITY.md
  API.md
```

---

# STACK TECNOLÓGICO

Frontend:

* React
* TypeScript
* Vite
* TailwindCSS
* Zustand
* React Query
* Zod
* Chart.js / Recharts

Backend:

* Supabase

DB:

* PostgreSQL (Supabase)

Auth:

* Supabase Auth

Storage:

* Supabase Storage (evidencias de gastos)

IA:

* OpenAI API

Cloud:

* Supabase
* Vercel

---

# GRÁFICOS

* Ingresos por mes
* Gastos por mes
* Ingresos por día
* Gastos por día
* Comparativa ingresos/gastos
* Progreso de metas
* Proyección financiera

---

# SISTEMA DE EVIDENCIAS

Cada gasto debe permitir:

* Subir foto
* Cargar imagen desde dispositivo
* Asociar imagen a transacción
* Guardar en Supabase Storage
* Relación directa con Transaction

---

# IA FINANCIERA

Funciones IA:

* Clasificación automática de gastos
* Análisis de hábitos
* Detección de patrones
* Consejos personalizados
* Predicción de consumo
* Plan de ahorro automático
* Proyección de metas
* Cálculo de tiempo para cumplir objetivos

---

# FLUJO DE USUARIO

1. Login
2. Registro de ingresos
3. Registro de gastos
4. Subida de evidencia
5. Clasificación automática
6. Visualización dashboard
7. Análisis IA
8. Gestión de metas
9. Alertas
10. Proyección financiera

---

# PROMPT IA BACKEND (SUPABASE)

"ANTES DE COMENZAR: DEBES LEER OBLIGATORIAMENTE EL ARCHIVO MASTERDOC.md COMPLETO.

Eres un arquitecto backend senior especializado en Supabase. Estás creando un proyecto personal llamado SAVING PIG.

El proyecto es de uso personal exclusivo, single-user, no multiusuario.

Debes generar:

* Infraestructura Supabase
* Base de datos PostgreSQL
* Storage para evidencias
* Auth
* Policies
* Seguridad

Tecnologías:

* Supabase
* PostgreSQL
* SQL

Reglas:

1. Leer MASTERDOC.md primero
2. Generar schema.sql
3. Generar seed.sql
4. Generar migrations/
5. Generar policies.sql
6. Seguridad con RLS
7. Storage seguro
8. Relación evidencias-transacciones
9. Estructura profesional
10. Preparado para producción

Output obligatorio:

* schema.sql
* seed.sql
* migrations/
* policies.sql
* supabase-config.md
* DATABASE.md
* SECURITY.md
* API.md
  "

---

# PROMPT IA FRONTEND (REACT)

"ANTES DE COMENZAR: DEBES LEER OBLIGATORIAMENTE EL ARCHIVO MASTERDOC.md COMPLETO.

Eres un arquitecto frontend senior. Estás creando una aplicación web personal llamada SAVING PIG.

Stack:

* React
* TypeScript
* Vite
* TailwindCSS
* Zustand
* Supabase JS SDK

Reglas:

1. Leer MASTERDOC.md primero
2. Diseño mobile-first
3. UI responsive
4. Dashboard financiero
5. Evidencias por gasto
6. Gráficos financieros
7. Gestión de metas
8. Alertas
9. IA integrada
10. PWA Ready

Pantallas:

* Login
* Dashboard
* Ingresos
* Gastos
* Evidencias
* Metas
* Reportes
* Alertas
* Configuración

Funcionalidades:

* Registro financiero
* Evidencias
* Tablas
* Gráficos
* Metas
* Proyecciones
* IA

Output obligatorio:

* Proyecto React completo
* Dockerfile
* docker-compose.yml
* .env.example
* README.md
* DEPLOYMENT.md
  "

---

# REGLAS DEL PROYECTO

* Proyecto personal
* Uso exclusivo
* Seguridad prioritaria
* Datos privados
* Evidencias obligatorias
* Control financiero
* Automatización
* IA responsable

---

# VISIÓN FINAL

SAVING PIG no es solo una app, es un sistema personal de disciplina financiera, control económico, conciencia de consumo, planificación de vida financiera y crecimiento económico personal basado en datos reales, evidencias visuales y análisis inteligente.
