-- Migraciones Bendito Jugador (para proyectos ya creados)
-- Ejecutar en Supabase SQL Editor

-- 1) Campos extra en usuarios
alter table public.usuarios
  add column if not exists nombre text,
  add column if not exists telefono text,
  add column if not exists ciudad text,
  add column if not exists estado text default 'pendiente' check (estado in ('pendiente','aprobado','rechazado')),
  add column if not exists email_verificado boolean not null default false;

-- 2) Campo visible en productos
alter table public.productos_deportivos
  add column if not exists visible boolean not null default true;

-- 3) Tabla movimientos
create table if not exists public.movimientos (
  id uuid default gen_random_uuid() primary key,
  usuario_id uuid references public.usuarios(id),
  accion text not null,
  producto_id uuid references public.productos_deportivos(id),
  detalle jsonb,
  creado_en timestamptz not null default now()
);
