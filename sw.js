// Service Worker রেজিস্ট্রেশন
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then(reg => console.log('Service Worker নিবন্ধিত হয়েছে!'))
      .catch(err => console.log('Service Worker রেজিস্ট্রেশনে সমস্যা:', err));
  });
}

