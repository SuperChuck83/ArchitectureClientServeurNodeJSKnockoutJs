var RUNTIME = 'runtime';
var PRECACHE_URLS = [
   //'./',
   //        '/',
   //         '/m',
   //         '/Client/js/mobile.js',
   //          '/Client/mobile/index.html'
];

this.addEventListener('install', function (event) {
    event.waitUntil(
   caches.open('v1').then(function (cache) {
       return cache.addAll(PRECACHE_URLS);
   })
 );
});


//this.addEventListener("activate", function (event) {
//    event.waitUntil(
//        caches.keys().then(function (cacheNames) {
//            return Promise.all(
//                cacheNames.map(function (cacheName) {
//                    if (CACHE_NAME !== cacheName) {
//                        return caches.delete(cacheName);
//                    }
//                })
//            );
//        })
//    );
//});



this.addEventListener('fetch', function (event) {
    // C'est l� que la magie op�re, No�l !
    event.respondWith(caches.match(event.request).then(function (response) {
        // caches.match() always resolves
        // but in case of success response will have value
        if (response !== undefined) {
            return response;
        } else {
            return fetch(event.request).then(function (response) {
                // response may be used only once
                // we need to save clone to put one copy in cache
                // and serve second one
                let responseClone = response.clone();

                caches.open('v1').then(function (cache) {
                    cache.put(event.request, responseClone);
                });
                return response;
            }).catch(function () {
                return caches.match('/sw-test/gallery/myLittleVader.jpg');
            });
        }
    }));
});





this.addEventListener('push', ev => {
    const data = ev.data.json();

    this.registration.showNotification(data.title, {
        body: 'Hello, World!',
        icon: 'http://mongoosejs.com/docs/images/mongoose5_62x30_transparent.png'
    });
});



