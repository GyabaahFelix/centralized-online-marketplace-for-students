
// Firebase Cloud Messaging (FCM) Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyDWc0_Zam-2EWrR4NhHRXNu9LFeXTDIVSg",
  authDomain: "gen-lang-client-0064050034.firebaseapp.com",
  projectId: "gen-lang-client-0064050034",
  storageBucket: "gen-lang-client-0064050034.firebasestorage.app",
  messagingSenderId: "1049680598702",
  appId: "1:1049680598702:web:c0319190e7bf08315f7f3f"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Background Message Handler
messaging.onBackgroundMessage((payload) => {
  console.log('[sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.image || '/logo.png', // Fallback to logo
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Existing Caching Logic
const CACHE_NAME = 'lynqed-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});