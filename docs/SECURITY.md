# Seguridad del Sistema - SAVING PIG

La seguridad es el pilar fundamental de SAVING PIG al tratarse de una aplicación de finanzas personales.

## Row Level Security (RLS)

Todas las tablas en el esquema `public` tienen habilitado RLS. Esto garantiza que un usuario autenticado solo pueda interactuar con los datos que le pertenecen.

### Lógica de Políticas

Para cada tabla, se aplica una política similar a la siguiente:

```sql
CREATE POLICY "Acceso de Propietario" ON public.transactions
    FOR ALL USING (auth.uid() = user_id);
```

- **Filtro:** `auth.uid() = user_id`.
- **Alcance:** Select, Insert, Update, Delete.

## Seguridad en Almacenamiento (Storage)

El bucket `evidences` es privado. Las imágenes se organizan por carpetas nombradas con el `user_id` del usuario.

### Políticas de Storage

- **Lectura/Escritura:** Solo permitida si el primer segmento de la ruta del archivo coincide con el `UID` del usuario autenticado.
- **Ejemplo de ruta:** `evidences/uuid-del-usuario/foto-gasto.jpg`.

## Autenticación

- **Sesiones:** Manejadas mediante JWT generados por Supabase.
- **Refresh Tokens:** Configurados para mantener la sesión segura y persistente.
