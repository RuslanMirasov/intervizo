// lib/asrClient.js
export default class WhisperWSClient {
  constructor(opts = {}, cb = {}) {
    this.opts = {
      url: 'wss://asr.motrig.ru/', // 443 через Cloudflare
      auth: 'mysecret123',
      uid: `web-${Date.now()}`,
      language: 'ru',
      useVAD: true,
      interimResults: true,
      initialPrompt: undefined,
      ...opts,
    };
    this.cb = cb;
    this.ws = null;

    this.audioCtx = null;
    this.sourceNode = null;
    this.processor = null;
    this.stream = null;

    this.keepAlive = null;
  }

  start() {
    const { url, auth, uid, language, useVAD, interimResults, initialPrompt } = this.opts;

    const ws = new WebSocket(url);
    ws.binaryType = 'arraybuffer';
    this.ws = ws;

    ws.onopen = () => {
      const hello = { uid, auth, language, task: 'transcribe' };
      // опционально — если сервер это понимает:
      hello.sample_rate = 16000;
      hello.format = 'pcm_s16le';
      hello.use_vad = !!useVAD;
      hello.interim_results = !!interimResults;
      if (initialPrompt) hello.initial_prompt = initialPrompt;

      ws.send(JSON.stringify(hello));

      // простой keep-alive
      this.keepAlive = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: 'ping', ts: Date.now() }));
      }, 25000);
    };

    ws.onmessage = async evt => {
      const text = await this._toText(evt.data);
      if (!text) return;

      for (const chunk of this._splitJsonStream(text)) {
        let msg;
        try {
          msg = JSON.parse(chunk);
        } catch {
          continue;
        }

        if (msg.message === 'SERVER_READY') {
          this.cb.onReady && this.cb.onReady(msg);
          return;
        }
        if (msg.status === 'ERROR') {
          this.cb.onError && this.cb.onError(msg);
          return;
        }
        if (typeof msg.text === 'string') {
          if (msg.is_final) this.cb.onFinal && this.cb.onFinal(msg.text, msg);
          else this.cb.onPartial && this.cb.onPartial(msg.text, msg);
        }
      }
    };

    ws.onerror = e => this.cb.onError && this.cb.onError(e);
    ws.onclose = e => {
      if (this.keepAlive) clearInterval(this.keepAlive);
      this.cb.onClose && this.cb.onClose(e); // <-- передаём code/reason наружу
    };

    return ws;
  }

  async attachMic() {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { channelCount: 1, noiseSuppression: true, echoCancellation: true },
      video: false,
    });
    this.stream = stream;

    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 48000 });
    this.sourceNode = this.audioCtx.createMediaStreamSource(stream);

    // да, ScriptProcessorNode deprecated, но максимально совместим
    this.processor = this.audioCtx.createScriptProcessor(2048, 1, 1);
    this.processor.onaudioprocess = e => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
      const input = e.inputBuffer.getChannelData(0); // Float32 @ 48k (или другое)
      const down = this._downsampleFloat32To16k(input, this.audioCtx.sampleRate);
      const dv = this._floatTo16BitPCM(down); // Int16LE
      if (dv.byteLength > 0) this.ws.send(dv.buffer);
    };

    this.sourceNode.connect(this.processor);
    this.processor.connect(this.audioCtx.destination);
  }

  // отправить 1 сек синуса 440 Гц для быстрой диагностики
  sendTestTone(seconds = 1) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    const sr = 16000;
    const n = Math.floor(sr * seconds);
    const buf = new Float32Array(n);
    for (let i = 0; i < n; i++) buf[i] = Math.sin(2 * Math.PI * 440 * (i / sr)) * 0.25;
    const dv = this._floatTo16BitPCM(buf);
    this.ws.send(dv.buffer);
  }

  async stop(sendEOF = true) {
    try {
      if (sendEOF && this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ eof: true }));
      }
    } catch {}

    try {
      this.processor && this.processor.disconnect();
      this.sourceNode && this.sourceNode.disconnect();
      if (this.audioCtx && this.audioCtx.state !== 'closed') await this.audioCtx.close();
      if (this.stream) this.stream.getTracks().forEach(t => t.stop());
    } catch {}

    try {
      this.ws && this.ws.close();
    } catch {}
    if (this.keepAlive) clearInterval(this.keepAlive);

    this.ws = null;
    this.keepAlive = null;
  }

  // ===== helpers =====
  async _toText(data) {
    try {
      if (typeof data === 'string') return data;
      if (data instanceof Blob) return await data.text();
      if (data instanceof ArrayBuffer) return new TextDecoder().decode(data);
    } catch {}
    return null;
  }

  _splitJsonStream(s) {
    const out = [];
    let depth = 0,
      start = -1;
    for (let i = 0; i < s.length; i++) {
      const ch = s[i];
      if (ch === '{') {
        if (depth === 0) start = i;
        depth++;
      } else if (ch === '}') {
        depth--;
        if (depth === 0 && start !== -1) out.push(s.slice(start, i + 1));
      }
    }
    if (!out.length) {
      for (const line of s
        .split('\n')
        .map(x => x.trim())
        .filter(Boolean)) {
        if (line.startsWith('{') && line.endsWith('}')) out.push(line);
      }
    }
    return out;
  }

  _downsampleFloat32To16k(input, inRate) {
    if (inRate === 16000) return input;
    const ratio = inRate / 16000;
    const newLen = Math.floor(input.length / ratio);
    const result = new Float32Array(newLen);
    let o = 0,
      i = 0;
    while (o < newLen) {
      const nextI = Math.round((o + 1) * ratio);
      let sum = 0,
        cnt = 0;
      for (; i < nextI && i < input.length; i++) {
        sum += input[i];
        cnt++;
      }
      result[o++] = sum / (cnt || 1);
    }
    return result;
  }

  _floatTo16BitPCM(float32) {
    const dv = new DataView(new ArrayBuffer(float32.length * 2));
    let off = 0;
    for (let i = 0; i < float32.length; i++, off += 2) {
      const s = Math.max(-1, Math.min(1, float32[i]));
      dv.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    return dv;
  }
}
