import { readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const assetsDir = join(process.cwd(), 'dist', 'assets');

function format(bytes) {
  const units = ['B', 'KB', 'MB'];
  let size = bytes;
  let idx = 0;
  while (size > 1024 && idx < units.length - 1) {
    size /= 1024;
    idx++;
  }
  return `${size.toFixed(2)} ${units[idx]}`;
}

if (!statSync(assetsDir, { throwIfNoEntry: false })) {
  console.error('No se encontró dist/assets. Ejecuta npm run build primero.');
  process.exit(1);
}

const files = readdirSync(assetsDir);
const totals = { js: 0, css: 0, other: 0 };

files.forEach((file) => {
  const size = statSync(join(assetsDir, file)).size;
  const ext = extname(file);
  if (ext === '.js') totals.js += size;
  else if (ext === '.css') totals.css += size;
  else totals.other += size;
});

console.log('Bundle sizes (post-build):');
console.log(`  JS:   ${format(totals.js)}`);
console.log(`  CSS:  ${format(totals.css)}`);
console.log(`  Other:${totals.other ? ` ${format(totals.other)}` : ' 0B'}`);
