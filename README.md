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
| `BETTER_AUTH_URL` | URL de producción, p. ej. `https://imladris-seven.vercel.app` |

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
- [ ] Email de invitación (Resend — conectado; falta cablear en código)
- [ ] Vars Better Auth + deploy (`BETTER_AUTH_*`, dominio imladris.online)
- [ ] API Route Handlers por dominio
- [ ] UI completa de cada fase
- [ ] PWA offline + Web Push
- [ ] Mapa 2D → grafo → cielo 3D
