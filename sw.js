const CACHE_NAME = 'mydash-v1';
const assets = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  'https://cdn-icons-png.flaticon.com/512/1041/1041916.png'
];

// ফাইলগুলো ক্যাশ (Cache) এ জমা রাখা
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(assets);
    })
  );
});

// অফলাইনে ফাইলগুলো ব্রাউজার থেকে না খুঁজে ক্যাশ থেকে নেওয়া
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
