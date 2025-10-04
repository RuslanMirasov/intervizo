// 'use client';

// import { useEffect, useRef, useState } from 'react';

// export default function AudioTranscription() {
//   const [status, setStatus] = useState('init');
//   const [partial, setPartial] = useState('');
//   const [segments, setSegments] = useState([]);
//   const [currentSegment, setCurrentSegment] = useState('');
//   const [closeInfo, setCloseInfo] = useState('');
//   const [isRecording, setIsRecording] = useState(false);
//   const [debugLogs, setDebugLogs] = useState([]);

//   const wsRef = useRef(null);
//   const keepAliveRef = useRef(null);
//   const readyRef = useRef(false);

//   const streamRef = useRef(null);
//   const ctxRef = useRef(null);
//   const srcRef = useRef(null);
//   const procRef = useRef(null);

//   const SR = 16000;
//   const CHUNK_SIZE = 4096;
//   const CHANNELS = 1;
//   const FORMAT = 'pcm_s16le';

//   const AUTH = 'mysecret123';
//   const LANG = 'ru';
//   const WS_URLS = ['wss://asr.motrig.ru/', 'wss://asr.motrig.ru:9090/'];

//   const addDebugLog = message => {
//     const timestamp = new Date().toLocaleTimeString();
//     const logMessage = `[${timestamp}] ${message}`;
//     console.log('[asr]', logMessage);
//     setDebugLogs(prev => [...prev.slice(-199), logMessage]);
//   };

//   useEffect(() => {
//     addDebugLog('Компонент инициализирован');
//     setStatus('ready');
//     return () => stop(true);
//   }, []);

//   const startRecording = async () => {
//     try {
//       addDebugLog('Начинаем запись…');
//       setIsRecording(true);
//       setStatus('connecting');

//       addDebugLog('Запрашиваем доступ к микрофону…');
//       await ensureMic();
//       addDebugLog('Доступ к микрофону получен');

//       addDebugLog('Подключаемся к WebSocket…');
//       await connectWSWithFallback();
//       addDebugLog('WebSocket подключен успешно');

//       addDebugLog('Запускаем аудиопайплайн…');
//       await startAudioPipeline();
//       addDebugLog('Аудиопайплайн запущен');
//     } catch (e) {
//       addDebugLog(`Ошибка при запуске записи: ${e.message}`);
//       console.error('[asr] Полная ошибка:', e);
//       setIsRecording(false);
//       if (String(e?.name).includes('NotAllowedError')) {
//         setStatus('denied');
//       } else if (String(e?.message).match(/gesture|resume|suspended/i)) {
//         setStatus('need-gesture');
//       } else {
//         setStatus('error');
//       }
//     }
//   };

//   const stopRecording = async () => {
//     addDebugLog('Останавливаем запись…');
//     setIsRecording(false);
//     await stop(true);
//     addDebugLog('Запись остановлена');
//   };

//   const resumeAudio = async () => {
//     addDebugLog('Попытка resume AudioContext…');
//     if (ctxRef.current?.state === 'suspended') {
//       await ctxRef.current.resume();
//       addDebugLog(`AudioContext state: ${ctxRef.current.state}`);
//     }
//     if (ctxRef.current?.state === 'running') {
//       setStatus('streaming');
//     }
//   };

//   // ---- MIC ----
//   async function ensureMic() {
//     addDebugLog('Вызов getUserMedia…');
//     const stream = await navigator.mediaDevices.getUserMedia({
//       audio: {
//         channelCount: CHANNELS,
//         sampleRate: SR,
//         echoCancellation: true,
//         noiseSuppression: true,
//       },
//       video: false,
//     });
//     streamRef.current = stream;
//     addDebugLog(`Микрофон получен, треков: ${stream.getAudioTracks().length}`);
//   }

//   async function connectWSWithFallback() {
//     let lastErr = null;

//     for (const url of WS_URLS) {
//       try {
//         addDebugLog(`Пробуем подключиться к: ${url}`);
//         await new Promise((resolve, reject) => {
//           const ws = new WebSocket(url);
//           ws.binaryType = 'arraybuffer';
//           wsRef.current = ws;
//           readyRef.current = false;

