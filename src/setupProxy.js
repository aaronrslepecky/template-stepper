const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://api.tigerpistol.com',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '/v2', // Rewrite /api to /v2 to match the actual API structure
      },
      onProxyReq: (proxyReq, req) => {
        // Add required headers
        proxyReq.setHeader('accept', 'application/json, text/plain, */*');
        proxyReq.setHeader('culture', 'en-US');
        proxyReq.setHeader('cache-control', 'no-cache');
        proxyReq.setHeader('pragma', 'no-cache');
        
        // Log outgoing request
        console.log('Proxying request:', {
          method: req.method,
          path: req.path,
          targetUrl: proxyReq.path,
          headers: proxyReq.getHeaders()
        });
      },
      onProxyRes: (proxyRes, req) => {
        // Log proxy response
        console.log('Proxy response:', {
          method: req.method,
          path: req.path,
          status: proxyRes.statusCode,
          headers: proxyRes.headers,
          targetUrl: req.path
        });
      },
      onError: (err, req, res) => {
        console.error('Proxy error:', {
          error: err,
          method: req.method,
          path: req.path,
          targetUrl: req.path
        });
        res.status(500).send('Proxy Error');
      }
    })
  );
}; 