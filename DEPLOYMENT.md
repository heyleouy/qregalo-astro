# 🚀 Guía de Deployment - QueRegalo Catalog

## Resumen: ¿Qué deployar dónde?

### ✅ Supabase (Base de datos + Edge Functions)
- **Base de datos**: PostgreSQL con todas las tablas
- **Migraciones**: Schema completo
- **Edge Functions**: `/functions/v1/ai-parse`
- **Seed data**: Datos de demostración (opcional)

### ✅ Vercel (Aplicación Web)
- **App Astro**: `/apps/web`
- **Build**: SSR (Server-Side Rendering)
- **Variables de entorno**: Configuración pública

---

## 📦 Parte 1: Deployment en Supabase

### Paso 1: Crear proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Crea una cuenta o inicia sesión
3. Click en "New Project"
4. Completa:
   - **Name**: `qregalo-catalog` (o el nombre que prefieras)
   - **Database Password**: Guarda esta contraseña (la necesitarás)
   - **Region**: Elige la más cercana a tus usuarios
   - **Pricing Plan**: Free tier es suficiente para empezar

5. Espera 2-3 minutos a que se cree el proyecto

### Paso 2: Conectar Supabase CLI al proyecto remoto

```bash
# En tu terminal local
cd /Users/leo/Documents/GitHub/qregalo-astro

# Login en Supabase CLI
supabase login

# Link tu proyecto local al remoto
supabase link --project-ref <tu-project-ref>
# El project-ref lo encuentras en: Project Settings > General > Reference ID
```

### Paso 3: Push de migraciones

```bash
# Push todas las migraciones a Supabase
supabase db push

# Esto aplicará todas las migraciones en /supabase/migrations/
```

### Paso 4: Seed de datos (opcional)

```bash
# Opción 1: Desde tu máquina local (requiere variables de entorno)
cd supabase/seed
npm install
# Configura las variables de entorno con las claves de producción
SUPABASE_URL=https://<tu-project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key-de-produccion>
npm run seed

# Opción 2: Usar SQL directamente en Supabase Dashboard
# Ve a SQL Editor y ejecuta el contenido de las migraciones manualmente
```

### Paso 5: Deploy Edge Function (AI Parse)

```bash
# Deploy la función ai-parse
supabase functions deploy ai-parse

# Configurar variables de entorno de la función
supabase secrets set OPENAI_API_KEY=<tu-openai-api-key>
supabase secrets set LLM_PROVIDER=openai
supabase secrets set OPENAI_MODEL=gpt-4o-mini
```

### Paso 6: Obtener credenciales de Supabase

En el Dashboard de Supabase:
1. Ve a **Project Settings** > **API**
2. Copia estos valores:
   - **Project URL**: `https://<project-ref>.supabase.co`
   - **anon/public key**: `eyJhbGc...` (clave pública)
   - **service_role key**: `eyJhbGc...` (clave privada, mantener secreta)

---

## 🌐 Parte 2: Deployment en Vercel

### Paso 1: Instalar dependencias (incluye Vercel adapter)

```bash
# En tu máquina local, instala el adapter de Vercel
cd /Users/leo/Documents/GitHub/qregalo-astro
npm install

# Esto instalará @astrojs/vercel que ya está en package.json
```

El archivo `vercel.json` ya está creado en la raíz del proyecto.

### Paso 2: Conectar repositorio a Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Inicia sesión con GitHub
3. Click en "Add New Project"
4. Importa el repositorio `heyleouy/qregalo-astro`
5. Vercel detectará automáticamente el archivo `vercel.json` en la raíz del proyecto

### Paso 3: Verificar configuración (opcional)

El archivo `vercel.json` ya contiene toda la configuración necesaria:
- ✅ Build Command: `npm run build --workspace=apps/web`
- ✅ Output Directory: `apps/web/dist`
- ✅ Install Command: `npm install`
- ✅ Framework: Astro

**Root Directory**: Dejar vacío (raíz del repo) - Vercel detectará automáticamente el monorepo

> **Nota**: No necesitas configurar manualmente estos valores, ya están en `vercel.json`. Solo verifica que Vercel los haya detectado correctamente en el dashboard.