//           ws.onopen = () => {
//             addDebugLog(`WebSocket открыт: ${url}`);
//             const options = {
//               uid: `web-${Date.now()}`,
//               auth: AUTH,
//               language: LANG,
//               task: 'transcribe',
//               model: 'small',
//               use_vad: true,
//               send_last_n_segments: 10,
//               no_speech_thresh: 0.45,
//               clip_audio: false,
//               same_output_threshold: 10,
//               enable_translation: false,
//               target_language: 'fr',
//             };
//             addDebugLog(`Отправляем options: ${JSON.stringify(options)}`);
//             ws.send(JSON.stringify(options));
//           };

//           ws.onmessage = async evt => {
//             addDebugLog(`RAW сообщение: ${evt.data}`);
//             const text = await toText(evt.data);
//             if (!text) {
//               addDebugLog('Не удалось превратить сообщение в текст');
//               return;
//             }
//             addDebugLog(`Текст сообщения: ${text}`);

//             let msg;
//             try {
//               msg = JSON.parse(text);
//             } catch (e) {
//               addDebugLog(`JSON parse error: ${e.message}`);
//               return;
//             }

//             addDebugLog(`Parsed: ${JSON.stringify(msg)}`);

//             if ('status' in msg) {
//               if (msg.status === 'ERROR') {
//                 addDebugLog(`Ошибка от сервера: ${msg?.message || 'ASR error'}`);
//                 reject(new Error(msg?.message || 'ASR error'));
//                 return;
//               }
//               if (msg.status === 'WAIT') {
//                 addDebugLog(`Сервер занят: ${msg.message} минут`);
//                 return;
//               }
//               if (msg.status === 'WARNING') {
//                 addDebugLog(`WARNING: ${msg.message}`);
//                 return;
//               }
//             }

//             if (msg.message === 'SERVER_READY') {
//               addDebugLog('SERVER_READY');
//               readyRef.current = true;
//               setStatus('streaming');
//               resolve();
//               return;
//             }

//             if (msg.message === 'DISCONNECT') {
//               addDebugLog('Сервер отключил соединение');
//               setIsRecording(false);
//               return;
//             }

//             if ('segments' in msg) {
//               addDebugLog(`Segments: ${JSON.stringify(msg.segments)}`);
//               processSegments(msg.segments);
//             }

//             if ('language' in msg) {
//               addDebugLog(`Язык: ${msg.language} (p=${msg.language_prob})`);
//             }

//             if ('translated_segments' in msg) {
//               addDebugLog(`Переведённые сегменты: ${JSON.stringify(msg.translated_segments)}`);
//             }

//             const known = [
//               'status',
//               'message',
//               'segments',
//               'language',
//               'language_prob',
//               'translated_segments',
//               'uid',
//               'backend',
//             ];
//             const unknown = Object.keys(msg).filter(k => !known.includes(k));
//             if (unknown.length) addDebugLog(`Неизвестные поля: ${unknown.join(', ')}`);
//           };

//           ws.onerror = e => {
//             addDebugLog(`WS error: ${e?.message || e}`);
//             lastErr = e;
//           };

//           ws.onclose = e => {
//             addDebugLog(`WS closed: code=${e.code}, reason=${e.reason}`);
//             setCloseInfo(`code=${e.code}${e.reason ? `, reason=${e.reason}` : ''}`);
//             if (readyRef.current) {
//               setStatus(s => (s === 'error' ? s : 'stopped'));
//               resolve();
//             } else {
//               reject(new Error(`ws closed before READY (${e.code}${e.reason ? `, ${e.reason}` : ''})`));
//             }
//           };
//         });

//         if (readyRef.current) return;
//       } catch (e) {
//         addDebugLog(`Ошибка подключения к ${url}: ${e.message}`);
//         lastErr = e;
//       }
//     }
//     throw lastErr || new Error('WS connect failed');
//   }

//   const processSegments = segments => {
//     addDebugLog(`Обрабатываем ${segments.length} сегм.`);

//     segments.forEach((seg, idx) => {
//       addDebugLog(`seg[${idx}]: "${seg.text}" completed=${seg.completed} [${seg.start}-${seg.end}]`);

//       if (!seg.text || !seg.text.trim()) return;

//       if (seg.completed) {
//         setSegments(prev => {
//           const trimmedText = seg.text.trim();

//           if (prev.includes(trimmedText)) {
//             addDebugLog(`Сегмент "${trimmedText}" уже существует, пропускаем`);
//             return prev;
//           }
//           addDebugLog(`Добавляем новый сегмент: "${trimmedText}"`);
//           return [...prev, trimmedText];
//         });
//         setCurrentSegment('');
//       } else {
//         setCurrentSegment(seg.text.trim());
//       }
//     });
//   };

