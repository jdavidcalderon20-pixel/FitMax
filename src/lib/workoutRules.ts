// Reglas y recomendaciones basadas en evidencia científica de descanso y RIR

// Descanso recomendado (segundos) calibrado con evidencia científica:
// - Compuestos pesados / días de fuerza: >=2 min preserva mejor la fuerza y el volumen entre
//   series que descansos cortos (Schoenfeld et al. 2016; Grgic et al. 2017).
// - Aislamiento / accesorios / brazos: descansos de 45-60s son suficientes, ya que el costo
//   sistémico es menor y permiten mantener la densidad de la sesión.
// - Core / trabajo isométrico: descanso mínimo, se prioriza el volumen acumulado.
export const getRecommendedRest = (category: string): number => {
  const cat = category.toLowerCase();
  // Superseries: el descanso ya está integrado entre ambos movimientos del par
  if (cat.includes('superserie')) return 60;
  // Días de fuerza (marcados explícitamente) o híbridos fuerza-hipertrofia: descanso largo
  if (cat.includes('(fuerza)') || cat.includes('fuerza-hipertrofia')) return 150;
  // Trabajo unilateral: recuperación moderada entre lados
  if (cat.includes('unilateral')) return 90;
  // Core / abdomen: descanso corto, prioriza densidad
  if (cat.includes('core') || cat.includes('abdomen')) return 45;
  // Aislamiento / accesorios / brazos / laterales / pantorrillas: descanso corto-moderado
  if (
    cat.includes('aislamiento') ||
    cat.includes('accesorio') ||
    cat.includes('lateral') ||
    cat.includes('pantorrilla') ||
    cat.includes('brazos') ||
    cat.includes('bíceps') ||
    cat.includes('tríceps')
  ) {
    return 60;
  }
  // Compuestos principales por defecto (empuje/tracción/dominante de rodilla o cadera, remo, etc.)
  return 100;
};

// RIR objetivo (Repeticiones en Reserva) por categoría: guía de autorregulación del esfuerzo.
// Compuestos pesados dejan más margen técnico; aislamiento tolera acercarse más al fallo
// (Helms, Zourdos et al. — literatura de autorregulación vía RIR).
export const getTargetRIR = (category: string): string => {
  const cat = category.toLowerCase();
  if (cat.includes('(fuerza)') || cat.includes('fuerza-hipertrofia')) return '2-3';
  if (cat.includes('core') || cat.includes('abdomen')) return 'Al fallo controlado';
  if (cat.includes('superserie')) return '0-1';
  if (
    cat.includes('aislamiento') ||
    cat.includes('accesorio') ||
    cat.includes('lateral') ||
    cat.includes('pantorrilla') ||
    cat.includes('brazos') ||
    cat.includes('bíceps') ||
    cat.includes('tríceps')
  ) {
    return '0-1';
  }
  return '1-2';
};
