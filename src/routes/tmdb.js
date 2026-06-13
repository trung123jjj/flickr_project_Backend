const express = require('express');
const https = require('https');
const router = express.Router();

const TMDB_BASE = 'api.themoviedb.org';
const TMDB_TOKEN = process.env.TMDB_ACCESS_TOKEN;

let V3_API_KEY = '';
if (TMDB_TOKEN) {
  try {
    const payload = Buffer.from(TMDB_TOKEN.split('.')[1], 'base64').toString();
    V3_API_KEY = JSON.parse(payload).aud || '';
  } catch (e) {
    console.error('[TMDB Proxy] Failed to parse token:', e.message);
  }
} else {
  console.error('[TMDB Proxy] TMDB_ACCESS_TOKEN not set in environment');
}

router.use((req, res) => {
  const tmdbPath = '/3' + req.path;
  const query = new URLSearchParams(req.query).toString();
  const hasQuery = query.length > 0;
  const separator = hasQuery ? '&' : '?';
  const fullPath = `${tmdbPath}${query ? '?' + query : ''}${separator}api_key=${V3_API_KEY}`;

  if (!V3_API_KEY) {
    return res.status(500).json({ success: false, message: 'TMDB API key not configured' });
  }

  const options = {
    hostname: TMDB_BASE,
    path: fullPath,
    method: req.method,
    headers: {
      'Accept': 'application/json',
    },
  };

  const proxyReq = https.request(options, (proxyRes) => {
    let data = '';
    proxyRes.on('data', (chunk) => { data += chunk; });
    proxyRes.on('end', () => {
      res.status(proxyRes.statusCode);
      if (proxyRes.headers['content-type']) {
        res.setHeader('Content-Type', proxyRes.headers['content-type']);
      }
      res.send(data);
    });
  });

  proxyReq.on('error', (err) => {
    console.error('[TMDB Proxy] Error:', err.message);
    res.status(502).json({ success: false, message: 'TMDB proxy error: ' + err.message });
  });

  if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
    proxyReq.write(JSON.stringify(req.body));
  }
  proxyReq.end();
});

module.exports = router;