//   async function startAudioPipeline() {
//     addDebugLog('Создаём AudioContext…');
//     const ctx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: SR });
//     ctxRef.current = ctx;
//     addDebugLog(`AudioContext: state=${ctx.state}, sampleRate=${ctx.sampleRate}`);

//     if (ctx.state === 'suspended') {
//       addDebugLog('Пробуем resume AudioContext…');
//       try {
//         await ctx.resume();
//         addDebugLog(`state=${ctx.state}`);
//       } catch (e) {
//         addDebugLog(`resume error: ${e.message}`);
//       }
//     }
//     if (ctx.state === 'suspended') {
//       setStatus('need-gesture');
//       return;
//     }

//     addDebugLog('Создаём MediaStreamSource…');
//     const src = ctx.createMediaStreamSource(streamRef.current);
//     srcRef.current = src;

//     addDebugLog('Создаём ScriptProcessor…');
//     const proc = ctx.createScriptProcessor(CHUNK_SIZE, 1, 1);
//     procRef.current = proc;

//     let frameCount = 0;
//     proc.onaudioprocess = e => {
//       const ws = wsRef.current;
//       if (!ws || ws.readyState !== WebSocket.OPEN || !readyRef.current) return;

//       frameCount++;
//       if (frameCount % 100 === 0) addDebugLog(`Фреймов обработано: ${frameCount}`);

//       const inputData = e.inputBuffer.getChannelData(0);
//       const floatCopy = bytesToFloatArray(inputData);
//       const audioBytes = floatCopy.buffer.slice(floatCopy.byteOffset, floatCopy.byteOffset + floatCopy.byteLength);

//       try {
//         ws.send(audioBytes);
//         if (frameCount % 50 === 0) addDebugLog(`Отправлен chunk: ${audioBytes.byteLength} байт`);
//       } catch (err) {
//         addDebugLog(`Ошибка отправки аудио: ${err.message}`);
//       }
//     };

//     addDebugLog('Подключаем узлы…');
//     src.connect(proc);
//     proc.connect(ctx.destination);

//     if (readyRef.current) setStatus('streaming');
//   }

//   async function stop(sendEOF = true) {
//     addDebugLog('Стоп-процедура…');
//     try {
//       if (sendEOF && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
//         addDebugLog('Отправляем END_OF_AUDIO');
//         const encoder = new TextEncoder();
//         const endBytes = encoder.encode('END_OF_AUDIO');
//         wsRef.current.send(endBytes);
//       }
//     } catch (e) {
//       addDebugLog(`Ошибка EOF: ${e.message}`);
//     }

//     try {
//       procRef.current && procRef.current.disconnect();
//       addDebugLog('ScriptProcessor отключен');
//     } catch {}
//     try {
//       srcRef.current && srcRef.current.disconnect();
//       addDebugLog('MediaStreamSource отключен');
//     } catch {}
//     try {
//       ctxRef.current && ctxRef.current.state !== 'closed' && (await ctxRef.current.close());
//       addDebugLog('AudioContext закрыт');
//     } catch {}
//     try {
//       streamRef.current && streamRef.current.getTracks().forEach(t => t.stop());
//       addDebugLog('Треки остановлены');
//     } catch {}
//     try {
//       wsRef.current && wsRef.current.close();
//       addDebugLog('WS закрыт');
//     } catch {}

//     wsRef.current = null;
//     setStatus('ready');
//     addDebugLog('Остановка завершена');
//   }

//   function bytesToFloatArray(inputData) {
//     const arr = new Float32Array(inputData.length);
//     for (let i = 0; i < inputData.length; i++) arr[i] = inputData[i];
//     return arr;
//   }

//   async function toText(data) {
//     try {
//       if (typeof data === 'string') return data;
//       if (data instanceof Blob) return await data.text();
//       if (data instanceof ArrayBuffer) return new TextDecoder().decode(data);
//     } catch {}
//     return null;
//   }

//   const clearText = () => {
//     setCurrentSegment('');
//     setSegments([]);
//     addDebugLog('Текст очищен');
//   };

//   const clearLogs = () => {
//     setDebugLogs([]);
//     addDebugLog('Логи очищены');
//   };

