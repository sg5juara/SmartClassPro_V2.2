// Nama cache disesuaikan dengan versi terbaru
const CACHE_NAME = 'smart-class-pro-v2.2-cache';

// Daftar aset dan library CDN yang akan disimpan di memori perangkat
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json',
    'https://cdn.tailwindcss.com',
    'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.3.0/exceljs.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js',
    'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap',
    'https://www.soundjay.com/buttons/sounds/button-09.mp3'
];

// Event Install: Menyimpan semua aset ke dalam Cache saat pertama kali diload
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Cache berhasil dibuat');
                return cache.addAll(urlsToCache);
            })
    );
});

// Event Activate: Membersihkan cache versi lama agar tidak membebani perangkat
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('Service Worker: Menghapus cache lama', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Event Fetch: Mengambil data dari Cache jika internet offline, atau fetch dari internet jika belum ada di cache
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cache jika ada
                if (response) {
                    return response;
                }
                // Fetch request jika tidak ada di cache
                return fetch(event.request).then(
                    function(response) {
                        // Jangan simpan cache jika respons tidak valid
                        if(!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Simpan respons baru ke cache untuk penggunaan berikutnya
                        let responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then(function(cache) {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    }
                );
            }).catch(() => {
                // Fallback jika sama sekali tidak ada koneksi dan file tidak ada di cache
                console.log('Service Worker: Gagal mengambil data, status offline.');
            })
    );
});
