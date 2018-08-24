var RUNTIME = 'runtime';
var PRECACHE_URLS = [
           //'/Client',
           // '/m',
           // '/Client/js/mobile.js',
           //  '/Client/mobile/index.html'
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
    // C'est là que la magie opère, Noël !
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
                  //  cache.put(event.request, responseClone);
                });
                return response;
            }).catch(function () {
                return caches.match('/sw-test/gallery/myLittleVader.jpg');
            });
        }
    }));
});