//   const statusText =
//     {
//       ready: 'Готов к записи',
//       connecting: 'Подключение к серверу…',
//       streaming: 'Запись и транскрипция',
//       stopped: 'Запись остановлена',
//       error: 'Ошибка подключения',
//       denied: 'Доступ к микрофону запрещён',
//       'need-gesture': 'Требуется разрешение браузера',
//     }[status] || status;

//   return (
//     <div style={{ minHeight: '100vh', padding: '24px', fontFamily: 'system-ui, sans-serif' }}>
//       <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '16px' }}>
//         Транскрипция речи в реальном времени
//       </div>

//       <div style={{ marginBottom: '16px' }}>
//         Статус: <span style={{ fontWeight: 'bold' }}>{statusText}</span> {closeInfo ? ` — ${closeInfo}` : ''}
//       </div>

//       {status === 'need-gesture' && (
//         <div style={{ marginBottom: '16px', padding: '12px', background: '#fef3c7', borderRadius: '8px' }}>
//           <p style={{ margin: '0 0 8px 0' }}>Браузер заблокировал автозапуск аудио. Нажмите кнопку ниже.</p>
//           <button
//             onClick={resumeAudio}
//             style={{
//               padding: '8px 16px',
//               background: '#3b82f6',
//               color: 'white',
//               border: 'none',
//               borderRadius: '6px',
//               cursor: 'pointer',
//               fontSize: '14px',
//             }}
//           >
//             Включить звук
//           </button>
//         </div>
//       )}

//       <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
//         {!isRecording ? (
//           <button
//             onClick={startRecording}
//             disabled={status === 'connecting' || status === 'denied'}
//             style={{
//               padding: '10px 20px',
//               background: status === 'connecting' || status === 'denied' ? '#d1d5db' : '#10b981',
//               color: 'white',
//               border: 'none',
//               borderRadius: '6px',
//               cursor: status === 'connecting' || status === 'denied' ? 'not-allowed' : 'pointer',
//               fontSize: '14px',
//               fontWeight: '500',
//             }}
//           >
//             Начать запись
//           </button>
//         ) : (
//           <button
//             onClick={stopRecording}
//             style={{
//               padding: '10px 20px',
//               background: '#ef4444',
//               color: 'white',
//               border: 'none',
//               borderRadius: '6px',
//               cursor: 'pointer',
//               fontSize: '14px',
//               fontWeight: '500',
//             }}
//           >
//             Остановить запись
//           </button>
//         )}
//         <button
//           onClick={clearText}
//           style={{
//             padding: '10px 20px',
//             background: '#6b7280',
//             color: 'white',
//             border: 'none',
//             borderRadius: '6px',
//             cursor: 'pointer',
//             fontSize: '14px',
//             fontWeight: '500',
//           }}
//         >
//           Очистить текст
//         </button>
//         <button
//           onClick={clearLogs}
//           style={{
//             padding: '10px 20px',
//             background: '#6b7280',
//             color: 'white',
//             border: 'none',
//             borderRadius: '6px',
//             cursor: 'pointer',
//             fontSize: '14px',
//             fontWeight: '500',
//           }}
//         >
//           Очистить логи
//         </button>
//       </div>

//       <div style={{ marginBottom: '16px' }}>
//         <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Отладочные логи:</div>
//         <pre
//           style={{
//             background: '#f3f4f6',
//             padding: '12px',
//             maxHeight: '160px',
//             overflowY: 'auto',
//             whiteSpace: 'pre-wrap',
//             borderRadius: '6px',
//             fontSize: '12px',
//             fontFamily: 'monospace',
//             margin: 0,
//           }}
//         >
//           {debugLogs.length ? debugLogs.join('\n') : 'Логи будут отображаться здесь…'}
//         </pre>
//       </div>

//       <div style={{ marginBottom: '16px' }}>
//         <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Сегменты (кусочки речи):</div>
//         <div
//           style={{
//             background: '#eff6ff',
//             padding: '12px',
//             minHeight: '120px',
//             maxHeight: '200px',
//             overflowY: 'auto',
//             borderRadius: '6px',
//           }}
//         >
//           {segments.length > 0 ? (
//             segments.map((seg, idx) => (
//               <div key={idx} style={{ marginBottom: '6px', lineHeight: '1.5' }}>
//                 <span style={{ color: '#3b82f6', fontWeight: 'bold', marginRight: '8px' }}>{idx + 1}.</span>
//                 <span>{seg}</span>
//               </div>
//             ))
//           ) : (
//             <span style={{ color: '#9ca3af' }}>Сегменты будут отображаться здесь…</span>
//           )}
//           {currentSegment && (
//             <div
//               style={{
//                 marginTop: '12px',
//                 padding: '10px',
//                 background: '#fef3c7',
//                 borderRadius: '6px',
//                 borderLeft: '3px solid #f59e0b',
//               }}
//             >
//               <span style={{ color: '#f59e0b', fontWeight: 'bold', marginRight: '8px' }}>⏳ Текущий:</span>
//               <span>{currentSegment}</span>
//             </div>
//           )}
//         </div>
//       </div>

