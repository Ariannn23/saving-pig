-- Añadir columna de límite de presupuesto a categorías
alter table public.categories 
add column if not exists limit_amount decimal(12,2) default null;
