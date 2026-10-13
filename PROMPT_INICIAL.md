Vas a continuar el desarrollo de una app existente: "Entrenamiento Inteligente" (React + TypeScript + Vite +
Tailwind v4 + Supabase), adjunta como proyecto. Antes de tocar nada:

1. Lee `HANDOFF.md` completo (estado, trampas conocidas, plan y reglas).
2. Ejecuta `npm install && npx tsc --noEmit && npm run test && npm run build` y confirma la línea base
   (tsc limpio, 48/48 tests, build OK). Si algo falla, repórtalo antes de continuar.
3. Trabaja en el orden del §7 del HANDOFF, empezando por aplicar `supabase/schema.sql` en el proyecto
   Supabase `bwnjqkiepmmndhisxshn` (si tienes el MCP de Supabase usa `apply_migration`; si no, indícame que lo
   pegue en el SQL Editor) y luego revisar los advisors de seguridad.
4. Reglas: no romper el modo local (localStorage), no usar la service_role key en el frontend, no inventar
   referencias científicas, verificar con tsc/test/build tras cada cambio, y actualizar HANDOFF.md al terminar cada hito.

Responde primero con un resumen de lo que entendiste y el plan de la primera sesión; después empieza.