//       <div style={{ marginBottom: '16px' }}>
//         <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Финальный текст:</div>
//         <div
//           style={{
//             background: '#f0fdf4',
//             padding: '12px',
//             minHeight: '120px',
//             whiteSpace: 'pre-wrap',
//             borderRadius: '6px',
//             lineHeight: '1.6',
//           }}
//         >
//           {segments.length > 0 ? (
//             segments.join(' ')
//           ) : (
//             <span style={{ color: '#9ca3af' }}>Здесь будет отображаться финальный текст…</span>
//           )}
//         </div>
//       </div>

//       {status === 'denied' && (
//         <div
//           style={{
//             marginTop: '16px',
//             background: '#fee2e2',
//             padding: '12px',
//             borderRadius: '8px',
//             borderLeft: '3px solid #ef4444',
//             color: '#991b1b',
//           }}
//         >
//           Доступ к микрофону запрещён. Разрешите микрофон в настройках браузера и обновите страницу.
//         </div>
//       )}

//       <div style={{ marginTop: '24px', fontSize: '12px', color: '#6b7280', lineHeight: '1.5' }}>
//         Приложение отправляет аудио-чанки размером {CHUNK_SIZE} сэмплов на сервер Whisper Live. Серверы:{' '}
//         {WS_URLS.join(', ')}.
//       </div>
//     </div>
//   );
// }

'use client';

import { useEffect, useRef, useState } from 'react';

const DEFAULT_REPEAT_TRIGGERS = [
  // Russian
  'повторите вопрос',
  'повтори вопрос',
  'вопрос ещё раз',
  'вопрос повторить',
  'повторите пожалуйста вопрос',
  'повтори пожалуйста вопрос',
  'можно ещё раз вопрос',
  'не расслышал вопрос',
  'не понял вопрос',

  // English
  'repeat the question',
  'can you repeat the question',
  'say the question again',
  'could you repeat the question please',
  'i didn’t hear the question',
  'i didn’t get the question',

  // German
  'wiederholen sie die frage',
  'wiederhole die frage',
  'nochmal die frage',
  'frage wiederholen',
  'können sie die frage wiederholen',
  'ich habe die frage nicht verstanden',
  'ich habe die frage nicht gehört',
];

const DEFAULT_NEXT_TRIGGERS = [
  // Russian
  'следующий вопрос',
  'к следующему вопросу',
  'пропустить вопрос',
  'вопрос пропустить',

  // English
  'next question',
  'go to the next question',
  'skip the question',
  'skip this question',

  // German
  'nächste frage',
  'zur nächsten frage',
  'frage überspringen',
  'diese frage überspringen',
];

