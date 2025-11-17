const fs = require('fs');
const path = require('path');

// A tiny 16x16 PNG (red square) base64
const b64 = '
iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAH0lEQVQ4T2NkoBAwUqifgYGBgYGBg
YGBgYGBgYEAAGbgB/q3yqkAAAAASUVORK5CYII=';

const outDir = path.join(__dirname, '..', 'build');
if(!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, 'icon.png');
const data = Buffer.from(b64, 'base64');
fs.writeFileSync(outPath, data);
console.log('Wrote icon:', outPath);
