# El Consejo de Elrond (Imladris)

La puerta de entrada a un lugar que solo cobra vida cuando el Consejo está por reunirse.

Repositorio: [Bohemianmage/imladris](https://github.com/Bohemianmage/imladris)

## Principios

- El Consejo es el protagonista.
- Pocas acciones, máxima intención.
- La aplicación cambia según el estado del Consejo.
- Mobile-first; se siente como abrir un libro antiguo.

## Cinco dominios

1. **Coordinación** — convocatoria, disponibilidad, quórum, propuestas de fecha
2. **Selección** — banco de temas, enfoques, reglas del Consejo
3. **Reunión** — cuenta regresiva y ritual del próximo Consejo
4. **Bitácora** — reflexiones durante 72h tras finalizar
5. **Mapa del Conocimiento** — huella visual de la historia intelectual

## Stack

- Next.js 15 (App Router) · TypeScript · Tailwind CSS v4
- Zustand · TanStack Query · Framer Motion
- Prisma · Neon Postgres · Better Auth (solo por invitación)
- React Three Fiber (mapa, cuando aporte valor narrativo)
- Vercel

## Infra

- **Neon** vive en Vercel (Production / Preview / Development). No hace falta Postgres local.
- En cada deploy: `prisma migrate deploy` crea/actualiza tablas.
- Auth: Better Auth; el primer usuario entra por `/fundar`; el resto solo con enlace de invitación.

### Variables en Vercel

| Variable | Origen |
|----------|--------|
| `DATABASE_URL` | Neon (Marketplace) |
| `BETTER_AUTH_SECRET` | Secreto aleatorio (32+ bytes hex) |
| `BETTER_AUTH_URL` | URL de producción, p. ej. `https://imladris.online` |
| `RESEND_API_KEY` / `RESEND_FROM_EMAIL` | Resend — preferible `Imladris <consejo@imladris.online>` (dominio verificado) |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` | Web Push (`npm run push:vapid`) |
| `VAPID_SUBJECT` | `mailto:…` (opcional) |
| `CRON_SECRET` | Secreto para `/api/cron/lifecycle` (además del header de Vercel Cron) |

## Arranque local (UI / ritual sin DB)

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). Auth e invitaciones corren contra Neon en los deploys de Vercel.

## Design Constitution

Las reglas inviolables viven en `.cursor/rules/`. Si una decisión las contradice, se rechaza.

## Estado del arranque

- [x] Scaffold + identidad visual + portal (estado CERRADO / CONVOCATORIA)
- [x] Schema Prisma de los cinco dominios + invitaciones
- [x] Motor de coincidencias y motor de reglas (sin IA)
- [x] Better Auth invite-only (fundar + `/invitar/[token]`)
- [x] Transición unificada (velo) entre fases y rutas
- [x] Stubs `/bitacora` y `/mapa` (miembro)
- [x] Iconos / logo Lucide (SVG + PNG + PWA)
- [x] Landing con login (sin convocatoria pública)
- [x] Invitaciones por email (Resend)
- [x] Coordinación: convocatoria → disponibilidad → quórum → confirmación
- [x] Selección (temas / enfoques / reglas)
- [x] Reunión dominante (countdown → en curso → bitácora)
- [x] Bitácora real (72h) + Mapa 2D / grafo / cielo 3D
- [x] PWA (service worker) + Web Push (opt-in)
- [x] Asistencia, rotar enlace, cron de fases, remitente imladris.online
