# RunPas — Contexto para Claude Code

## Qué es este proyecto
Web de running para un grupo de corredores. Nombre: **RunPas** (Run + Pas = paso en catalán).
Repo: https://github.com/polMarsol/RunPas

Funcionalidades:
- Subir carreras (distancia, tiempo, GPX)
- Clasificación (leaderboard) por categorías: 5K, 10K, Mitja Marató, Marató, Trail, Ultra
- Blog de entrenamiento
- Sync con Strava
- Estadísticas personales
- Auth con email/Google via Supabase

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | Jekyll + tema Chirpy (dark mode, blog, sidebar) |
| Auth + DB | Supabase (PostgreSQL, gratis, en la nube) |
| Storage | Supabase Storage (archivos GPX, avatares) |
| Deploy | GitHub Pages via GitHub Actions |
| Strava | Strava API v3 (OAuth + sync actividades) |

**No hay backend propio.** Todo es Supabase + GitHub Pages. Nada que "encender".

## Estructura de carpetas

```
RunPas/
├── CLAUDE.md                        ← estás aquí
├── _config.yml                      ← Jekyll config (Supabase keys aquí)
├── Gemfile
├── _posts/                          ← posts del blog (markdown)
├── _pages/
│   ├── races.md                     ← página carreras
│   ├── leaderboard.md               ← clasificación
│   ├── profile.md                   ← perfil usuario
│   └── about.md
├── _includes/
│   └── supabase-config.html         ← inyecta keys en <head>
├── assets/
│   ├── js/
│   │   ├── supabase-client.js       ← cliente JS + helpers
│   │   ├── auth.js                  ← login/registro modal
│   │   └── races.js                 ← lógica carreras
│   ├── css/
│   │   └── runpas.scss              ← overrides del tema Chirpy
│   └── img/
├── supabase/
│   ├── schema.sql                   ← esquema BD completo
│   └── functions/
│       └── strava-sync/             ← Edge Function sync Strava
└── .github/
    └── workflows/
        └── deploy.yml               ← CI/CD GitHub Pages
```

## Base de datos (Supabase)

Tablas principales:
- `profiles` — extiende auth.users (username, strava_id, total_km, total_races)
- `races` — carreras (user_id, distancia, tiempo, elevación, GPX url, strava_activity_id)
- `race_categories` — 5K / 10K / Mitja / Marató / Trail / Ultra
- `leaderboard` — vista materializada con rankings

Ver esquema completo en `supabase/schema.sql`.

## Variables de entorno

En `_config.yml` (públicas, seguro exponerlas):
```yaml
supabase:
  url: "https://xxxx.supabase.co"
  anon_key: "eyJ..."
strava:
  client_id: "12345"
```

En `.env` (NUNCA subir a git):
```
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # solo Edge Functions
STRAVA_CLIENT_SECRET=xxx
```

## Comandos frecuentes

```bash
bundle exec jekyll serve --livereload   # dev local en localhost:4000/RunPas
bundle exec jekyll build                # build producción
bundle install                          # instalar gems
npx supabase db push                    # aplicar schema a Supabase
npx supabase functions deploy strava-sync
```

## Convenciones

- JS: ES6+ vanilla, async/await, módulos ES (import/export), sin frameworks
- CSS: SCSS, variables CSS para colores, respetar variables de Chirpy
- Jekyll: liquid templates, front matter YAML
- Posts: nombrar `YYYY-MM-DD-titulo.md`
- Commits: inglés, convencional (`feat:`, `fix:`, `docs:`, `style:`)
- Idioma web: catalán (ca-ES) con algunas cosas en español/inglés

## Colores RunPas

```
Primario:  #FF6B35  (naranja energético)
Strava:    #FC4C02  (naranja Strava, para links Strava)
Oscuro:    #1a1a2e
```
Chirpy gestiona dark/light mode. Sobreescribir en `assets/css/runpas.scss`.

## Auth flow (Supabase)

1. Modal login/registro → Supabase devuelve JWT
2. JWT guardado en localStorage por el SDK de Supabase
3. Requests autenticados con el JWT en headers (automático con el cliente)
4. RLS activado en Supabase: cada usuario solo edita sus propias carreras
5. Trigger en Supabase crea `profiles` automáticamente al registrarse

## Strava OAuth flow

1. Botón "Connecta Strava" → redirect a strava.com/oauth
2. Strava redirige a `/callback?code=xxx`
3. Edge Function intercambia code por tokens
4. Tokens guardados en `profiles.strava_access_token` (encriptados)
5. Edge Function `strava-sync` importa actividades → inserta en `races`

## Estado del proyecto (MVP pendiente)

- [x] Estructura de archivos base
- [x] Schema Supabase (profiles, races, race_categories, leaderboard view, RLS, storage)
- [x] Cliente JS Supabase
- [x] Chirpy starter instalado y configurado (dark mode, baseurl /RunPas)
- [x] Conectar Supabase (proyecto: lawjhifwipybovfceqyv.supabase.co)
- [x] Auth modal funcional (login/registro/logout)
- [x] Formulario subir carrera funcional (visible si logueado)
- [x] Leaderboard funcional (filtro por categoría)
- [x] Deploy en GitHub Pages (GitHub Actions)
- [x] Diseño deportivo (Inter + Barlow Condensed, #FF6B35, dark)
- [ ] Perfil de usuario
- [ ] Integración Strava
- [ ] Mapa GPX con Leaflet

## Quirks importantes de Chirpy v7.5
- Hook de head: `_includes/metadata-hook.html` (NO head.html ni head/custom.html)
- `layout: home` NO renderiza `{{ content }}` — usar `layout: page` para home custom
- CSS custom: `assets/css/runpas.scss` con front matter `---`
