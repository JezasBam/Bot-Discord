import http from 'http';

export function startHealthServer(client, port = 4001) {
  http
    .createServer((req, res) => {
      if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            ready: client.isReady(),
            uptime: process.uptime(),
            timestamp: new Date().toISOString()
          })
        );
      } else {
        res.writeHead(404);
        res.end();
      }
    })
    .listen(port);

  console.log(`Health check server running on port ${port}`);
}
