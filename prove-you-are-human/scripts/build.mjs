/**
 * Bilibili Toy Production Build & ZIP Packager (Zero external dependencies)
 *
 * Usage: node scripts/build.mjs
 * Outputs:
 *   - dist/                               (hashed static bundle, DEFAULT_DEBUG=false)
 *   - release/prove-you-are-human-toy.zip (POSIX-path ZIP with index.html at root)
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const RELEASE = path.join(ROOT, 'release');
const ZIP_PATH = path.join(RELEASE, 'prove-you-are-human-toy.zip');

function sha8(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex').slice(0, 8);
}

function readUtf8(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

function writeDist(relPosix, content) {
  const full = path.join(DIST, ...relPosix.split('/'));
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  return full;
}

// Standard CRC32 for ZIP archive entries
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  }
  return (c ^ 0xFFFFFFFF) >>> 0;
}

/**
 * Create a standard Deflate ZIP with guaranteed POSIX "/" paths (safe for Linux/Bilibili servers).
 */
function createZip(entries) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  const now = new Date();
  const dosTime = ((now.getHours() & 0x1F) << 11) | ((now.getMinutes() & 0x3F) << 5) | ((now.getSeconds() >> 1) & 0x1F);
  const dosDate = (((Math.max(1980, now.getFullYear()) - 1980) & 0x7F) << 9) | (((now.getMonth() + 1) & 0x0F) << 5) | (now.getDate() & 0x1F);

  for (const { name, data } of entries) {
    const nameBuf = Buffer.from(name.replace(/\\/g, '/'), 'utf8');
    const rawBuf = Buffer.isBuffer(data) ? data : Buffer.from(data, 'utf8');
    const compBuf = zlib.deflateRawSync(rawBuf, { level: 9 });
    const crc = crc32(rawBuf);

    // Local File Header (30 bytes + name)
    const lh = Buffer.alloc(30);
    lh.writeUInt32LE(0x04034B50, 0);
    lh.writeUInt16LE(20, 4);           // version needed
    lh.writeUInt16LE(0x0800, 6);       // UTF-8 flag
    lh.writeUInt16LE(8, 8);            // Deflate method
    lh.writeUInt16LE(dosTime, 10);
    lh.writeUInt16LE(dosDate, 12);
    lh.writeUInt32LE(crc, 14);
    lh.writeUInt32LE(compBuf.length, 18);
    lh.writeUInt32LE(rawBuf.length, 22);
    lh.writeUInt16LE(nameBuf.length, 26);
    lh.writeUInt16LE(0, 28);

    localParts.push(lh, nameBuf, compBuf);

    // Central Directory Header (46 bytes + name)
    const ch = Buffer.alloc(46);
    ch.writeUInt32LE(0x02014B50, 0);
    ch.writeUInt16LE(20, 4);
    ch.writeUInt16LE(20, 6);
    ch.writeUInt16LE(0x0800, 8);
    ch.writeUInt16LE(8, 10);
    ch.writeUInt16LE(dosTime, 12);
    ch.writeUInt16LE(dosDate, 14);
    ch.writeUInt32LE(crc, 16);
    ch.writeUInt32LE(compBuf.length, 20);
    ch.writeUInt32LE(rawBuf.length, 24);
    ch.writeUInt16LE(nameBuf.length, 28);
    ch.writeUInt16LE(0, 30);
    ch.writeUInt16LE(0, 32);
    ch.writeUInt16LE(0, 34);
    ch.writeUInt16LE(0, 36);
    ch.writeUInt32LE(0, 38);
    ch.writeUInt32LE(offset, 42);

    centralParts.push(ch, nameBuf);
    offset += lh.length + nameBuf.length + compBuf.length;
  }

  const centralBuf = Buffer.concat(centralParts);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054B50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(entries.length, 8);
  eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(centralBuf.length, 12);
  eocd.writeUInt32LE(offset, 16);
  eocd.writeUInt16LE(0, 20);

  return Buffer.concat([...localParts, centralBuf, eocd]);
}

