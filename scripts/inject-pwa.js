const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'dist', 'index.html');
let html = fs.readFileSync(htmlPath, 'utf-8');

const pwaTags = `
    <link rel="manifest" href="/manifest.json" />
    <meta name="theme-color" content="#1A1A18" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="Opal" />
    <link rel="apple-touch-icon" href="/pwa-icon-512.png" />`;

const swScript = `
  <script>
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js');
      });
    }
  </script>`;

// Inject PWA meta tags before </head>
html = html.replace('</head>', pwaTags + '\n  </head>');

// Inject SW registration before </body>
html = html.replace('</body>', swScript + '\n</body>');

fs.writeFileSync(htmlPath, html);
console.log('PWA tags injected into dist/index.html');