### Paso 4: Configurar Variables de Entorno en Vercel

En la configuración del proyecto, ve a **Settings** > **Environment Variables**:

**Para Production, Preview y Development**:

```
PUBLIC_SUPABASE_URL=https://<tu-project-ref>.supabase.co
PUBLIC_SUPABASE_ANON_KEY=<tu-anon-key-de-supabase>
```

**Ejemplo**:
```
PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Paso 5: Deploy

1. Click en "Deploy"
2. Vercel construirá y desplegará automáticamente
3. Espera 2-5 minutos
4. Obtendrás una URL como: `https://qregalo-astro.vercel.app`

---

## 🔗 Parte 3: Configuración Post-Deployment

### Actualizar CORS en Supabase

1. Ve a Supabase Dashboard > **Project Settings** > **API**
2. En "CORS Configuration", agrega tu dominio de Vercel:
   ```
   https://qregalo-astro.vercel.app
   https://*.vercel.app
   ```

### Verificar Edge Function

La Edge Function estará disponible en:
```
https://<tu-project-ref>.supabase.co/functions/v1/ai-parse
```

Puedes probarla con:
```bash
curl -X POST https://<tu-project-ref>.supabase.co/functions/v1/ai-parse \
  -H "Authorization: Bearer <tu-anon-key>" \
  -H "Content-Type: application/json" \
  -d '{"query": "regalo para mi hermana"}'
```

---

## 📋 Checklist de Deployment

### Supabase ✅
- [ ] Proyecto creado en Supabase
- [ ] CLI linkeado al proyecto remoto
- [ ] Migraciones aplicadas (`supabase db push`)
- [ ] Seed data ejecutado (opcional)
- [ ] Edge Function deployada (`supabase functions deploy ai-parse`)
- [ ] Variables de entorno configuradas en Edge Function
- [ ] Credenciales guardadas (URL, anon key, service role key)

### Vercel ✅
- [ ] Repositorio conectado a Vercel
- [ ] Build settings configuradas correctamente
- [ ] Variables de entorno configuradas (`PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`)
- [ ] Deploy exitoso
- [ ] URL de producción funcionando

### Post-Deployment ✅
- [ ] CORS configurado en Supabase
- [ ] Edge Function probada y funcionando
- [ ] App web probada end-to-end
- [ ] Variables de entorno verificadas

---

## 🔧 Troubleshooting

### Error: "Cannot connect to Supabase"
- Verifica que `PUBLIC_SUPABASE_URL` y `PUBLIC_SUPABASE_ANON_KEY` estén correctos
- Verifica que CORS esté configurado en Supabase

### Error: "Edge Function not found"
- Verifica que la función esté deployada: `supabase functions list`
- Verifica que las variables de entorno estén configuradas: `supabase secrets list`

### Error: "Build failed in Vercel"
- Verifica que el build command sea correcto
- Verifica que todas las dependencias estén en `package.json`
- Revisa los logs de build en Vercel

### Error: "Module not found"
- Verifica que los workspaces estén configurados correctamente
- Asegúrate de que `npm install` se ejecute en la raíz

---

## 💰 Costos Post-Deployment

### Supabase Free Tier
- ✅ 500MB database (suficiente para MVP)
- ✅ 2GB bandwidth
- ✅ 50,000 monthly active users
- ✅ Edge Functions incluidas

### Vercel Free Tier
- ✅ 100GB bandwidth/mes
- ✅ Serverless functions ilimitadas
- ✅ Deployments ilimitados

**Total**: $0/mes para MVP (ver `COST_ESTIMATE.md` para detalles)

---

## 🔄 Actualizaciones Futuras

### Actualizar código
```bash
# Hacer cambios localmente
git add .
git commit -m "feat: nueva feature"
git push

# Vercel deployará automáticamente
# Supabase requiere deploy manual de funciones:
supabase functions deploy ai-parse
```

### Actualizar base de datos
```bash
# Crear nueva migración
supabase migration new nombre_migracion

# Editar el archivo SQL
# Push a producción
supabase db push
```

---

## 📚 Recursos

- [Supabase Docs](https://supabase.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Astro Deployment](https://docs.astro.build/en/guides/deploy/)

---

**Última actualización**: Enero 2024
