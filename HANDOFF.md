# Traspaso — FitMax (Entrenamiento Híbrido & Mi Combo)

App web progresiva (PWA) de entrenamiento (React 19 + TypeScript + Vite 6 + Tailwind v4 + Supabase) para atletas híbridos, deportistas de fuerza/musculación y corredores, con rutinas basadas en evidencia, progresión adaptativa, running polarizado 80/20, Hyrox/OCR con carrera comprometida, comunidad "Mi Combo", motor de viralidad (WhatsApp), sistema de monetización inteligente (PRO / Beta Lifetime) y consola de administración para el propietario.

---

## 1. Cómo correrla
```bash
npm install
npm run dev      # Servidor local en http://localhost:5173
npm run test     # 98 pruebas (Vitest) — 17 suites limpias
npm run build    # Build de producción Vite
npx tsc --noEmit # Chequeo estricto de tipos TypeScript
```
**Línea base actual verificada**: `tsc` limpio (0 errores), **98/98 tests pasando** en 17 archivos de prueba, `vite build` completado exitosamente (dist generado en ~4.7s).

---

## 2. Estado de Funcionalidades (✅ Construido | ⬜ Pendiente)

| Área / Módulo | Estado | Detalles Técnicos |
|---|---|---|
| **Identidad FitMax & PWA Móvil** | ✅ | Nombre de marca **FitMax**, logotipo vectorial SVG neón en `/public/icon.svg` y `/public/favicon.svg`. Manifiesto PWA (`manifest.webmanifest`), pantalla completa `standalone`, soporte para añadir a pantalla de inicio en iPhone/Android y botón de instalación en el header. |
| **Estrategia "Modo Puerta Abierta" (Soft Wall)** | ✅ | **Nivel 1 (Invitado / Cero fricción)**: Entrena, corre, calcula mesociclos y gana medallas en `localStorage` sin registrarse ni escribir contraseñas. **Nivel 2 (El Gancho Social)**: Intercepta con `SoftWallModal.tsx` y `softWallConfig.ts` ante: 1) «Unirme al Combo de mi Box», 2) «Compartir mi rutina con mi compañero de Hyrox», 3) «Subir una foto al muro del reto», 4) «Sincronizarme con mi Combo en la Nube». Ofrece Magic Link en 5s con opción de escape para continuar como invitado sin fricción. |
| **Comunidad "Mi Combo" y Podio de Honor** | ✅ | Terminología colombiana orgánica (*Mi Combo*, *Capitán*, *Combos Activos*). Códigos únicos de 6 caracteres (ej. `#HYR202`) para invitar atletas. Clonación instantánea de rutinas oficiales del combo, feed de check-in diario y **Podio de Honor del Combo** (Top 3 🥇 Oro, 🥈 Plata, 🥉 Bronce por racha de constancia). |
| **Motor de Viralidad (WhatsApp / Web Share API)** | ✅ | `share.ts` con generadores de mensajes pre-formateados para invitar al Combo, presumir medallas desbloqueadas y rachas de días consecutivos. Soporte para Web Share API nativa (móviles) con fallback automático a WhatsApp Web/Móvil y portapapeles. |
| **Monetización Inteligente & Membresía PRO** | ✅ | `SubscriptionModal.tsx` y `subscription.ts`: **Plan Free** ($0 para siempre), **FitMax PRO** ($14.900 COP / mes o $99.000 COP / año con 45% de ahorro) y **Beta Lifetime** (Pase vitalicio gratis). Cobro directo sin comisiones a Apple/Google vía Nequi, Daviplata o PSE con confirmación por WhatsApp en 1 clic. |
| **Fábrica de Cupones VIP (RPC Supabase)** | ✅ | Tabla `coupons` y función segura `redeem_coupon(p_code)`: códigos canjeables en 1 segundo (ej. `COMBOCALI`, `FITMAXVIP`, `BETALIFETIME`) para otorgar membresía vitalicia gratuita a los primeros amigos, atletas de box y evaluadores beta sin fricción de pago. |
| **Consola Administrativa FitMax (SuperAdmin)** | ✅ | `AdminModule.tsx`: Panel exclusivo del propietario protegido con clave maestra (`FITMAX_ADMIN_2026`) y RLS de administrador (`is_admin()`). Incluye: 1) **Métricas en tiempo real** (atletas totales, PRO, Beta, combos, check-ins), 2) **Gestor de Atletas con Upgrade de 1 Clic** (dar Beta Lifetime, dar PRO o pasar a Free), 3) **Creador de Cupones VIP** y 4) **Configuración de Canales de Cobro**. |
| **Base de datos Supabase, Storage y RLS** | ✅ | Proyecto `bwnjqkiepmmndhisxshn` con `profiles`, `running_logs`, `exercise_logs`, `hyroxocr_sessions`, `squads`, `squad_members`, `squad_checkins`, `squad_posts`, `coupons`, `coupon_redemptions`, `app_settings` y bucket público `squad_media` (límite 2 MB). RLS activo con 0 advertencias de seguridad. |
| **Muro Social y Subida de Fotos WebP** | ✅ | Feed comunitario dentro de cada combo. Compresión nativa en el navegador (`imageCompression.ts`) a WebP (máx 1080px, ~60-100 KB, ahorro del 95-98%), almacenamiento en Supabase Storage, visor a pantalla completa y reacciones interactivas (🔥, 👊, 💪) con audio feedback. |
| **Salón de Medallas y Retos** | ✅ | 12 insignias atléticas clasificadas por metales (`bronze`, `silver`, `gold`, `titanium`) en 4 áreas. Cálculo reactivo retroactivo con `evaluateBadges()`, 4 retos mensuales con inscripción e insignia de recompensa (`ChallengesModule.tsx`, `gamification.ts`), botón para presumir medalla en WhatsApp. |
| **Mesociclo Real por Sesiones (RP Model)** | ✅ | Rutina fija 4 días Torso/Pierna con selector de duración (4, 6, 8, 12 semanas). El progreso mide sesiones reales acumuladas sobre el total del bloque, con feedback inmediato por día completado, stepper manual de semanas y checkmarks de día. |
| **Planes de Running con Ritmo Objetivo** | ✅ | Generador estructurado (`runningPlans.ts`) para 5K, 10K, 21K y 42K según ritmo meta (min/km). 4 sesiones semanales (Z2, Series VO2 Máx, Umbral, Tirada Larga) con botón de registro rápido a historial. |
| **Hyrox / OCR y Claridad de Rondas** | ✅ | Formato circuito continuo oficial (Estación 1 $\rightarrow$ Estación 2 $\rightarrow$ ... = 1 Ronda). Bloques clickeables para inspeccionar biomecánica, grip tiers y compromised running. |
| **Sincronización Nube + Fallback Local** | ✅ | Funciona 100% offline en `localStorage`. Si el usuario inicia sesión (`useAuth`), sincroniza automáticamente perfil, suscripción, carreras, sesiones Hyrox/OCR, cuadrillas, check-ins y posts con fotos. |

