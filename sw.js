// Service worker: chạy offline. Tăng số VERSION mỗi lần sửa app để máy cập nhật.
var VERSION = "ielts-v42";
var ICONS3D = ["./i-abc.webp", "./i-arts.webp", "./i-bell.webp", "./i-bolt.webp", "./i-book.webp", "./i-building.webp", "./i-business.webp", "./i-cards.webp", "./i-clothes.webp", "./i-coin.webp", "./i-comm.webp", "./i-compass.webp", "./i-crown.webp", "./i-development.webp", "./i-education.webp", "./i-energy.webp", "./i-environment.webp", "./i-family.webp", "./i-fire.webp", "./i-fit.webp", "./i-flag.webp", "./i-food.webp", "./i-friends.webp", "./i-furniture.webp", "./i-gem.webp", "./i-gift.webp", "./i-glasses.webp", "./i-globe.webp", "./i-grammar.webp", "./i-green.webp", "./i-growing.webp", "./i-h_bubble.webp", "./i-h_earth.webp", "./i-h_mascot.webp", "./i-h_ringed.webp", "./i-headphones.webp", "./i-health.webp", "./i-healthy.webp", "./i-history.webp", "./i-housing.webp", "./i-infotech.webp", "./i-law.webp", "./i-lifestyle.webp", "./i-lock.webp", "./i-lookup.webp", "./i-medal.webp", "./i-media.webp", "./i-medicine.webp", "./i-mega.webp", "./i-mic.webp", "./i-modern.webp", "./i-money.webp", "./i-natural.webp", "./i-notebook.webp", "./i-pairs.webp", "./i-pen.webp", "./i-phrases.webp", "./i-pie.webp", "./i-routine.webp", "./i-shield.webp", "./i-shopping.webp", "./i-space.webp", "./i-speak.webp", "./i-sports.webp", "./i-star.webp", "./i-student.webp", "./i-target.webp", "./i-task1.webp", "./i-technology.webp", "./i-tourism.webp", "./i-transport.webp", "./i-travel.webp", "./i-trophy.webp", "./i-urban.webp", "./i-verbs.webp", "./i-work.webp"];
var SCENES = ["./sc-s1.webp", "./sc-s2.webp", "./sc-s3.webp", "./sc-s4.webp", "./sc-s5.webp", "./sc-s6.webp", "./sc-d1.webp", "./sc-d2.webp", "./sc-d3.webp", "./sc-d4.webp", "./sc-d5.webp", "./sc-d6.webp", "./sc-d7.webp", "./sc-d8.webp"];
var SHELL = ["./", "./index.html", "./manifest.json", "./questions.json", "./words.json", "./dialogues.json", "./exam.json", "./scenarios.json", "./task1.json", "./grammar.json", "./cefr.json", "./ipa.json", "./lint.json", "./collocations.json", "./shadowing.json", "./ideas.json", "./i18n_en.json",
  "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png"].concat(ICONS3D).concat(SCENES);

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
