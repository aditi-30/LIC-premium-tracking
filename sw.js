self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => clients.claim());

// Handle push notifications sent from the page
self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : {};
  e.waitUntil(
    self.registration.showNotification(data.title || 'LIC Premium Reminder', {
      body: data.body || 'A premium is due soon.',
      icon: '/icon.png',
      badge: '/icon.png',
      tag: data.tag || 'lic-reminder',
      data: { url: self.location.origin }
    })
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow(e.notification.data.url || '/'));
});

// Handle scheduled local notification checks (triggered by the page via postMessage)
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'CHECK_PREMIUMS') {
    const members = e.data.members || [];
    const today = new Date(); today.setHours(0,0,0,0);

    members.forEach(m => {
      if (m.paid || !m.dueDate) return;
      const due = new Date(m.dueDate); due.setHours(0,0,0,0);
      const days = Math.ceil((due - today) / 86400000);
      if (days >= 0 && days <= 7) {
        self.registration.showNotification('🔔 LIC Premium Due Soon', {
          body: `${m.name}'s premium of ₹${parseFloat(m.premium).toLocaleString('en-IN')} is due in ${days === 0 ? 'today!' : days + ' day(s).'}`,
          icon: '/icon.png',
          tag: 'lic-' + m.id,
          data: { url: self.location.origin }
        });
      }
    });
  }
});
