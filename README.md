# Entrenamiento Inteligente 💪

Aplicación web de entrenamiento con rutinas de **fuerza**, **hipertrofia** y **cardio HIIT**, diseñada
para maximizar la eficacia del entrenamiento con base en evidencia científica actual.

## Módulos

- **Plan Semanal (4 días):** split Torso/Pierna × Fuerza/Hipertrofia, entrenando cada grupo
  muscular 2 veces por semana. Incluye finishers AMRAP y temporizador de descanso.
- **Entrenamiento Rápido (A/B):** sesión independiente de tren inferior o superior, generada al
  instante para cuando no puedes seguir el plan semanal completo.
- **Cardio HIIT:** tres protocolos de intervalos (Tabata Express, Quemador Metabólico, Pirámide de
  Resistencia) con temporizador acústico asistido.
- **Ciencia del Entrenamiento:** panel accesible desde el encabezado (icono ℹ️) que explica los
  principios aplicados en cada rutina.

## Principios científicos aplicados

- **Volumen:** 10-20 series efectivas por grupo muscular a la semana (Schoenfeld et al., 2017).
- **Frecuencia:** cada grupo muscular se entrena 2 veces por semana (Schoenfeld et al., 2016).
- **RIR (Repeticiones en Reserva):** cada ejercicio indica cuánto esfuerzo aplicar — más margen
  técnico en compuestos pesados, más cercanía al fallo en aislamiento (Helms, Zourdos et al.).
- **Descanso entre series:** calibrado por tipo de ejercicio (~150s en fuerza, ~90-120s en
  compuestos de hipertrofia, ~45-60s en aislamiento/core), acorde a Grgic et al. (2017) y
  Schoenfeld et al. (2016).
- **Sobrecarga progresiva automática:** cada vez que marcas un ejercicio como completado, la app
  guarda tu peso y reps en un historial y calcula tu progresión por doble progresión (sube reps
  dentro del rango objetivo; al tocar el techo, sugiere subir el peso ~4%). También estima tu 1RM
  con la fórmula de Epley para mostrar la tendencia de fuerza sesión a sesión.
- **Periodización:** al iniciar una nueva semana se conservan los pesos como referencia, y la app
  avisa cuando llevas 5 o más semanas con la misma rutina, sugiriendo una semana de descarga
  (deload).

## Multi-perfil

Cada apodo/nombre tiene su propio espacio aislado (rutinas, pesos, progreso y nivel), todo
almacenado localmente en el navegador (`localStorage`) — no requiere backend ni cuenta.

## Sincronización en la nube (opcional)

El módulo **Running** puede sincronizar tus carreras entre dispositivos usando tu propia base de
datos en [Supabase](https://supabase.com) (plan gratis). Es completamente opcional — sin
configurarlo, todo sigue funcionando 100% local exactamente como antes.

**Activarla (una sola vez, ~5 minutos):**
1. Crea una cuenta y un proyecto gratis en [supabase.com](https://supabase.com).
2. En tu proyecto, ve a **SQL Editor > New query**, pega el contenido de
   [`supabase/schema.sql`](supabase/schema.sql) y ejecútalo. Esto crea las tablas y activa
   *Row Level Security* (cada persona solo puede ver y modificar sus propios datos).
3. Ve a **Project Settings > API** y copia el **Project URL** y la clave **anon public**.
4. Copia `.env.example` a `.env.local` y pega esos dos valores ahí.
5. Reinicia `npm run dev`. En el módulo Running verás un botón "Sincronizar" — al escribir tu
   correo, recibes un enlace mágico para entrar sin contraseña.

Por ahora Running y Hyrox/OCR están migrados a la nube; Semanal y Rápido siguen siendo locales
hasta que se migren en un paso posterior (la tabla `exercise_logs` para eso ya está creada en
`supabase/schema.sql`, lista para cuando llegue ese momento — esa migración es más compleja
porque esos dos módulos, a diferencia de Running y Hyrox/OCR, viven dentro del componente
principal de la app en vez de ser módulos independientes).

## Ejecutar en local

**Requisito:** Node.js

1. Instala las dependencias:
   ```
   npm install
   ```
2. Ejecuta la app:
   ```
   npm run dev
   ```
3. Abre la URL que indique la terminal (por defecto `http://localhost:3000`).

> Nota: por defecto esta app funciona 100% en el navegador, sin llamadas a ningún servicio externo
> ni claves de API. La única excepción es la sincronización en la nube del módulo Running, y es
> opcional (ver sección anterior).

## Pruebas automatizadas

La lógica científica (progresión adaptativa, running, Hyrox, OCR y los generadores de rutinas)
tiene pruebas unitarias con [Vitest](https://vitest.dev):

```
npm run test        # corre toda la suite una vez
npm run test:watch  # modo watch mientras desarrollas
```

Estas pruebas no cubren la interfaz (componentes React) — cubren las funciones puras que deciden
qué le sugiere la app a cada persona, que es donde un error tendría más impacto real.

## Build de producción

```
npm run build
```

Genera los archivos estáticos en `dist/`, listos para desplegar en cualquier hosting estático.

## Traspaso / estado del proyecto

Estado actual, plan pendiente, trampas conocidas y lo no verificado: ver [`HANDOFF.md`](HANDOFF.md).