---

## 3. Mapa del Proyecto

```
src/
  App.tsx                     # Orquestador: header con logo FitMax, botón PWA, botón PRO, Admin, navegación de módulos
  main.tsx                    # Envuelve <App/> con <AuthProvider>
  components/
    WeeklyModule.tsx          # Mesociclo 4-12 sem (2 meses), barra de progreso 0-100%, AMRAP 5/7/10m, ejercicios clickeables
    QuickModule.tsx           # Sesiones A/B por nivel, cronómetro descanso, ejercicios clickeables
    HiitModule.tsx            # Tabata, Quemador, Pirámide, botón cambiar ejercicios, ejercicios clickeables
    RunningModule.tsx         # Generador de plan 5K/10K/21K/42K con ritmo meta, registro libre, periodización pura
    HyroxOcrModule.tsx        # Hyrox/OCR, formato circuito continuo, grip tiers, compromised running, técnica
    ExerciseBankModule.tsx    # Explorador con filtros y diseñador de rutinas personalizadas
    ExerciseDetailModal.tsx   # Modal interactivo de técnica, pasos, respiración y errores comunes
    ChallengesModule.tsx      # Salón de medallas (12 badges) y retos comunitarios con compartir en WhatsApp
    SquadsModule.tsx          # "Mi Combo", podio Top 3, clonado de rutinas, muro con fotos WebP y check-in diario
    SoftWallModal.tsx         # Modal persuasivo del Soft Wall («Modo Puerta Abierta») con Magic Link y botón de escape
    SubscriptionModal.tsx     # Modal de membresía PRO, canje de cupones VIP y pagos directos por Nequi/Daviplata
    AdminModule.tsx           # Consola SuperAdmin: métricas de plataforma, upgrade de atletas de 1 clic y fábrica de cupones
    AuthScreen.tsx            # Modal de autenticación Supabase (Magic Link)
  lib/
    subscription.ts           # Servicio de suscripciones (Free, Pro, Beta Lifetime), cupones, RPCs y métricas
    subscription.test.ts      # Pruebas unitarias de tiers, canjes y reclamo de rol de administrador
    share.ts                  # Motor de viralidad para WhatsApp y Web Share API nativa
    share.test.ts             # Pruebas unitarias de generación de enlaces y compartición
    softWallConfig.ts         # Definiciones de ganchos sociales, textos persuasivos y propuesta de valor
    softWallConfig.test.ts    # Tests unitarios del motor de ganchos del Soft Wall
    imageCompression.ts       # Compresión en cliente a WebP (1080px, ~100 KB) y subida a Supabase Storage
    imageCompression.test.ts  # Pruebas de compresión y fallback de imágenes
    squads.ts                 # Motor de combos, códigos de 6 caracteres, miembros, check-ins, posts y reacciones
    squads.test.ts            # Pruebas unitarias de códigos, rachas y miembros de combo
    gamification.ts           # Motor de medallas (bronce a titanio), retos y evaluación reactiva
    gamification.test.ts      # Tests del sistema de gamificación y retos
    exerciseBank.ts           # Banco exhaustivo de ejercicios, técnica, variantes y buscador tolerante
    runningPlans.ts           # Motor de cálculo de ritmos y 4 sesiones semanales de atletismo
    runningPlans.test.ts      # Tests unitarios del planificador de carrera
    periodization.ts          # Fases de periodización inversa (distingue 'hybrid' vs 'running')
    autoregulation.ts         # Motor de autorregulación post-entrenamiento (3 toques)
    weeklyGenerator.ts        # Generador de 4 días Torso/Pierna y ejercicios alternativos
    generator.ts              # Generador de sesiones rápidas A/B
    progression.ts            # Cálculo de 1RM, doble progresión, sugerencias adaptativas
    running.ts / hyrox.ts / ocr.ts # Lógica deportiva, reglas 80/20, estaciones y suspensiones
    workoutRules.ts           # Reglas de descansos calibrados y RIR objetivo
    sound.ts                  # Web Audio API (pitido sin archivos externos)
    *.test.ts                 # 17 archivos de pruebas unitarias (98 tests)
```

