const CACHE_NAME = 'cbt-practice-v1';
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/app.js',
  '/data/questions.json'
];

self.addEventListener('install', (evt)=>{
  evt.waitUntil(
    caches.open(CACHE_NAME).then(cache=>{
      // try to cache the app shell
      return cache.addAll(FILES_TO_CACHE).catch(err=>{console.warn('Some files failed to cache', err)});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (evt)=>{
  evt.waitUntil(
    caches.keys().then(keys=>Promise.all(
      keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (evt)=>{
  const url = new URL(evt.request.url);
  // network-first for data file to allow updates; cache-first for app shell
  if(url.pathname.endsWith('/data/questions.json')){
    evt.respondWith(fetch(evt.request).then(r=>{
      const copy = r.clone(); caches.open(CACHE_NAME).then(c=>c.put(evt.request, copy));
      return r;
    }).catch(()=>caches.match(evt.request)));
    return;
  }

  evt.respondWith(caches.match(evt.request).then(resp=>resp || fetch(evt.request)));
});
