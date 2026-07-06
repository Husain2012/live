const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');

// 1. إنشاء سيرفر HTTP لعرض صفحة index.html للمتصفح
const server = http.createServer((req, res) => {
    if (req.url === '/' || req.url === '/index.html') {
        fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
            if (err) {
                res.writeHead(500);
                return res.end('Error loading index.html');
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
    }
});

// 2. إعداد سيرفر WebSocket لنقل بيانات البث
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('جهاز جديد اتصل بالسيرفر ✅');

    // استقبال البث من الهاتف وإعادة توجيهه للكمبيوتر
    ws.on('message', (message) => {
        wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    ws.on('close', () => {
        console.log('انقطع اتصال أحد الأجهزة ❌');
    });
});

// 3. تشغيل السيرفر على المنفذ 3000
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`🚀 السيرفر يعمل بنجاح!`);
    console.log(`💻 للكمبيوتر: http://localhost:${PORT}`);
    console.log(`📱 للهاتف: افتح المتصفح واكتب IP الكمبيوتر الخاص بك متبوعاً بـ :${PORT}`);
});