# Sitio Web Deportivo

Sitio web para gestión de productos deportivos con autenticación de usuarios, roles y WhatsApp integration.

## Características

- ✅ Autenticación simple (sin hash)
- ✅ Tres roles: Administrador, Operador, Mayorista
- ✅ Gestión completa de productos
- ✅ Integración con WhatsApp para pedidos
- ✅ Despliegue automático en Cloudflare
- ✅ Base de datos en Supabase
- ✅ Diseño responsive

## Configuración

### 1. Supabase
1. Crear proyecto en [Supabase](https://supabase.com)
2. Ejecutar el script SQL en `supabase/schema.sql`
3. Obtener URL y anon key
4. Actualizar en `public/js/auth.js`

### 2. Cloudflare
1. Instalar Wrangler CLI
2. Configurar `wrangler.toml`
3. Configurar secrets en GitHub

### 3. Variables de entorno
```bash
SUPABASE_URL=tu_url_de_supabase
SUPABASE_KEY=tu_anon_key