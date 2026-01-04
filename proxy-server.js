import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const server = createServer(app);

// Debug endpoint to inspect backend health
app.get('/debug', async (req, res) => {
  try {
    const backendHealth = await fetch('http://localhost:4000/api/health');
    const healthText = await backendHealth.text();
    res.json({
      backendStatus: backendHealth.status,
      backendBody: healthText,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: 'Backend unreachable', details: err.message });
  }
});

// Proxy /api to discordhooks on port 4000
app.use('/api', createProxyMiddleware({
  target: 'http://localhost:4000',
  changeOrigin: true,
  onError: (err, req, res) => {
    console.error('Proxy error:', err.message);
    res.status(500).send('Proxy error: ' + err.message);
  },
}));

// Proxy Socket.IO to discordhooks on port 4000
app.use('/socket.io', createProxyMiddleware({
  target: 'http://localhost:4000',
  changeOrigin: true,
  ws: true,
  onError: (err, req, res) => {
    console.error('Socket.IO proxy error:', err.message);
  },
}));

// Serve frontend static files from dist
app.use(express.static(join(__dirname, 'frontend/dist')));

// Fallback to index.html for SPA
app.use('*', (req, res) => {
  res.sendFile(join(__dirname, 'frontend/dist/index.html'));
});

const PORT = 4173;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Proxy server running on http://0.0.0.0:${PORT}`);
});
