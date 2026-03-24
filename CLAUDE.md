# CLAUDE.md — Contexto para Claude Code

## Qué es este repositorio

`althara` es la **landing page pública de Althara** (althara.es). Presenta la plataforma de matching inmobiliario off-market al público. NO es la aplicación — la app está en `Althara_back`.

## Stack

Next.js 16 · React 19 · TypeScript · Tailwind 4 · shadcn/ui · Framer Motion · Lenis (smooth scroll) · next-intl (i18n)

## Comandos

```bash
pnpm install      # (tiene pnpm-lock, yarn.lock y package-lock — usar pnpm)
pnpm dev           # Dev server (turbopack)
pnpm build         # Build producción
pnpm lint          # ESLint
```

## Estructura

- `src/` — Código fuente
- `docs/` — Documentación interna
- `public/` — Assets estáticos

## Contexto

- Landing estática multi-idioma — NO tiene backend
- Organización GitHub: `gestionDP/LandingAlthara`
- Branch principal: `dev`
- Marca: Althara — inversión inmobiliaria off-market
- **No confundir con `Althara_back`** (la aplicación completa)
