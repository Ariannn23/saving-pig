-- Crear el bucket de evidencias si no existe
insert into storage.buckets (id, name, public)
values ('evidences', 'evidences', true)
on conflict (id) do update set public = true;

-- Políticas de seguridad para el bucket de evidencias
-- Permitir que los usuarios vean sus propios archivos
create policy "Users can view their own evidence"
on storage.objects for select
using (
  bucket_id = 'evidences' 
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Permitir que los usuarios suban sus propios archivos
create policy "Users can upload their own evidence"
on storage.objects for insert
with check (
  bucket_id = 'evidences' 
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Permitir que los usuarios borren sus propios archivos
create policy "Users can delete their own evidence"
on storage.objects for delete
using (
  bucket_id = 'evidences' 
  and (storage.foldername(name))[1] = auth.uid()::text
);
