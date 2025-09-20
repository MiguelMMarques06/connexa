const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const BUILD_DIR = path.join(__dirname, 'frontend', 'build');

console.log(`Starting server with BUILD_DIR: ${BUILD_DIR}`);

// Check if build directory exists
if (!fs.existsSync(BUILD_DIR)) {
  console.error(`Build directory does not exist: ${BUILD_DIR}`);
  process.exit(1);
}

// MIME types for different file extensions
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
  '.woff': 'application/font-woff',
  '.woff2': 'application/font-woff2',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject'
};

const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  let filePath;
  
  // Handle root request
  if (req.url === '/') {
    filePath = path.join(BUILD_DIR, 'index.html');
  } else {
    // Remove query parameters and decode URL
    const cleanUrl = decodeURIComponent(req.url.split('?')[0]);
    filePath = path.join(BUILD_DIR, cleanUrl);
  }
  
  // Prevent directory traversal
  if (!filePath.startsWith(BUILD_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }
  
  // Check if file exists and is a file (not directory)
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // If file doesn't exist and it's not a static asset, serve index.html for SPA routing
      if (!req.url.startsWith('/static') && !req.url.includes('.')) {
        filePath = path.join(BUILD_DIR, 'index.html');
        // Serve index.html
        fs.readFile(filePath, (readErr, content) => {
          if (readErr) {
            console.error(`Error reading index.html:`, readErr);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Server error');
            return;
          }
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(content);
        });
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('File not found');
      }
      return;
    }
    
    // Read and serve the file
    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        console.error(`Error reading file ${filePath}:`, readErr);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Server error');
        return;
      }
      
      const ext = path.extname(filePath);
      const mimeType = mimeTypes[ext] || 'application/octet-stream';
      
      res.writeHead(200, { 'Content-Type': mimeType });
      res.end(content);
    });
  });
});

server.listen(PORT, () => {
  console.log(`Frontend server running at http://localhost:${PORT}/`);
  console.log(`Serving files from: ${BUILD_DIR}`);
  console.log(`Server ready!`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please stop the other service or use a different port.`);
  } else {
    console.error('Server error:', error);
  }
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  server.close(() => {
    console.log('Server stopped');
    process.exit(0);
  });
});