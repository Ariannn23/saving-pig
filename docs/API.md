# Documentación de API - SAVING PIG

SAVING PIG utiliza el SDK de Supabase para interactuar directamente con la base de datos PostgreSQL. A continuación se detallan los servicios principales.

## Gestión de Transacciones

### Listar Transacciones por Cuenta

```typescript
const { data, error } = await supabase
  .from("transactions")
  .select("*, categories(*)")
  .eq("account_id", accountId)
  .order("date", { ascending: false });
```

### Registrar Nuevo Gasto

```typescript
const { data, error } = await supabase.from("transactions").insert([
  {
    amount,
    type: "expense",
    category_id,
    account_id,
    description,
  },
]);
```

## Sistema de Evidencias

### Subir Evidencia al Storage

```typescript
const { data, error } = await supabase.storage
  .from("evidences")
  .upload(`${user.id}/${fileName}`, file);
```

### Vincular Evidencia a Transacción

```typescript
const { error } = await supabase.from("evidences").insert([
  {
    transaction_id,
    file_path: data.path,
  },
]);
```

## Metas Financieras

### Obtener Progreso de Metas

```typescript
const { data, error } = await supabase
  .from("goals")
  .select("*")
  .eq("status", "active");
```
