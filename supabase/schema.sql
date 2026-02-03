-- Bendito Jugador - Schema base (public)
-- Ejecutar en Supabase SQL Editor

-- 1) Usuarios (sin Supabase Auth, login simple por tabla)
create table if not exists public.usuarios (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  password text not null,
  rol text check (rol in ('ADMINISTRADOR','OPERADOR','MAYORISTA')) not null,
  nombre text,
  telefono text,
  ciudad text,
  estado text default 'pendiente' check (estado in ('pendiente','aprobado','rechazado')),
  email_verificado boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2) Productos (catálogo)
create table if not exists public.productos_deportivos (
  id uuid default gen_random_uuid() primary key,
  oficial_alternativa text not null,
  año integer,
  equipo text not null,
  tipo_ropa text not null,
  tipo_equipo text not null,
  nacionalidad text not null,
  deporte text not null,
  etiquetas text not null,
  descripcion text,
  cargado_por uuid references public.usuarios(id),
  visible boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  portada text,
  img1 text,
  img2 text,
  img3 text,
  img4 text,
  img5 text
);

-- 3) Movimientos (métricas + auditoría liviana)
create table if not exists public.movimientos (
  id uuid default gen_random_uuid() primary key,
  usuario_id uuid references public.usuarios(id),
  accion text not null,
  producto_id uuid references public.productos_deportivos(id),
  detalle jsonb,
  creado_en timestamptz not null default now()
);

-- Datos de prueba (opcional)
insert into public.usuarios (email, password, rol) values
('admin@deportes.com', 'admin123', 'ADMINISTRADOR'),
('operador@deportes.com', 'operador123', 'OPERADOR'),
('mayorista@deportes.com', 'mayorista123', 'MAYORISTA')
on conflict (email) do nothing;
