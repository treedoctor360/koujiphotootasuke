// 工事写真カメラPoC Service Worker v0.2
var CACHE_NAME = 'kouji-cam-v0.2';
var ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', function(event){
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event){
  event.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){return k!==CACHE_NAME;}).map(function(k){return caches.delete(k);}));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(event){
  // GETのみキャッシュ対応
  if(event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(function(cached){
      return cached || fetch(event.request).then(function(res){
        // 同一オリジンのみキャッシュ追加
        if(res && res.status === 200 && event.request.url.indexOf(self.location.origin) === 0){
          var clone = res.clone();
          caches.open(CACHE_NAME).then(function(cache){cache.put(event.request, clone);});
        }
        return res;
      }).catch(function(){return cached;});
    })
  );
});
