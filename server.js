const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const ROOT = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.webp': 'image/webp',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.webmanifest': 'application/manifest+json',
};

const CDN_BASE = 'https://horizons-cdn.hostinger.com/a38af39a-ec2d-4547-a076-5363b58ab7df';

function proxyUrl(url, res) {
  https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (upstream) => {
    res.writeHead(upstream.statusCode, {
      'Content-Type': upstream.headers['content-type'] || 'application/octet-stream',
    });
    upstream.pipe(res);
  }).on('error', () => {
    res.writeHead(502);
    res.end('Proxy error');
  });
}

const server = http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0];

  // ── CORS / health ─────────────────────────────────────────────────────────
  if (urlPath === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', server: 'My Edibles Chef Local' }));
    return;
  }

  // Resolve to filesystem path
  let filePath = path.join(ROOT, urlPath);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  // File exists → serve it
  if (fs.existsSync(filePath)) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    fs.readFile(filePath, (err, data) => {
      if (err) { res.writeHead(500); res.end('Server Error'); return; }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
    return;
  }

  // Missing /images/* → proxy from CDN
  if (urlPath.startsWith('/images/')) {
    const fname = path.basename(urlPath);
    console.log(`[proxy] CDN image: ${fname}`);
    proxyUrl(`${CDN_BASE}/${fname}`, res);
    return;
  }

  // Missing /assets/*.js → proxy from live site
  if (urlPath.startsWith('/assets/') && urlPath.endsWith('.js')) {
    const fname = path.basename(urlPath);
    console.log(`[proxy] JS chunk: ${fname}`);
    proxyUrl(`https://myedibleschef.com/assets/${fname}`, res);
    return;
  }

  // SPA fallback for all unknown paths (React Router routes)
  const ext = path.extname(urlPath);
  if (!ext) {
    const indexPath = path.join(ROOT, 'index.html');
    fs.readFile(indexPath, (err, data) => {
      if (err) { res.writeHead(500); res.end('Server Error'); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(data);
    });
    return;
  }

  res.writeHead(404);
  res.end('Not Found');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n✅  My Edibles Chef — Local Server`);
  console.log(`   ➜  http://localhost:${PORT}`);
  console.log(`\n   Missing chunk JS files and CDN images will be auto-proxied.`);
  console.log(`   Run ./download-missing.sh to cache them locally for offline use.\n`);
});
