// Service worker: chạy offline. Tăng số VERSION mỗi lần sửa app để máy cập nhật.
var VERSION = "ielts-v4";
var SHELL = ["./", "./index.html", "./manifest.json", "./questions.json", "./words.json", "./dialogues.json", "./exam.json", "./scenarios.json",
  "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png"];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) {
    return Promise.all(SHELL.map(function (u) { return c.add(u).catch(function () {}); }));
  }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
// Mạng trước, lỗi mạng thì dùng bản đã lưu (luôn có nội dung mới khi online).
self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  e.respondWith(fetch(req).then(function (res) {
    if (res && res.ok) { var copy = res.clone(); caches.open(VERSION).then(function (c) { c.put(req, copy); }); }
    return res;
  }).catch(function () { return caches.match(req).then(function (r) { return r || caches.match("./index.html"); }); }));
});
