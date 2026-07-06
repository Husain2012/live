const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');

// 1. إنشاء سيرفر HTTP لعرض صفحة index.html
const server = http.createServer((req, res) => {
    // تخديم ملف index.html عند فتح الرابط الرئيسي
    if (req.url === '/' || req.url === '/index.html') {
        fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
            if (err) {
                res.writeHead(500);
                return res.end('Error loading index.html');
            }
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(data);
        });
    } else {
        // التعامل مع أي روابط أخرى غير موجودة
        res.writeHead(404);
        res.end('Not Found');
    }
});

// 2. إعداد سيرفر WebSocket لنقل بيانات البث (الفيديو)
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('جهاز جديد اتصل بالسيرفر عبر الـ WebSocket ✅');

    // استقبال كتل الفيديو (Chunks) من الهاتف وإعادة توجيهها فوراً للكمبيوتر
    ws.on('message', (message) => {
        wss.clients.forEach((client) => {
            // إرسال البيانات لكل الأجهزة المتصلة ما عدا الجهاز المرسل (الهاتف)
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    ws.on('close', () => {
        console.log('انقطع اتصال أحد الأجهزة ❌');
    });

    ws.on('error', (error) => {
        console.error('حدث خطأ في اتصال الـ WebSocket:', error);
    });
});

// 3. تحديد المنفذ (تلقائي للمنصات السحابية مثل Render أو 3000 للمحلي)
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`🚀 السيرفر يعمل بنجاح الآن!`);
    console.log(`💻 إذا كنت تعمل محلياً (Localhost): http://localhost:${PORT}`);
    console.log(`🌐 إذا كنت قمت برفعه أونلاين: سيتم تشغيله مباشرة عبر رابط المنصة الموفر لك.`);
});
