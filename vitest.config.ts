import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    // Aunque exista .env.local con credenciales reales, los tests de degradación segura
    // (runningCloud / hyroxOcrCloud) deben correr SIN Supabase configurado.
    env: { VITE_SUPABASE_URL: '', VITE_SUPABASE_ANON_KEY: '' },
  },
});
