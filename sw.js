const CACHE_NAME = 'rent-manager-v25';

// 安装阶段：跳过等待，立即接管
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// 激活阶段：清理旧缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 请求拦截：网络优先，失败则读取缓存 (Network First, fallback to Cache)
self.addEventListener('fetch', (event) => {
  // 忽略非 GET 请求（如 API POST）
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // 检查响应是否有效 (允许跨域资源如 esm.sh CDN)
        if (!response || response.status !== 200) {
          return response;
        }

        // 克隆响应并存入缓存
        const responseToCache = response.clone();
        caches.open(CACHE_NAME)
          .then((cache) => {
            cache.put(event.request, responseToCache);
          });

        return response;
      })
      .catch(() => {
        // 网络请求失败，尝试从缓存读取
        return caches.match(event.request);
      })
  );
});