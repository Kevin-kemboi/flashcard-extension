import { copyFileSync, mkdirSync, existsSync } from 'fs';
import { statSync } from 'fs';

function ensureDir(p){ try { mkdirSync(p,{recursive:true}); } catch(e) {} }

if(!existsSync('gesture-core/test.html')) {
  console.error('[copy] gesture-core/test.html missing');
  process.exit(0);
}

if(!existsSync('gesture-core/bundle.js')) {
  console.log('[copy] bundle.js not built yet -> building suggestion: npm run build:gestures');
}

ensureDir('site/gesture-core');
try { copyFileSync('gesture-core/test.html','site/gesture-core/test.html'); } catch(e){ console.error('[copy] test.html copy failed', e); }
if (existsSync('gesture-core/bundle.js')) {
  try { copyFileSync('gesture-core/bundle.js','site/gesture-core/bundle.js'); } catch(e){ console.error('[copy] bundle copy failed', e); }
}
console.log('[copy] Gesture demo assets copied into site/gesture-core');
