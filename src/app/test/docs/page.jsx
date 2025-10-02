'use client';

import { useState } from 'react';

export default function WhisperApiDocs() {
  const [openSections, setOpenSections] = useState({
    connection: true,
    config: false,
    audio: false,
    responses: false,
    errors: false,
  });
  const [copiedKey, setCopiedKey] = useState(null);
  const [activeRespTab, setActiveRespTab] = useState('server-ready');

  const toggleSection = key => setOpenSections(s => ({ ...s, [key]: !s[key] }));

  const copyToClipboard = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1200);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1200);
    }
  };

  // ---- data ----
  const configParams = [
    { name: 'uid', type: 'string', required: true, description: 'Unique client identifier (UUID format)' },
    { name: 'task', type: 'string', required: true, description: "Task type: 'transcribe' or 'translate'" },
    {
      name: 'language',
      type: 'string',
      required: false,
      description: "Audio language code (e.g., 'ru', 'en'). Auto-detected if not specified",
    },
    {
      name: 'model',
      type: 'string',
      required: false,
      description: "Whisper model: 'tiny', 'base', 'small', 'medium', 'large'. Default: 'small'",
    },
    {
      name: 'use_vad',
      type: 'boolean',
      required: false,
      description: 'Enable Voice Activity Detection. Default: true',
    },
    {
      name: 'send_last_n_segments',
      type: 'integer',
      required: false,
      description: 'Number of last segments to send. Default: 10',
    },
    {
      name: 'no_speech_thresh',
      type: 'float',
      required: false,
      description: 'No speech probability threshold (0.0-1.0). Default: 0.45',
    },
    {
      name: 'clip_audio',
      type: 'boolean',
      required: false,
      description: 'Clip audio without valid segments. Default: false',
    },
    {
      name: 'same_output_threshold',
      type: 'integer',
      required: false,
      description: 'Repetition threshold for valid segments. Default: 10',
    },
    {
      name: 'enable_translation',
      type: 'boolean',
      required: false,
      description: 'Enable translation mode. Default: false',
    },
    {
      name: 'target_language',
      type: 'string',
      required: false,
      description: "Target language for translation. Default: 'en'",
    },
    {
      name: 'initial_prompt',
      type: 'string',
      required: false,
      description: 'Initial prompt for better recognition context',
    },
    { name: 'auth', type: 'string', required: false, description: 'Authentication token if required by server' },
  ];

  const responseTypes = [
    {
      name: 'Server Ready',
      key: 'server-ready',
      description: 'Confirmation that server is ready to receive audio',
      example: `{
  "uid": "client-uuid",
  "message": "SERVER_READY",
  "backend": "faster_whisper"
}`,
    },
    {
      name: 'Language Detection',
      key: 'language',
      description: 'Detected language information',
      example: `{
  "uid": "client-uuid",
  "language": "ru",
  "language_prob": 0.95
}`,
    },
    {
      name: 'Transcription Results',
      key: 'transcription',
      description: 'Real-time transcription segments',
      example: `{
  "uid": "client-uuid",
  "segments": [
    { "text": "Привет, как дела?", "start": 0.0, "end": 2.5, "completed": true },
    { "text": "Что нового?", "start": 2.5, "end": 4.0, "completed": false }
  ]
}`,
    },
    {
      name: 'Translation Results',
      key: 'translation',
      description: 'Translated segments (when translation is enabled)',
      example: `{
  "uid": "client-uuid",
  "translated_segments": [
    { "text": "Hello, how are you?", "start": 0.0, "end": 2.5, "completed": true }
  ]
}`,
    },
    {
      name: 'Status Messages',
      key: 'status',
      description: 'Server status and system messages',
      example: `{
  "uid": "client-uuid",
  "status": "WAIT",
  "message": 5.2
}`,
    },
  ];

  const errorCodes = [
    { code: '1000', description: 'Normal closure', type: 'WebSocket' },
    { code: '1001', description: 'Server unavailable', type: 'WebSocket' },
    { code: '1006', description: 'Abnormal closure', type: 'WebSocket' },
    { code: '1011', description: 'Internal server error', type: 'WebSocket' },
    { code: 'ERROR', description: 'Server-side error with message', type: 'Server' },
    { code: 'WAIT', description: 'Server busy, wait time in minutes', type: 'Server' },
    { code: 'WARNING', description: 'Server warning message', type: 'Server' },
  ];

  const initialHello = `{
  "uid": "unique-client-id",
  "language": "ru",
  "task": "transcribe",
  "model": "small",
  "use_vad": true,
  "auth": "your-auth-token"
}`;

  const audioSnippet = `// Convert Int16 to Float32
function int16ToFloat32(int16Array) {
  const float32Array = new Float32Array(int16Array.length);
  for (let i = 0; i < int16Array.length; i++) {
    float32Array[i] = int16Array[i] / 32768.0;
  }
  return float32Array;
}

// Send audio data
const audioData = int16ToFloat32(audioBuffer);
websocket.send(audioData.buffer);

// End audio stream
websocket.send("END_OF_AUDIO");`;

  // Важно: экранируем backticks и ${} внутри примера.
  const bigExample = `class WhisperLiveClient {
  constructor(host, port, options = {}) {
    this.host = host;
    this.port = port;
    this.options = {
      uid: this.generateUID(),
      language: options.language || null,
      task: options.task || "transcribe",
      model: options.model || "small",
      use_vad: options.use_vad !== false,
      send_last_n_segments: options.send_last_n_segments || 10,
      no_speech_thresh: options.no_speech_thresh || 0.45,
      auth: options.auth || null
    };
  }

  connect() {
    const protocol = this.options.use_wss ? 'wss' : 'ws';
    this.ws = new WebSocket(\`\\\${protocol}://\\\${this.host}:\\\${this.port}\`);
    
    this.ws.onopen = () => {
      console.log('Connected to Whisper Live Server');
      this.ws.send(JSON.stringify(this.options));
    };
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleMessage(data);
    };
    
    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    this.ws.onclose = (event) => {
      console.log('Connection closed:', event.code, event.reason);
    };
  }

  handleMessage(data) {
    if (data.message === "SERVER_READY") {
      this.onServerReady();
    } else if (data.segments) {
      this.onTranscription(data.segments);
    } else if (data.status) {
      this.onStatus(data.status, data.message);
    }
  }

  sendAudio(int16Buffer) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const float32Data = this.int16ToFloat32(int16Buffer);
      this.ws.send(float32Data.buffer);
    }
  }

  endAudio() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send("END_OF_AUDIO");
    }
  }

  int16ToFloat32(int16Array) {
    const float32Array = new Float32Array(int16Array.length);
    for (let i = 0; i < int16Array.length; i++) {
      float32Array[i] = int16Array[i] / 32768.0;
    }
    return float32Array;
  }

  generateUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // Override these methods
  onServerReady() {}
  onTranscription(segments) {}
  onStatus(status, message) {}
}`;

  // ---- tiny styles ----
  const box = { border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, background: '#fff' };
  const codeBox = { background: '#f6f8fa', padding: 12, borderRadius: 8, overflowX: 'auto', whiteSpace: 'pre' };
  const btn = {
    padding: '8px 12px',
    borderRadius: 8,
    border: '1px solid #d1d5db',
    background: '#f9fafb',
    cursor: 'pointer',
  };
  const pill = (bg = '#eef2ff', color = '#3730a3') => ({
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: 999,
    background: bg,
    color,
    fontSize: 12,
  });

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Header */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          background: '#1f2937',
          color: '#fff',
          borderBottom: '1px solid #111827',
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div aria-hidden>⚡</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 20 }}>Whisper Live API</div>
              <div style={{ opacity: 0.85, fontSize: 13 }}>WebSocket Real-time Speech Transcription</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={pill('#374151', '#e5e7eb')}>v1.0.0</span>
            <a href="#" style={{ color: '#e5e7eb', textDecoration: 'underline' }}>
              GitHub
            </a>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 16 }}>
          {/* Sidebar */}
          <aside>
            <div style={{ position: 'sticky', top: 84 }}>
              <div style={box}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Navigation</div>
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'connection', label: 'Connection' },
                  { id: 'config', label: 'Configuration' },
                  { id: 'audio', label: 'Audio Format' },
                  { id: 'responses', label: 'Responses' },
                  { id: 'errors', label: 'Error Handling' },
                  { id: 'examples', label: 'Code Examples' },
                ].map(item => (
                  <div key={item.id} style={{ marginBottom: 6 }}>
                    <button
                      style={{ ...btn, width: '100%', textAlign: 'left', background: '#fff' }}
                      onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' })}
                    >
                      {item.label}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Main */}
          <main style={{ display: 'grid', gap: 16 }}>
            {/* Overview */}
            <section id="overview" style={box}>
              <h2 style={{ marginTop: 0, marginBottom: 4, fontSize: 26 }}>Overview</h2>
              <p style={{ marginTop: 0, color: '#374151' }}>
                Whisper Live Server provides real-time speech transcription via WebSocket connections using OpenAI’s
                Whisper models.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 12 }}>
                <div style={{ ...box, padding: 12 }}>
                  <div style={{ fontWeight: 800, fontSize: 22, color: '#1d4ed8' }}>16kHz</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>Sample Rate</div>
                </div>
                <div style={{ ...box, padding: 12 }}>
                  <div style={{ fontWeight: 800, fontSize: 22, color: '#1d4ed8' }}>Float32</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>Audio Format</div>
                </div>
                <div style={{ ...box, padding: 12 }}>
                  <div style={{ fontWeight: 800, fontSize: 22, color: '#1d4ed8' }}>Real-time</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>Processing</div>
                </div>
              </div>
            </section>

            {/* Connection */}
            <section id="connection" style={box}>
              <button
                onClick={() => toggleSection('connection')}
                style={{
                  ...btn,
                  background: 'transparent',
                  border: 'none',
                  padding: 0,
                  marginBottom: 8,
                  cursor: 'pointer',
                }}
              >
                {openSections.connection ? '▼' : '▶'} <strong>WebSocket Connection</strong>{' '}
                <span style={pill('#f1f5f9', '#0f172a')}>POST</span>
              </button>

              {openSections.connection && (
                <div>
                  <h4 style={{ marginBottom: 6 }}>Endpoint</h4>
                  <div style={codeBox}>
                    ws://host:port (HTTP)
                    {'\n'}
                    wss://host:port (HTTPS)
                  </div>

                  <h4 style={{ margin: '12px 0 6px' }}>Initial Configuration Message</h4>
                  <div style={{ position: 'relative' }}>
                    <pre style={codeBox}>{initialHello}</pre>
                    <button
                      onClick={() => copyToClipboard(initialHello, 'hello')}
                      style={{ ...btn, position: 'absolute', top: 8, right: 8 }}
                      title="Copy"
                    >
                      {copiedKey === 'hello' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
              )}
            </section>

            {/* Config */}
            <section id="config" style={box}>
              <button
                onClick={() => toggleSection('config')}
                style={{ ...btn, background: 'transparent', border: 'none', padding: 0, marginBottom: 8 }}
              >
                {openSections.config ? '▼' : '▶'} <strong>Configuration Parameters</strong>
              </button>

              {openSections.config && (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left', borderBottom: '1px solid #e5e7eb', padding: 8 }}>Parameter</th>
                        <th style={{ textAlign: 'left', borderBottom: '1px solid #e5e7eb', padding: 8 }}>Type</th>
                        <th style={{ textAlign: 'left', borderBottom: '1px solid #e5e7eb', padding: 8 }}>Required</th>
                        <th style={{ textAlign: 'left', borderBottom: '1px solid #e5e7eb', padding: 8 }}>
                          Description
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {configParams.map(p => (
                        <tr key={p.name}>
                          <td style={{ padding: 8, fontFamily: 'monospace', fontWeight: 600 }}>{p.name}</td>
                          <td style={{ padding: 8 }}>
                            <span style={pill()}>{p.type}</span>
                          </td>
                          <td style={{ padding: 8 }}>
                            <span style={pill(p.required ? '#fee2e2' : '#f1f5f9', p.required ? '#991b1b' : '#0f172a')}>
                              {p.required ? 'Required' : 'Optional'}
                            </span>
                          </td>
                          <td style={{ padding: 8, fontSize: 14 }}>{p.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* Audio */}
            <section id="audio" style={box}>
              <button
                onClick={() => toggleSection('audio')}
                style={{ ...btn, background: 'transparent', border: 'none', padding: 0, marginBottom: 8 }}
              >
                {openSections.audio ? '▼' : '▶'} <strong>Audio Data Format</strong>
              </button>

              {openSections.audio && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                    <div style={{ ...box, padding: 12 }}>
                      <div style={{ fontWeight: 600 }}>Sample Rate</div>
                      <div style={{ fontWeight: 800, fontSize: 22, color: '#1d4ed8' }}>16,000 Hz</div>
                    </div>
                    <div style={{ ...box, padding: 12 }}>
                      <div style={{ fontWeight: 600 }}>Channels</div>
                      <div style={{ fontWeight: 800, fontSize: 22, color: '#1d4ed8' }}>1 (Mono)</div>
                    </div>
                    <div style={{ ...box, padding: 12 }}>
                      <div style={{ fontWeight: 600 }}>Format</div>
                      <div style={{ fontWeight: 800, fontSize: 22, color: '#1d4ed8' }}>Float32</div>
                    </div>
                    <div style={{ ...box, padding: 12 }}>
                      <div style={{ fontWeight: 600 }}>Chunk Size</div>
                      <div style={{ fontWeight: 800, fontSize: 22, color: '#1d4ed8' }}>4096 samples</div>
                    </div>
                  </div>

                  <h4 style={{ margin: '12px 0 6px' }}>Audio Conversion Example</h4>
                  <div style={{ position: 'relative' }}>
                    <pre style={codeBox}>{audioSnippet}</pre>
                    <button
                      onClick={() => copyToClipboard(audioSnippet, 'audio')}
                      style={{ ...btn, position: 'absolute', top: 8, right: 8 }}
                    >
                      {copiedKey === 'audio' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
              )}
            </section>

            {/* Responses */}
            <section id="responses" style={box}>
              <button
                onClick={() => toggleSection('responses')}
                style={{ ...btn, background: 'transparent', border: 'none', padding: 0, marginBottom: 8 }}
              >
                {openSections.responses ? '▼' : '▶'} <strong>Server Responses</strong>
              </button>

              {openSections.responses && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginBottom: 8 }}>
                    {responseTypes.map(r => (
                      <button
                        key={r.key}
                        onClick={() => setActiveRespTab(r.key)}
                        style={{
                          ...btn,
                          padding: '8px 10px',
                          background: activeRespTab === r.key ? '#e0e7ff' : '#fff',
                          borderColor: activeRespTab === r.key ? '#6366f1' : '#d1d5db',
                        }}
                      >
                        {r.name}
                      </button>
                    ))}
                  </div>

                  {responseTypes.map(r =>
                    r.key === activeRespTab ? (
                      <div key={r.key} style={{ ...box, padding: 12 }}>
                        <div style={{ fontWeight: 700, marginBottom: 4 }}>{r.name}</div>
                        <div style={{ color: '#374151', marginBottom: 8 }}>{r.description}</div>
                        <div style={{ position: 'relative' }}>
                          <pre style={codeBox}>{r.example}</pre>
                          <button
                            onClick={() => copyToClipboard(r.example, `resp-${r.key}`)}
                            style={{ ...btn, position: 'absolute', top: 8, right: 8 }}
                          >
                            {copiedKey === `resp-${r.key}` ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                      </div>
                    ) : null
                  )}
                </div>
              )}
            </section>

            {/* Errors */}
            <section id="errors" style={box}>
              <button
                onClick={() => toggleSection('errors')}
                style={{ ...btn, background: 'transparent', border: 'none', padding: 0, marginBottom: 8 }}
              >
                {openSections.errors ? '▼' : '▶'} <strong>Error Handling</strong>
              </button>

              {openSections.errors && (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left', borderBottom: '1px solid #e5e7eb', padding: 8 }}>Code</th>
                        <th style={{ textAlign: 'left', borderBottom: '1px solid #e5e7eb', padding: 8 }}>Type</th>
                        <th style={{ textAlign: 'left', borderBottom: '1px solid #e5e7eb', padding: 8 }}>
                          Description
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {errorCodes.map(er => (
                        <tr key={er.code}>
                          <td style={{ padding: 8, fontFamily: 'monospace', fontWeight: 600 }}>{er.code}</td>
                          <td style={{ padding: 8 }}>
                            <span style={pill(er.type === 'WebSocket' ? '#dbeafe' : '#e5e7eb', '#111827')}>
                              {er.type}
                            </span>
                          </td>
                          <td style={{ padding: 8 }}>{er.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* Examples */}
            <section id="examples" style={box}>
              <h3 style={{ marginTop: 0 }}>Complete Implementation Example</h3>
              <p style={{ marginTop: 0, color: '#374151' }}>
                Full JavaScript client implementation for Whisper Live Server
              </p>

              <div style={{ position: 'relative' }}>
                <pre style={{ ...codeBox, maxHeight: 380 }}>{bigExample}</pre>
                <button
                  onClick={() => copyToClipboard(bigExample, 'big')}
                  style={{ ...btn, position: 'absolute', top: 8, right: 8 }}
                >
                  {copiedKey === 'big' ? 'Copied' : 'Copy'}
                </button>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