function build() {
  fs.rmSync(DIST, { recursive: true, force: true });
  fs.mkdirSync(DIST, { recursive: true });
  fs.mkdirSync(RELEASE, { recursive: true });

  const emitted = []; // { name, data }
  const hashedMap = new Map(); // srcRel -> distRel

  const emitHashed = (srcRel, transform = (s) => s) => {
    const code = transform(readUtf8(srcRel));
    const hash = sha8(code);
    const ext = path.posix.extname(srcRel);
    const base = srcRel.slice(0, -ext.length);
    const distRel = `${base}.${hash}${ext}`;
    const full = writeDist(distRel, code);
    if (ext === '.js') {
      execFileSync(process.execPath, ['--check', full], { stdio: 'inherit' });
    }
    hashedMap.set(srcRel, distRel);
    emitted.push({ name: distRel, data: Buffer.from(code, 'utf8') });
    return distRel;
  };

  // 1. Leaf assets (CSS + Leaf JS modules)
  const cssDist = emitHashed('css/style.css');
  const ch1Dist = emitHashed('js/levels/ch1.js');
  const ch2Dist = emitHashed('js/levels/ch2.js');
  const ch3Dist = emitHashed('js/levels/ch3.js');
  const ch4Dist = emitHashed('js/levels/ch4.js');
  const audioDist = emitHashed('js/audio.js');
  const sdkDist = emitHashed('js/toy-sdk.js');
  const posterDist = emitHashed('js/poster.js');

  // 2. Levels registry (rewrite ch1..ch4 imports)
  const levelsIdxDist = emitHashed('js/levels/index.js', (s) => s
    .replace('./ch1.js', `./${path.posix.basename(ch1Dist)}`)
    .replace('./ch2.js', `./${path.posix.basename(ch2Dist)}`)
    .replace('./ch3.js', `./${path.posix.basename(ch3Dist)}`)
    .replace('./ch4.js', `./${path.posix.basename(ch4Dist)}`)
  );

  // 3. Main entry (disable DEFAULT_DEBUG in production & rewrite module imports)
  const mainDist = emitHashed('js/main.js', (s) => s
    .replace('const DEFAULT_DEBUG = true;', 'const DEFAULT_DEBUG = false;')
    .replace('./audio.js', `./${path.posix.basename(audioDist)}`)
    .replace('./toy-sdk.js', `./${path.posix.basename(sdkDist)}`)
    .replace('./poster.js', `./${path.posix.basename(posterDist)}`)
    .replace('./levels/index.js', `./levels/${path.posix.basename(levelsIdxDist)}`)
  );

  // 4. Root index.html (must stay unhashed at ZIP root per Bilibili Toy spec)
  const htmlCode = readUtf8('index.html')
    .replace('./css/style.css', `./${cssDist}`)
    .replace('./js/main.js', `./${mainDist}`);
  writeDist('index.html', htmlCode);
  emitted.unshift({ name: 'index.html', data: Buffer.from(htmlCode, 'utf8') });

  // 5. Static Bilibili Toy pre-flight checks
  const htmlBytes = Buffer.byteLength(htmlCode, 'utf8');
  if (htmlBytes >= 1024 * 1024) {
    throw new Error(`ERROR: index.html exceeds 1MB limit (${htmlBytes} bytes)`);
  }

  let rawTotalBytes = 0;
  for (const item of emitted) {
    rawTotalBytes += item.data.length;
    const text = item.data.toString('utf8');
    if (/https?:\/\/|src="\/|href="\//.test(text)) {
      throw new Error(`ERROR: Forbidden external or root-absolute reference found in ${item.name}`);
    }
    if (item.name.includes('main.') && text.includes('const DEFAULT_DEBUG = true')) {
      throw new Error('ERROR: DEFAULT_DEBUG is still true in production main.js');
    }
    // Verify every relative import/src/href resolves to an emitted file in dist/
    const baseDir = path.posix.dirname(item.name);
    const refRe = /(?:from\s+['"]|src=['"]|href=['"])(\.[^'"]+)['"]/g;
    let match;
    while ((match = refRe.exec(text))) {
      const resolved = path.posix.normalize(baseDir === '.' ? match[1] : `${baseDir}/${match[1]}`);
      if (!fs.existsSync(path.join(DIST, ...resolved.split('/')))) {
        throw new Error(`ERROR: Broken relative reference in ${item.name} -> ${match[1]} (${resolved})`);
      }
    }
  }

  // 6. Write POSIX-safe ZIP
  const zipBuf = createZip(emitted);
  fs.writeFileSync(ZIP_PATH, zipBuf);

  console.log('=== Bilibili Toy Production Build Complete ===');
  console.log(`Files bundled : ${emitted.length}`);
  console.log(`index.html    : ${(htmlBytes / 1024).toFixed(2)} KB (< 1024 KB limit OK)`);
  console.log(`Unzipped size : ${(rawTotalBytes / 1024).toFixed(2)} KB`);
  console.log(`ZIP archive   : ${(zipBuf.length / 1024).toFixed(2)} KB -> ${path.relative(ROOT, ZIP_PATH)}`);
  console.log('Entries:');
  emitted.forEach((e) => console.log(`  - ${e.name} (${(e.data.length / 1024).toFixed(2)} KB)`));
}

build();
