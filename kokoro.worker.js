// Chạy giọng AI ở luồng nền để màn hình app không bị đơ khi tải/đọc.
import { KokoroTTS } from "./kokoro.web.js";
let tts = null;
// Tải mạng ở mức ưu tiên thấp để không giành đường truyền với bài học
var _fetch = self.fetch.bind(self);
self.fetch = function (u, o) { o = o || {}; if (!o.priority) o.priority = "low"; return _fetch(u, o); };
var lastP = {};
var VBASE = "https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX/resolve/main/voices/";
async function prefetchVoices(ids) {
  var c = await caches.open("kokoro-voices"), n = 0;
  for (var i = 0; i < ids.length; i++) {
    var url = VBASE + ids[i] + ".bin";
    try {
      if (!(await c.match(url))) {
        var r = await _fetch(url, { priority: "low" });
        if (r.ok) await c.put(url, r);
      }
    } catch (e) { /* mạng yếu: thử lại lần sau */ }
    n++; self.postMessage({ type: "vprog", n: n, total: ids.length });
    await new Promise(function (ok) { setTimeout(ok, 400); });
  }
  self.postMessage({ type: "vdone" });
}
self.onmessage = async function (e) {
  var m = e.data || {};
  try {
    if (m.type === "load") {
      tts = await KokoroTTS.from_pretrained(m.model, {
        dtype: "q8", device: "wasm",
        progress_callback: function (p) {
          var now = Date.now();
          if (p && p.file && p.total && (now - (lastP[p.file] || 0) > 250 || p.loaded >= p.total)) { lastP[p.file] = now; self.postMessage({ type: "progress", file: p.file, loaded: p.loaded || 0, total: p.total }); }
        }
      });
      self.postMessage({ type: "ready" });
    } else if (m.type === "prefetch") {
      await prefetchVoices(m.ids);
    } else if (m.type === "gen") {
      var a = await tts.generate(m.text, { voice: m.voice, speed: m.speed });
      self.postMessage({ type: "audio", id: m.id, blob: a.toBlob() });
    }
  } catch (err) {
    self.postMessage({ type: m.type === "load" ? "loaderr" : "generr", id: m.id, error: String((err && err.message) || err) });
  }
};