---

## 4. Supabase (Configuración Activa)

- **Proyecto**: `bwnjqkiepmmndhisxshn` (Región us-west-2, Postgres 17).
- **Tablas aplicadas y securizadas**:
  1. `profiles`: `id`, `nickname`, `email`, `role` ('athlete' | 'admin'), `subscription_tier` ('free' | 'pro' | 'beta_lifetime'), `subscription_status`, `selected_level`, `weekly_routine`, `weekly_start_date`, etc.
  2. `coupons`: `id`, `code`, `tier`, `duration_days`, `max_uses`, `times_used`, `is_active`, `notes`, `created_at`.
  3. `coupon_redemptions`: `id`, `coupon_id`, `user_id`, `redeemed_at`.
  4. `app_settings`: `key`, `value` (jsonb con tarifas y canales de pago).
  5. `squads`, `squad_members`, `squad_checkins`, `squad_posts`.
  6. `running_logs`, `exercise_logs`, `hyroxocr_sessions`.
- **Funciones y Procedimientos Almacenados (RPC)**:
  - `public.redeem_coupon(p_code)`: Canje transaccional seguro de cupones para usuarios autenticados.
  - `public.is_admin(p_user_id)`: Validador de rol administrativo.
  - `public.claim_admin_role(p_secret)`: Reclamo de privilegios de administrador con clave maestra.
  - `public.admin_get_platform_metrics()`: Métricas globales de usuarios, planes y combos.
  - `public.admin_set_user_subscription()`: Modificación inmediata de membresías desde la consola de administración.
- **Almacenamiento (Storage)**:
  - Bucket público `squad_media` (límite 2 MB por archivo, WebP/PNG/JPEG).
- **Seguridad**:
  - Row Level Security (RLS) estricto en todas las tablas.
  - Verificación `get_advisors` (security): **0 lints / 0 advertencias**.

---

## 5. Claves y Accesos para el Propietario

- **Clave Maestra para Consola Admin**: `FITMAX_ADMIN_2026` o `COMBOCALI`.
- **Cupones Activos de Lanzamiento**:
  - `COMBOCALI` $\rightarrow$ Pase **Beta Lifetime Vitalicio** (para amigos y compañeros del box).
  - `FITMAXVIP` $\rightarrow$ Pase **Beta Lifetime Vitalicio** (para atletas fundadores).
  - `BETALIFETIME` $\rightarrow$ Pase **Beta Lifetime Vitalicio** (200 usos).
- **Precios sugeridos sin comisión de app stores**:
  - Plan Mensual: **$14.900 COP / mes** (~$3.99 USD).
  - Plan Anual: **$99.000 COP / año** (Ahorro del 45%, equivale a $8.250 COP / mes).

---

## 6. Reglas de Continuidad
- **Preservar el modo local**: `localStorage` no debe romperse bajo ninguna circunstancia (atletas pueden entrenar sin cuenta).
- **Seguridad**: Jamás incluir la clave `service_role` en el repositorio o en el bundle de frontend.
- **Rigor científico**: Basar progresiones, RIR y volumen en principios sólidos de hipertrofia y fisiología deportiva.
- **Verificación continua**: Ejecutar siempre `npx tsc --noEmit && npm run test && npm run build` tras realizar cambios.
