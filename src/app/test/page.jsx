'use client';

import { useEffect, useRef, useState } from 'react';

export default function AudioTranscription() {
  const [status, setStatus] = useState('init');
  const [partial, setPartial] = useState('');
  const [finals, setFinals] = useState([]);
  const [closeInfo, setCloseInfo] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [debugLogs, setDebugLogs] = useState([]);

  const wsRef = useRef(null);
  const keepAliveRef = useRef(null);
  const readyRef = useRef(false);

  const streamRef = useRef(null);
  const ctxRef = useRef(null);
  const srcRef = useRef(null);
  const procRef = useRef(null);

  // === Аудио/протокол (оставил как в вашем «рабочем коде») ===
  const SR = 16000;
  const CHUNK_SIZE = 4096; // как в Python-коде у друга
  const CHANNELS = 1;
  const FORMAT = 'pcm_s16le'; // информативно (здесь не конвертируем в int16)

  const AUTH = 'mysecret123';
  const LANG = 'ru';
  const WS_URLS = ['wss://asr.motrig.ru/', 'wss://asr.motrig.ru:9090/'];

  const addDebugLog = message => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log('[asr]', logMessage);
    setDebugLogs(prev => [...prev.slice(-199), logMessage]);
  };

  useEffect(() => {
    addDebugLog('Компонент инициализирован');
    setStatus('ready');
    return () => stop(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startRecording = async () => {
    try {
      addDebugLog('Начинаем запись…');
      setIsRecording(true);
      setStatus('connecting');

      addDebugLog('Запрашиваем доступ к микрофону…');
      await ensureMic();
      addDebugLog('Доступ к микрофону получен');

      addDebugLog('Подключаемся к WebSocket…');
      await connectWSWithFallback();
      addDebugLog('WebSocket подключен успешно');

      addDebugLog('Запускаем аудиопайплайн…');
      await startAudioPipeline();
      addDebugLog('Аудиопайплайн запущен');
    } catch (e) {
      addDebugLog(`Ошибка при запуске записи: ${e.message}`);
      console.error('[asr] Полная ошибка:', e);
      setIsRecording(false);
      if (String(e?.name).includes('NotAllowedError')) {
        setStatus('denied');
      } else if (String(e?.message).match(/gesture|resume|suspended/i)) {
        setStatus('need-gesture');
      } else {
        setStatus('error');
      }
    }
  };

  const stopRecording = async () => {
    addDebugLog('Останавливаем запись…');
    setIsRecording(false);
    await stop(true);
    addDebugLog('Запись остановлена');
  };

  const resumeAudio = async () => {
    addDebugLog('Попытка resume AudioContext…');
    if (ctxRef.current?.state === 'suspended') {
      await ctxRef.current.resume();
      addDebugLog(`AudioContext state: ${ctxRef.current.state}`);
    }
    if (ctxRef.current?.state === 'running') {
      setStatus('streaming');
    }
  };

  // ---- MIC ----
  async function ensureMic() {
    addDebugLog('Вызов getUserMedia…');
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: CHANNELS,
        sampleRate: SR,
        echoCancellation: true,
        noiseSuppression: true,
      },
      video: false,
    });
    streamRef.current = stream;
    addDebugLog(`Микрофон получен, треков: ${stream.getAudioTracks().length}`);
  }

  // ---- WS (fallback: 443 → 9090) ----
  async function connectWSWithFallback() {
    let lastErr = null;

    for (const url of WS_URLS) {
      try {
        addDebugLog(`Пробуем подключиться к: ${url}`);
        await new Promise((resolve, reject) => {
          const ws = new WebSocket(url);
          ws.binaryType = 'arraybuffer';
          wsRef.current = ws;
          readyRef.current = false;

          ws.onopen = () => {
            addDebugLog(`WebSocket открыт: ${url}`);
            const options = {
              uid: `web-${Date.now()}`,
              auth: AUTH,
              language: LANG,
              task: 'transcribe',
              model: 'small',
              use_vad: true,
              send_last_n_segments: 10,
              no_speech_thresh: 0.45,
              clip_audio: false,
              same_output_threshold: 10,
              enable_translation: false,
              target_language: 'fr',
              // при желании можно добавить: sample_rate: 16000, format: 'pcm_s16le'
            };
            addDebugLog(`Отправляем options: ${JSON.stringify(options)}`);
            ws.send(JSON.stringify(options));
          };

          ws.onmessage = async evt => {
            addDebugLog(`RAW сообщение: ${evt.data}`);
            const text = await toText(evt.data);
            if (!text) {
              addDebugLog('Не удалось превратить сообщение в текст');
              return;
            }
            addDebugLog(`Текст сообщения: ${text}`);

            let msg;
            try {
              msg = JSON.parse(text);
            } catch (e) {
              addDebugLog(`JSON parse error: ${e.message}`);
              return;
            }

            addDebugLog(`Parsed: ${JSON.stringify(msg)}`);

            if ('status' in msg) {
              if (msg.status === 'ERROR') {
                addDebugLog(`Ошибка от сервера: ${msg?.message || 'ASR error'}`);
                reject(new Error(msg?.message || 'ASR error'));
                return;
              }
              if (msg.status === 'WAIT') {
                addDebugLog(`Сервер занят: ${msg.message} минут`);
                return;
              }
              if (msg.status === 'WARNING') {
                addDebugLog(`WARNING: ${msg.message}`);
                return;
              }
            }

            if (msg.message === 'SERVER_READY') {
              addDebugLog('SERVER_READY');
              readyRef.current = true;
              setStatus('streaming');
              resolve();
              return;
            }

            if (msg.message === 'DISCONNECT') {
              addDebugLog('Сервер отключил соединение');
              setIsRecording(false);
              return;
            }

            if ('segments' in msg) {
              addDebugLog(`Segments: ${JSON.stringify(msg.segments)}`);
              processSegments(msg.segments);
            }

            if ('language' in msg) {
              addDebugLog(`Язык: ${msg.language} (p=${msg.language_prob})`);
            }

            if ('translated_segments' in msg) {
              addDebugLog(`Переведённые сегменты: ${JSON.stringify(msg.translated_segments)}`);
            }

            const known = [
              'status',
              'message',
              'segments',
              'language',
              'language_prob',
              'translated_segments',
              'uid',
              'backend',
            ];
            const unknown = Object.keys(msg).filter(k => !known.includes(k));
            if (unknown.length) addDebugLog(`Неизвестные поля: ${unknown.join(', ')}`);
          };

          ws.onerror = e => {
            addDebugLog(`WS error: ${e?.message || e}`);
            lastErr = e;
          };

          ws.onclose = e => {
            addDebugLog(`WS closed: code=${e.code}, reason=${e.reason}`);
            setCloseInfo(`code=${e.code}${e.reason ? `, reason=${e.reason}` : ''}`);
            if (readyRef.current) {
              setStatus(s => (s === 'error' ? s : 'stopped'));
              resolve();
            } else {
              reject(new Error(`ws closed before READY (${e.code}${e.reason ? `, ${e.reason}` : ''})`));
            }
          };
        });

        if (readyRef.current) return;
      } catch (e) {
        addDebugLog(`Ошибка подключения к ${url}: ${e.message}`);
        lastErr = e;
      }
    }
    throw lastErr || new Error('WS connect failed');
  }

  // ---- Приходящие сегменты → текст ----
  const processSegments = segments => {
    addDebugLog(`Обрабатываем ${segments.length} сегм.`);
    const all = [];
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      addDebugLog(`seg[${i}]: "${seg.text}" completed=${seg.completed} [${seg.start}-${seg.end}]`);
      if (seg.text && seg.text.trim()) all.push(seg.text.trim());
    }
    if (all.length > 0) {
      const combined = all.join(' ');
      setFinals(prev => [...prev, combined]);
    }
  };

  // ---- Аудио пайплайн (ScriptProcessor как в вашем коде) ----
  async function startAudioPipeline() {
    addDebugLog('Создаём AudioContext…');
    const ctx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: SR });
    ctxRef.current = ctx;
    addDebugLog(`AudioContext: state=${ctx.state}, sampleRate=${ctx.sampleRate}`);

    if (ctx.state === 'suspended') {
      addDebugLog('Пробуем resume AudioContext…');
      try {
        await ctx.resume();
        addDebugLog(`state=${ctx.state}`);
      } catch (e) {
        addDebugLog(`resume error: ${e.message}`);
      }
    }
    if (ctx.state === 'suspended') {
      setStatus('need-gesture');
      return;
    }

    addDebugLog('Создаём MediaStreamSource…');
    const src = ctx.createMediaStreamSource(streamRef.current);
    srcRef.current = src;

    addDebugLog('Создаём ScriptProcessor…');
    const proc = ctx.createScriptProcessor(CHUNK_SIZE, 1, 1);
    procRef.current = proc;

    let frameCount = 0;
    proc.onaudioprocess = e => {
      const ws = wsRef.current;
      if (!ws || ws.readyState !== WebSocket.OPEN || !readyRef.current) return;

      frameCount++;
      if (frameCount % 100 === 0) addDebugLog(`Фреймов обработано: ${frameCount}`);

      const inputData = e.inputBuffer.getChannelData(0); // Float32
      const floatCopy = bytesToFloatArray(inputData); // копия Float32Array
      const audioBytes = floatCopy.buffer.slice(floatCopy.byteOffset, floatCopy.byteOffset + floatCopy.byteLength);

      try {
        ws.send(audioBytes); // отправляем как есть (Float32), как в вашем рабочем варианте
        if (frameCount % 50 === 0) addDebugLog(`Отправлен chunk: ${audioBytes.byteLength} байт`);
      } catch (err) {
        addDebugLog(`Ошибка отправки аудио: ${err.message}`);
      }
    };

    addDebugLog('Подключаем узлы…');
    src.connect(proc);
    proc.connect(ctx.destination);

    if (readyRef.current) setStatus('streaming');
  }

  // ---- Остановка / очистка ----
  async function stop(sendEOF = true) {
    addDebugLog('Стоп-процедура…');
    try {
      if (sendEOF && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        addDebugLog('Отправляем END_OF_AUDIO');
        // Если серверу нужно JSON {eof:true} — замените на:
        // wsRef.current.send(JSON.stringify({ eof: true }));
        const encoder = new TextEncoder();
        const endBytes = encoder.encode('END_OF_AUDIO');
        wsRef.current.send(endBytes);
      }
    } catch (e) {
      addDebugLog(`Ошибка EOF: ${e.message}`);
    }

    try {
      procRef.current && procRef.current.disconnect();
      addDebugLog('ScriptProcessor отключен');
    } catch {}
    try {
      srcRef.current && srcRef.current.disconnect();
      addDebugLog('MediaStreamSource отключен');
    } catch {}
    try {
      ctxRef.current && ctxRef.current.state !== 'closed' && (await ctxRef.current.close());
      addDebugLog('AudioContext закрыт');
    } catch {}
    try {
      streamRef.current && streamRef.current.getTracks().forEach(t => t.stop());
      addDebugLog('Треки остановлены');
    } catch {}
    try {
      wsRef.current && wsRef.current.close();
      addDebugLog('WS закрыт');
    } catch {}

    wsRef.current = null;
    setStatus('ready');
    addDebugLog('Остановка завершена');
  }

  // Копируем Float32Array (по сути просто дублируем буфер)
  function bytesToFloatArray(inputData) {
    const arr = new Float32Array(inputData.length);
    for (let i = 0; i < inputData.length; i++) arr[i] = inputData[i];
    return arr;
  }

  async function toText(data) {
    try {
      if (typeof data === 'string') return data;
      if (data instanceof Blob) return await data.text();
      if (data instanceof ArrayBuffer) return new TextDecoder().decode(data);
    } catch {}
    return null;
  }

  const clearText = () => {
    setPartial('');
    setFinals([]);
    addDebugLog('Текст очищен');
  };

  const clearLogs = () => {
    setDebugLogs([]);
    addDebugLog('Логи очищены');
  };

  const statusText =
    {
      ready: 'Готов к записи',
      connecting: 'Подключение к серверу…',
      streaming: 'Запись и транскрипция',
      stopped: 'Запись остановлена',
      error: 'Ошибка подключения',
      denied: 'Доступ к микрофону запрещён',
      'need-gesture': 'Требуется разрешение браузера',
    }[status] || status;

  return (
    <div style={{ minHeight: '100vh', padding: 16 }}>
      <h1>Транскрипция речи в реальном времени</h1>
      <p>
        Статус: <b>{statusText}</b> {closeInfo ? ` — ${closeInfo}` : ''}
      </p>

      {status === 'need-gesture' && (
        <div>
          <p>Браузер заблокировал автозапуск аудио. Нажмите кнопку ниже.</p>
          <button onClick={resumeAudio}>Включить звук</button>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, margin: '12px 0' }}>
        {!isRecording ? (
          <button onClick={startRecording} disabled={status === 'connecting' || status === 'denied'}>
            Начать запись
          </button>
        ) : (
          <button onClick={stopRecording}>Остановить запись</button>
        )}
        <button onClick={clearText}>Очистить текст</button>
        <button onClick={clearLogs}>Очистить логи</button>
      </div>

      <div style={{ marginTop: 10 }}>
        <label>Отладочные логи:</label>
        <pre style={{ background: '#f6f8fa', padding: 12, maxHeight: 160, overflowY: 'auto', whiteSpace: 'pre-wrap' }}>
          {debugLogs.length ? debugLogs.join('\n') : 'Логи будут отображаться здесь…'}
        </pre>
      </div>

      <div style={{ marginTop: 12 }}>
        <label>Итоговый текст:</label>
        <div style={{ background: '#f0fff4', padding: 12, minHeight: 120, whiteSpace: 'pre-wrap' }}>
          {finals.length ? finals.join(' ') : 'Здесь будет отображаться текст транскрипции…'}
        </div>
      </div>

      {/* Если хотите показывать «промежуточно»: */}
      {partial && (
        <div style={{ marginTop: 12 }}>
          <label>Промежуточно:</label>
          <div style={{ background: '#f7fafc', padding: 12, whiteSpace: 'pre-wrap' }}>{partial}</div>
        </div>
      )}

      {status === 'denied' && (
        <div style={{ marginTop: 12, background: '#fff5f5', padding: 12 }}>
          Доступ к микрофону запрещён. Разрешите микрофон в настройках браузера и обновите страницу.
        </div>
      )}

      <div style={{ marginTop: 16, fontSize: 12, opacity: 0.7 }}>
        Приложение отправляет аудио-чанки размером {CHUNK_SIZE} сэмплов на сервер Whisper Live. Серверы:{' '}
        {WS_URLS.join(', ')}.
      </div>
    </div>
  );
}
