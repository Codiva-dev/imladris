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
- Prisma · PostgreSQL · Better Auth (pendiente de cablear)
- React Three Fiber (mapa, cuando aporte valor narrativo)
- Vercel + Neon/Supabase

## Arranque local

```bash
npm install
cp .env.example .env
# Configura DATABASE_URL (Neon o Supabase)
npx prisma migrate dev --name init
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Design Constitution

Las reglas inviolables viven en `.cursor/rules/`. Si una decisión las contradice, se rechaza.

## Estado del arranque

- [x] Scaffold + identidad visual + portal (estado CERRADO / CONVOCATORIA)
- [x] Schema Prisma de los cinco dominios
- [x] Motor de coincidencias y motor de reglas (sin IA)
- [ ] Auth (Better Auth)
- [ ] API Route Handlers por dominio
- [ ] UI completa de cada fase
- [ ] PWA offline + Web Push
- [ ] Mapa 2D → grafo → cielo 3D