export default function AudioTranscription() {
  const [status, setStatus] = useState('init');
  const [partial, setPartial] = useState('');
  const [segments, setSegments] = useState([]);
  const [currentSegment, setCurrentSegment] = useState('');
  const [closeInfo, setCloseInfo] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [debugLogs, setDebugLogs] = useState([]);
  const [detectedTriggers, setDetectedTriggers] = useState([]);

  const wsRef = useRef(null);
  const keepAliveRef = useRef(null);
  const readyRef = useRef(false);

  const streamRef = useRef(null);
  const ctxRef = useRef(null);
  const srcRef = useRef(null);
  const procRef = useRef(null);

  const SR = 16000;
  const CHUNK_SIZE = 4096;
  const CHANNELS = 1;
  const FORMAT = 'pcm_s16le';

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
    if (!currentSegment) {
      return;
    }

    const lowerSegment = currentSegment.toLowerCase();

    for (const trigger of DEFAULT_REPEAT_TRIGGERS) {
      if (lowerSegment.includes(trigger)) {
        addDebugLog(`🔔 ТРИГГЕР ПОВТОРА обнаружен: "${trigger}"`);
        setDetectedTriggers(prev => {
          const lastTrigger = prev[prev.length - 1];
          if (lastTrigger && lastTrigger.phrase === trigger && lastTrigger.type === 'repeat') {
            return prev;
          }
          return [...prev, { type: 'repeat', phrase: trigger, timestamp: new Date().toLocaleTimeString() }];
        });
        return;
      }
    }

    for (const trigger of DEFAULT_NEXT_TRIGGERS) {
      if (lowerSegment.includes(trigger)) {
        addDebugLog(`🔔 ТРИГГЕР СЛЕДУЮЩЕГО обнаружен: "${trigger}"`);
        setDetectedTriggers(prev => {
          const lastTrigger = prev[prev.length - 1];
          if (lastTrigger && lastTrigger.phrase === trigger && lastTrigger.type === 'next') {
            return prev;
          }
          return [...prev, { type: 'next', phrase: trigger, timestamp: new Date().toLocaleTimeString() }];
        });
        return;
      }
    }
  }, [currentSegment]);

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

  const processSegments = segments => {
    addDebugLog(`Обрабатываем ${segments.length} сегм.`);

    segments.forEach((seg, idx) => {
      addDebugLog(`seg[${idx}]: "${seg.text}" completed=${seg.completed} [${seg.start}-${seg.end}]`);

      if (!seg.text || !seg.text.trim()) return;

      if (seg.completed) {
        setSegments(prev => {
          const trimmedText = seg.text.trim();

          if (prev.includes(trimmedText)) {
            addDebugLog(`Сегмент "${trimmedText}" уже существует, пропускаем`);
            return prev;
          }
          addDebugLog(`Добавляем новый сегмент: "${trimmedText}"`);
          return [...prev, trimmedText];
        });
        setCurrentSegment('');
      } else {
        setCurrentSegment(seg.text.trim());
      }
    });
  };

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

      const inputData = e.inputBuffer.getChannelData(0);
      const floatCopy = bytesToFloatArray(inputData);
      const audioBytes = floatCopy.buffer.slice(floatCopy.byteOffset, floatCopy.byteOffset + floatCopy.byteLength);

      try {
        ws.send(audioBytes);
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

  async function stop(sendEOF = true) {
    addDebugLog('Стоп-процедура…');
    try {
      if (sendEOF && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        addDebugLog('Отправляем END_OF_AUDIO');
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
    setCurrentSegment('');
    setSegments([]);
    setDetectedTriggers([]);
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
    <div style={{ width: '100%', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
        Транскрипция речи в реальном времени
      </div>

      <div style={{ marginBottom: '14px' }}>
        Статус: <span style={{ fontWeight: 'bold' }}>{statusText}</span> {closeInfo ? ` — ${closeInfo}` : ''}
      </div>

      {detectedTriggers.length > 0 && (
        <div
          style={{
            marginBottom: '16px',
            padding: '12px',
            background: detectedTriggers[detectedTriggers.length - 1].type === 'repeat' ? '#dbeafe' : '#fef3c7',
            borderRadius: '8px',
            borderLeft: `3px solid ${
              detectedTriggers[detectedTriggers.length - 1].type === 'repeat' ? '#3b82f6' : '#f59e0b'
            }`,
          }}
        >
          <span style={{ fontWeight: 'bold', marginRight: '8px' }}>
            {detectedTriggers[detectedTriggers.length - 1].type === 'repeat'
              ? '🔄 Триггер повтора:'
              : '➡️ Триггер следующего:'}
          </span>
          <span>"{detectedTriggers[detectedTriggers.length - 1].phrase}"</span>
        </div>
      )}

      {status === 'need-gesture' && (
        <div style={{ marginBottom: '16px', padding: '12px', background: '#fef3c7', borderRadius: '8px' }}>
          <p style={{ margin: '0 0 8px 0' }}>Браузер заблокировал автозапуск аудио. Нажмите кнопку ниже.</p>
          <button
            onClick={resumeAudio}
            style={{
              padding: '8px 16px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Включить звук
          </button>
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {!isRecording ? (
          <button
            onClick={startRecording}
            disabled={status === 'connecting' || status === 'denied'}
            style={{
              padding: '10px 20px',
              background: status === 'connecting' || status === 'denied' ? '#d1d5db' : '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: status === 'connecting' || status === 'denied' ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            Начать запись
          </button>
        ) : (
          <button
            onClick={stopRecording}
            style={{
              padding: '10px 20px',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            Остановить запись
          </button>
        )}
        <button
          onClick={clearText}
          style={{
            padding: '10px 20px',
            background: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
          }}
        >
          Очистить текст
        </button>
        <button
          onClick={clearLogs}
          style={{
            padding: '10px 20px',
            background: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
          }}
        >
          Очистить логи
        </button>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Отладочные логи:</div>
        <pre
          style={{
            background: '#f3f4f6',
            padding: '12px',
            maxHeight: '160px',
            overflowY: 'auto',
            whiteSpace: 'pre-wrap',
            borderRadius: '6px',
            fontSize: '12px',
            fontFamily: 'monospace',
            margin: 0,
          }}
        >
          {debugLogs.length ? debugLogs.join('\n') : 'Логи будут отображаться здесь…'}
        </pre>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Обнаруженные триггеры:</div>
        <div
          style={{
            background: '#fef9e7',
            padding: '12px',
            minHeight: '80px',
            maxHeight: '160px',
            overflowY: 'auto',
            borderRadius: '6px',
          }}
        >
          {detectedTriggers.length > 0 ? (
            detectedTriggers.map((trigger, idx) => (
              <div key={idx} style={{ marginBottom: '6px', lineHeight: '1.5' }}>
                <span
                  style={{
                    color: trigger.type === 'repeat' ? '#3b82f6' : '#f59e0b',
                    fontWeight: 'bold',
                    marginRight: '8px',
                  }}
                >
                  {idx + 1}.
                </span>
                <span style={{ marginRight: '8px' }}>{trigger.type === 'repeat' ? '🔄' : '➡️'}</span>
                <span style={{ fontWeight: '500' }}>"{trigger.phrase}"</span>
                <span style={{ color: '#6b7280', fontSize: '12px', marginLeft: '8px' }}>({trigger.timestamp})</span>
              </div>
            ))
          ) : (
            <span style={{ color: '#9ca3af' }}>Триггеры будут отображаться здесь…</span>
          )}
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Сегменты (кусочки речи):</div>
        <div
          style={{
            background: '#eff6ff',
            padding: '12px',
            minHeight: '120px',
            maxHeight: '200px',
            overflowY: 'auto',
            borderRadius: '6px',
          }}
        >
          {segments.length > 0 ? (
            segments.map((seg, idx) => (
              <div key={idx} style={{ marginBottom: '6px', lineHeight: '1.5' }}>
                <span style={{ color: '#3b82f6', fontWeight: 'bold', marginRight: '8px' }}>{idx + 1}.</span>
                <span>{seg}</span>
              </div>
            ))
          ) : (
            <span style={{ color: '#9ca3af' }}>Сегменты будут отображаться здесь…</span>
          )}
          {currentSegment && (
            <div
              style={{
                marginTop: '12px',
                padding: '10px',
                background: '#fef3c7',
                borderRadius: '6px',
                borderLeft: '3px solid #f59e0b',
              }}
            >
              <span style={{ color: '#f59e0b', fontWeight: 'bold', marginRight: '8px' }}>⏳ Текущий:</span>
              <span>{currentSegment}</span>
            </div>
          )}
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Финальный текст:</div>
        <div
          style={{
            background: '#f0fdf4',
            padding: '12px',
            minHeight: '120px',
            whiteSpace: 'pre-wrap',
            borderRadius: '6px',
            lineHeight: '1.6',
          }}
        >
          {segments.length > 0 ? (
            segments.join(' ')
          ) : (
            <span style={{ color: '#9ca3af' }}>Здесь будет отображаться финальный текст…</span>
          )}
        </div>
      </div>

      {status === 'denied' && (
        <div
          style={{
            marginTop: '16px',
            background: '#fee2e2',
            padding: '12px',
            borderRadius: '8px',
            borderLeft: '3px solid #ef4444',
            color: '#991b1b',
          }}
        >
          Доступ к микрофону запрещён. Разрешите микрофон в настройках браузера и обновите страницу.
        </div>
      )}

      <div style={{ marginTop: '24px', fontSize: '12px', color: '#6b7280', lineHeight: '1.5' }}>
        Приложение отправляет аудио-чанки размером {CHUNK_SIZE} сэмплов на сервер Whisper Live. Серверы:{' '}
        {WS_URLS.join(', ')}.
      </div>
    </div>
  );
}
