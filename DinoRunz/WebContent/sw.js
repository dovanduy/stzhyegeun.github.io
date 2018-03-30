var CACHE_VERSION = 1;
var CACHE = "dinorunz-ws-" + CACHE_VERSION;

self.addEventListener("activate", function(event) {
    console.log("[DinoRunz-WS] Start Activate Event");
    event.waitUntil(caches.keys().then(function(cacheNames) {
        return Promise.all(cacheNames.map(function(cacheName) {
            console.log("[DinoRunz-WS] Cached Name: " + cacheName);
            return caches.delete(cacheName);
        }));
    }));
});

self.addEventListener("fetch", function(event) {
    console.log("[DinoRunz-WS] Handling fetch event for " + event.request.url);

    event.respondWith(
        caches.open(CACHE).then(function(cache) {
            return cache.match(event.request).then(function(response) {
                if (response) {
                    console.log("[DinoRunz-WS] Found response in cache: " + response);
                    return response;
                }

                console.log("[DinoRunz-WS] Fetching request from the network");

                return fetch(event.request).then(function(networkResponse) {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });
            }).catch(function(err) {
                // Handles exceptions that arise from match() or  fetch()
                console.log("[DinoRunz-WS] Error in fetch handler: " + err);
                throw err;
            })
        })
    );
});


// self.addEventListener("install", function(evt) {
//     console.log("[DinoRunz-WS] The service worker is being installed.");

//     //evt.waitUntil(precache());
// });

// self.addEventListener("activate", function(evt) {
//     console.log("[DinoRunz-WS] Start activate event");
//     evt.waitUntil(
//         caches.keys().then(function(cacheNames) {
//             return Promise.all(
//                 cacheNames.map(function(cacheName) {
//                     console.log("[DinoRunz-WS] cacheNam: " + cacheName);
//                 })
//             );
//         })
//     );
// });

// self.addEventListener("fetch", function(evt) {
//     console.log("[DinoRunz-WS] The service worker is serving the asset");
//     // Try network and if it fails, go for the cached copy.
//     evt.respondWith(fromNetwork(evt.request, 400).catch(function() {
//         return fromCache(evt.request);
//     }));
// });

// // Open a cache and use "addAll()" with an array of assets to add all of them to the cache. 
// // Return a promise resolving when all the assets are added.
// function precache() {
//     return caches.open(CACHE).then(function(cache) {
//         console.log("add jquery and phaser");
//         return cache.addAll([
//             "/lib/jquery-3.1.1.min.js", 
//             "/lib/phaser.js"
//         ]);
//     }).catch(function(err) {
//         console.log("[DinoRunz-WS] precache failed: " + JSON.stringify(err));
//     });
// }


// // Time limited network request.
// // If the network fails or the response is not served before timeout, the promise is rejected.
// function fromNetwork(request, timeout) {
//     return new Promise(function(fulfill, reject) {
//         // Reject in case of timeout
//         var timeoutId = setTimeout(reject, timeout);
//         // Fulfill in case of success
//         fetch(request).then(function(response) {
//             clearTimeout(timeoutId);
//             fulfill(response);
//             // Reject also if network fetch rejects.
//         }, reject);
//     });
// }

// function fromCache(request) {
//     return caches.open(CACHE).then(function(cache) {
//         return cache.match(request).then(function(matching) {
//             return matching || Promise.reject("[DinoRunz-WS] no-match");
//         });
//     });
// }