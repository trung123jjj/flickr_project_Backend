const express = require('express');
const https = require('https');
const router = express.Router();

const TMDB_BASE = 'api.themoviedb.org';
const TMDB_TOKEN = process.env.TMDB_ACCESS_TOKEN;

router.all('/{*path}', (req, res) => {
  const tmdbPath = '/3' + req.path;
  const query = new URLSearchParams(req.query).toString();
  const urlPath = query ? `${tmdbPath}?${query}` : tmdbPath;

  const options = {
    hostname: TMDB_BASE,
    path: urlPath,
    method: req.method,
    headers: {
      'Authorization': `Bearer ${TMDB_TOKEN}`,
      'Content-Type': 'application/json',
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
