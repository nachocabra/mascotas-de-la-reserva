# 🐾 Mascotas del Barrio

Directorio comunitario de mascotas para barrio privado. Construido con Next.js 14, TypeScript, Tailwind CSS y Supabase.

## Setup en 5 pasos

### 1. Clonar e instalar dependencias

```bash
npm install
```

### 2. Crear proyecto en Supabase

1. Entrá a [supabase.com](https://supabase.com) y creá un proyecto nuevo
2. Esperá que termine de inicializar (~2 minutos)

### 3. Crear la tabla en Supabase

En el SQL Editor de Supabase, corré este script:

```sql
create table animals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  species text not null check (species in ('perro', 'gato', 'otro')),
  breed text,
  color text,
  photo_url text,
  lot_number text not null,
  owner_name text not null,
  whatsapp text not null,
  status text not null default 'home' check (status in ('home', 'lost', 'found')),
  description text,
  created_at timestamptz default now()
);

-- Permitir lectura pública
alter table animals enable row level security;
create policy "Lectura pública" on animals for select using (true);
create policy "Inserción pública" on animals for insert with check (true);
create policy "Actualización pública" on animals for update using (true);
```

### 4. Crear bucket de fotos en Supabase

En Storage → New Bucket:
- Nombre: `animal-photos`
- Public bucket: ✅ activado

### 5. Variables de entorno

Copiá `.env.local.example` a `.env.local` y completá con tus credenciales de Supabase (Settings → API):

```
NEXT_PUBLIC_SUPABASE_URL=https://tuproyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

## Correr en local

```bash
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000)

## Deploy en Vercel

1. Subí el proyecto a GitHub
2. Importalo en [vercel.com](https://vercel.com)
3. Agregá las variables de entorno en Vercel (Settings → Environment Variables)
4. Deploy automático ✅

## Cambiar el código del barrio

En `lib/utils.ts`, línea 3:

```ts
export const ACCESS_CODE = 'vecino2024' // ← cambialo acá
```

## Estructura del proyecto

```
app/
  page.tsx                    # Home con grilla de mascotas
  agregar/page.tsx            # Formulario para agregar mascota
  animal/[id]/page.tsx        # Detalle de una mascota
  animal/[id]/editar/page.tsx # Cambiar estado (perdido/en casa/encontrado)
components/
  AnimalCard.tsx              # Card de la grilla
  FilterBar.tsx               # Filtros de especie y estado
  AccessCodeModal.tsx         # Modal con código del barrio
  PhotoUpload.tsx             # Upload de fotos con preview
lib/
  supabase.ts                 # Cliente de Supabase + upload de fotos
  utils.ts                    # Helpers y constantes
types/
  animal.ts                   # TypeScript types
```
