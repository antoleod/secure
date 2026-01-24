import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const distIndex = join(process.cwd(), 'dist', 'index.html');

if (!existsSync(distIndex)) {
  throw new Error('dist/index.html no existe. Asegura que el build de Vite se ejecute antes de deployar.');
}

const html = readFileSync(distIndex, 'utf-8');

if (html.includes('%BASE_URL%') || html.includes('src/main.tsx')) {
  throw new Error('El build parece apuntar a /src/main.tsx o contiene %BASE_URL%. Revisa la configuracion de Vite/base.');
}

if (!html.includes('/assets/')) {
  console.warn('WARN: index.html no contiene referencias a /assets/. Verifica rutas de recursos.');
}

console.log('✓ dist/index.html verificado: sin %BASE_URL% y sin referencias a /src/main.tsx');
