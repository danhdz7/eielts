// Chạy giọng AI ở luồng nền để màn hình app không bị đơ khi tải/đọc.
import { KokoroTTS } from "./kokoro.web.js";
let tts = null;
self.onmessage = async function (e) {
  var m = e.data || {};
  try {
    if (m.type === "load") {
      tts = await KokoroTTS.from_pretrained(m.model, {
        dtype: "q8", device: "wasm",
        progress_callback: function (p) {
          if (p && p.file && p.total) self.postMessage({ type: "progress", file: p.file, loaded: p.loaded || 0, total: p.total });
        }
      });
      self.postMessage({ type: "ready" });
    } else if (m.type === "gen") {
      var a = await tts.generate(m.text, { voice: m.voice, speed: m.speed });
      self.postMessage({ type: "audio", id: m.id, blob: a.toBlob() });
    }
  } catch (err) {
    self.postMessage({ type: m.type === "load" ? "loaderr" : "generr", id: m.id, error: String((err && err.message) || err) });
  }
};
