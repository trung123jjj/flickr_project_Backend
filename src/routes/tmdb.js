const express = require('express');
const https = require('https');
const router = express.Router();

const TMDB_BASE = 'api.themoviedb.org';
const TMDB_TOKEN = process.env.TMDB_ACCESS_TOKEN || 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2MDQ2NjFmZGJmMjFlZDkxMzJiYTFjN2M2MzAxM2I5ZSIsIm5iZiI6MTc3NTM2NzMzOS40MjgsInN1YiI6IjY5ZDFmNGFiODNiYzliYjdkZTEwOGQwNSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.ixYRKjPwWeMtcsNiAWoFOOMOZyQNm4tt_rEP2ivubGE';

// Extract v3 API key from v4 JWT's "aud" claim (fallback)
let V3_API_KEY = '';
try {
  const payload = Buffer.from(TMDB_TOKEN.split('.')[1], 'base64').toString();
  const parsed = JSON.parse(payload);
  V3_API_KEY = parsed.aud || '';
} catch (e) {
  console.error('[TMDB Proxy] Failed to parse token:', e.message);
}

router.use((req, res) => {
  const tmdbPath = '/3' + req.path;
  const query = new URLSearchParams(req.query).toString();
  const separator = query ? '?' : '';

  const options = {
    hostname: TMDB_BASE,
    path: `${tmdbPath}${separator}${query}${query ? '&' : '?'}api_key=${V3_API_KEY}`,
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

  if (req.body && Object.keys(req.body).length > 0) {
    proxyReq.write(JSON.stringify(req.body));
  }
  proxyReq.end();
});

module.exports = router;
