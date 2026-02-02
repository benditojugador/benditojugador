-- Migración Bendito Jugador: datos extra para mayoristas + control de estado
-- Ejecutar en Supabase SQL Editor

alter table public.usuarios
  add column if not exists nombre text,
  add column if not exists telefono text,
  add column if not exists ciudad text,
  add column if not exists estado text default 'pendiente' check (estado in ('pendiente','aprobado','rechazado'));

-- (Opcional) si querés marcar verificación manual:
-- alter table public.usuarios add column if not exists email_verificado boolean not null default false;
