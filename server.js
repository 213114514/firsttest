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

// 视频扩展名列表，用于支持 Range 请求
const VIDEO_EXTS = ['.mp4'];

const server = http.createServer((req, res) => {
    // 默认提供 index.html，并对中文文件名进行 URL 解码
    let filePath = req.url === '/' ? '/index.html' : decodeURIComponent(req.url);
    filePath = path.join(__dirname, filePath);

    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.stat(filePath, (err, stats) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('404 Not Found');
            return;
        }

        const fileSize = stats.size;

        // 对视频文件支持 Range 请求（分片传输）
        if (VIDEO_EXTS.includes(ext) && req.headers.range) {
            const range = req.headers.range;
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunkSize = end - start + 1;

            res.writeHead(206, {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunkSize,
                'Content-Type': contentType,
            });

            const stream = fs.createReadStream(filePath, { start, end });
            stream.pipe(res);
            stream.on('error', () => {
                res.end();
            });
        } else {
            // 非视频文件或没有 Range 请求，直接流式返回
            res.writeHead(200, {
                'Content-Type': contentType,
                'Content-Length': fileSize,
                'Accept-Ranges': 'bytes',
            });

            const stream = fs.createReadStream(filePath);
            stream.pipe(res);
            stream.on('error', () => {
                res.end();
            });
        }
    });
});

server.listen(PORT, HOST, () => {
    console.log(`✅ WebForUbuntu 服务已启动: http://localhost:${PORT}`);
});
