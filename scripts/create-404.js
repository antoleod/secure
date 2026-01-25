import { copyFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const distDir = join(process.cwd(), 'dist')
const indexFile = join(distDir, 'index.html')
const fallbackFile = join(distDir, '404.html')

if (!existsSync(indexFile)) {
  throw new Error('No se encontró dist/index.html. Ejecuta el build antes de generar el fallback 404.')
}

copyFileSync(indexFile, fallbackFile)
console.log('✓ Generado dist/404.html como fallback SPA para GitHub Pages')
