class PCMProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.port.onmessage = this.onMessage.bind(this);
    this.recording = true;
  }

  onMessage(event) {
    if (event.data.command === 'stop') this.recording = false;
  }

  process(inputs) {
    if (!this.recording) return false;

    const input = inputs[0][0];
    if (!input) return true;

    const pcm = new Int16Array(input.length);
    for (let i = 0; i < input.length; ++i) {
      let s = Math.max(-1, Math.min(1, input[i]));
      pcm[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }

    this.port.postMessage({ audio: pcm.buffer }, [pcm.buffer]);
    return true;
  }
}

registerProcessor('pcm-processor', PCMProcessor);
