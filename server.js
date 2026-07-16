const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const HOST = '0.0.0.0';

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.mp4': 'video/mp4',
};

const server = http.createServer((req, res) => {
    // 默认提供 index.html，并对中文文件名进行 URL 解码
    let filePath = req.url === '/' ? '/index.html' : decodeURIComponent(req.url);
    filePath = path.join(__dirname, filePath);

    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('404 Not Found');
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        }
    });
});

server.listen(PORT, HOST, () => {
    console.log(`✅ WebForUbuntu 服务已启动: http://localhost:${PORT}`);
});
