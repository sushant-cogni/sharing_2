# 📘 GenC Next Technical Assessment: Advanced HTML5 APIs & Offline Web Apps

> **Interviewer Note:** As a Senior Technical Interviewer evaluating you for a GenC Next role, I am looking for mastery over the browser's native capabilities. Frameworks come and go, but the underlying Web APIs remain. You must demonstrate a clear understanding of asynchrony, network protocols, browser security boundaries, and the Service Worker lifecycle using pure, vanilla JavaScript. Let's begin.

## 🎯 The Core Concept

HTML5 APIs transform the browser from a simple document viewer into a powerful, native-like application runtime. They expose JavaScript interfaces for hardware access (Geolocation), real-time bidirectional networking (WebSockets), client-side persistence (Storage API), and robust offline capabilities (Service Workers & Manifests).

---

## 🗣️ All Interview Questions

* **1. How does a WebSocket fundamentally differ from standard HTTP/REST or AJAX?**
    
    * **Answer:** HTTP is unidirectional and stateless; the client must request data, and the server responds (half-duplex). WebSockets (`ws://` or `wss://`) establish a persistent, full-duplex TCP connection. Once open, the server can push real-time data to the client continuously without the client needing to poll for updates.

* **2. Explain the strict lifecycle of a Service Worker.**
    
    * **Answer:** A Service Worker acts as a client-side network proxy. Its lifecycle is completely separate from the web page:
        1. **Registration:** The browser downloads the worker script.
        2. **Installation (`install` event):** The worker sets up. This is where we pre-cache static, essential assets (HTML, CSS, core JS).
        3. **Activation (`activate` event):** The worker takes control of the clients. This is where we clean up old, stale caches.
        4. **Fetch (`fetch` event):** The active worker intercepts network requests, allowing us to serve cached files if the user is offline.

* **3. What are the security and data limitations of the Web Storage API (`localStorage` / `sessionStorage`)?**
    * **Answer:** Both are limited to roughly 5MB of data and strictly store data as **strings**. Security-wise, they are entirely accessible via JavaScript (`window.localStorage`). Therefore, they are highly vulnerable to Cross-Site Scripting (XSS) attacks. You must *never* store sensitive data, like JWTs, user passwords, or API keys, in the Web Storage API.

* **4. How does the Geolocation API handle permissions and execution context?**
    * **Answer:** Geolocation (`navigator.geolocation`) is strictly asynchronous and relies on the user explicitly granting permission via a browser prompt. Furthermore, modern browsers strictly enforce that the Geolocation API will only function in a secure context (HTTPS) or locally (`localhost`). It will fail silently on unsecured HTTP connections.

* **5. What is the role of the Web App Manifest (`manifest.json`) in a Progressive Web App (PWA)?**
    * **Answer:** It is a simple JSON file that provides the browser with metadata about your web application. It dictates how the app should appear when installed on a user's device (home screen icons, theme colors, background colors, and display mode like `standalone` to hide the browser UI).

---

## 💻 Syntax & Examples

### 1. Vanilla WebSockets (Client-Side)
A pure implementation of opening a socket and handling incoming server pushes.

~~~javascript
// Establish a secure WebSocket connection
const socket = new WebSocket('wss://api.example.com/realtime');

// Event: Connection opened successfully
socket.addEventListener('open', (event) => {
    console.log('Connected to the server.');
    // Send a pure string payload to the server
    socket.send(JSON.stringify({ type: 'GREETING', payload: 'Hello Server' }));
});

// Event: Listen for messages pushed from the server
socket.addEventListener('message', (event) => {
    const data = JSON.parse(event.data);
    console.log('Server says:', data);
});

// Event: Handle closures and clean up
socket.addEventListener('close', (event) => {
    console.log('Connection closed cleanly.', event.code, event.reason);
});
~~~

### 2. The Web Storage API (Handling Data Types)
Demonstrating how to properly store and retrieve complex objects, as the API only accepts strings.

~~~javascript
const userSettings = { theme: 'dark', notifications: true };

// ❌ WRONG: Storing an object directly results in "[object Object]"
// localStorage.setItem('settings', userSettings); 

// ✅ CORRECT: Serialize to JSON string before storing
localStorage.setItem('settings', JSON.stringify(userSettings));

// Retrieve and parse back into a JavaScript object
const rawData = localStorage.getItem('settings');
if (rawData) {
    const parsedSettings = JSON.parse(rawData);
    console.log(parsedSettings.theme); // Output: 'dark'
}

// Clear specific item or all items
// localStorage.removeItem('settings');
// localStorage.clear();
~~~

### 3. Geolocation API (Handling Asynchrony and Errors)
Properly requesting location data and anticipating user denial.

~~~javascript
if ('geolocation' in navigator) {
    const successCallback = (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        console.log(`Lat: ${latitude}, Lng: ${longitude} (Accuracy: ${accuracy}m)`);
    };

    const errorCallback = (error) => {
        // error.code can be: 1 (PERMISSION_DENIED), 2 (POSITION_UNAVAILABLE), 3 (TIMEOUT)
        console.error(`Geolocation failed: ${error.message} (Code: ${error.code})`);
    };

    const options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0 // Do not use a cached position
    };

    // Asynchronous call
    navigator.geolocation.getCurrentPosition(successCallback, errorCallback, options);
} else {
    console.error("Geolocation is not supported by this browser.");
}
~~~

### 4. Registering a Service Worker & The `manifest.json`
The two foundational pieces required to make a standard HTML page function offline and become installable.

**index.html (Linking Manifest and Registering SW):**

~~~html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Offline PWA</title>
    <link rel="manifest" href="/manifest.json">
</head>
<body>
    <h1>My Offline App</h1>
    <script>
        // Feature detection before registration
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(registration => {
                        console.log('SW registered with scope:', registration.scope);
                    })
                    .catch(err => {
                        console.error('SW registration failed:', err);
                    });
            });
        }
    </script>
</body>
</html>
~~~

**manifest.json:**

~~~json
{
  "name": "GenC Next Application",
  "short_name": "GenC App",
  "start_url": "/index.html",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
~~~

**sw.js (The Service Worker - Caching strategy):**

~~~javascript
const CACHE_NAME = 'genc-cache-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js'
];

// 1. Install Event: Pre-cache core assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(ASSETS_TO_CACHE);
            })
    );
});

// 2. Fetch Event: Intercept network requests and serve from cache if offline
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                // Return cached asset if found, otherwise continue to network
                return cachedResponse || fetch(event.request);
            })
    );
});
~~~