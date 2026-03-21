importScripts('https://www.gstatic.com/firebasejs/11.9.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.9.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyBMtHMc7AEo5U4uZvR84wn-Z73oXGSZgCA',
  authDomain: 'what-to-eat-no-firebase.firebaseapp.com',
  projectId: 'what-to-eat-no-firebase',
  storageBucket: 'what-to-eat-no-firebase.firebasestorage.app',
  messagingSenderId: '500870159993',
  appId: '1:500870159993:web:105e95dd672dd099137ea8',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message', payload);

  const notificationTitle = payload.notification?.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/assets/logo/what-to-eat-favicon-color-128x128.png',
    badge: '/assets/logo/what-to-eat-favicon-color-72x72.png',
    data: payload.data || {},
    tag: payload.data?.tag || 'default',
    renotify: true,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click — open/focus the app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
