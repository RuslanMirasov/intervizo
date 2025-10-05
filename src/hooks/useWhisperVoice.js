'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { throttle } from '@/lib/throttle';

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
  "i didn't hear the question",
  "i didn't get the question",
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

const ANALYSER_CONFIG = {
  fftSize: 1024,
  minSamples: 5,
  volumeThreshold: 128,
};

const VOICE_DETECTION_CONFIG = {
  threshold: 15,
  checkInterval: 100,
};

export const useWhisperVoice = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [triggerDetected, setTriggerDetected] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const wsRef = useRef(null);
  const audioContextRef = useRef(null);
  const processorRef = useRef(null);
  const streamRef = useRef(null);
  const segmentsRef = useRef([]);
  const currentSegmentRef = useRef('');
  const keepAliveIntervalRef = useRef(null);
  const isPausedRef = useRef(false);
  const silenceTimeoutRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const voiceDetectionIntervalRef = useRef(null);
  const recordingStartTimeRef = useRef(0);
  const lastTriggerTimeRef = useRef(0);
  const throttledSetTriggerRef = useRef(null);

  const detectTrigger = useCallback(text => {
    const lowerText = text.toLowerCase();

    for (const trigger of DEFAULT_REPEAT_TRIGGERS) {
      if (lowerText.includes(trigger)) {
        return 'repeat';
      }
    }

    for (const trigger of DEFAULT_NEXT_TRIGGERS) {
      if (lowerText.includes(trigger)) {
        return 'next';
      }
    }

    return null;
  }, []);

  const toText = async data => {
    try {
      if (typeof data === 'string') return data;
      if (data instanceof Blob) return await data.text();
      if (data instanceof ArrayBuffer) return new TextDecoder().decode(data);
    } catch {}
    return null;
  };

  const startVoiceDetection = useCallback(() => {
    if (voiceDetectionIntervalRef.current || !analyserRef.current || !dataArrayRef.current) return;

    voiceDetectionIntervalRef.current = setInterval(() => {
      const analyser = analyserRef.current;
      const dataArray = dataArrayRef.current;

      if (!analyser || !dataArray) return;

      analyser.getByteTimeDomainData(dataArray);

      let voiceDetected = 0;
      const { minSamples, volumeThreshold } = ANALYSER_CONFIG;
      const { threshold } = VOICE_DETECTION_CONFIG;

      for (let i = 0; i < dataArray.length; i++) {
        if (Math.abs(dataArray[i] - volumeThreshold) > threshold) {
          voiceDetected++;
          if (voiceDetected >= minSamples) break;
        }
      }

      setIsSpeaking(voiceDetected >= minSamples);
    }, VOICE_DETECTION_CONFIG.checkInterval);
  }, []);

  const stopVoiceDetection = useCallback(() => {
    if (voiceDetectionIntervalRef.current) {
      clearInterval(voiceDetectionIntervalRef.current);
      voiceDetectionIntervalRef.current = null;
    }
    setIsSpeaking(false);
  }, []);

  const connect = useCallback(() => {
    return new Promise(async (resolve, reject) => {
      if (wsRef.current) {
        if (wsRef.current.readyState === WebSocket.OPEN) {
          resolve();
          return;
        }
        // Clean up old connection
        wsRef.current.close();
        wsRef.current = null;
      }

      const WS_URLS = ['wss://asr.motrig.ru/', 'wss://asr.motrig.ru:9090/'];
      let lastError = null;

      for (const url of WS_URLS) {
        try {
          await new Promise((resolveUrl, rejectUrl) => {
            const connectionTimeout = setTimeout(() => {
              rejectUrl(new Error(`Connection timeout for ${url}`));
            }, 10000);

            const ws = new WebSocket(url);
            ws.binaryType = 'arraybuffer';
            wsRef.current = ws;
            let serverReady = false;

            ws.onopen = () => {
              const options = {
                uid: `web-${Date.now()}`,
                auth: 'mysecret123',
                language: 'ru',
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
              ws.send(JSON.stringify(options));
            };

            ws.onmessage = async event => {
              const text = await toText(event.data);
              if (!text) return;

              let msg;
              try {
                msg = JSON.parse(text);
              } catch (e) {
                return;
              }

              if ('status' in msg) {
                if (msg.status === 'ERROR') {
                  clearTimeout(connectionTimeout);
                  rejectUrl(new Error(msg?.message || 'ASR error'));
                  return;
                }
                if (msg.status === 'WAIT') {
                  return;
                }
                if (msg.status === 'WARNING') {
                  return;
                }
              }

              if (msg.message === 'SERVER_READY') {
                serverReady = true;
                clearTimeout(connectionTimeout);
                resolveUrl();
                return;
              }

              if (msg.message === 'DISCONNECT') {
                return;
              }

              if (msg.segments && msg.segments.length > 0) {
                const currentRecordingStart = recordingStartTimeRef.current;
                const relevantSegments = msg.segments.filter(seg => seg.start >= currentRecordingStart);

                if (relevantSegments.length === 0) {
                  // All segments are from previous questions, ignore them
                  return;
                }

                const lastIncompleteSegment = relevantSegments
                  .slice()
                  .reverse()
                  .find(seg => !seg.completed && seg.text);

                if (lastIncompleteSegment) {
                  const trigger = detectTrigger(lastIncompleteSegment.text);
                  if (trigger) {
                    if (!throttledSetTriggerRef.current) {
                      throttledSetTriggerRef.current = throttle(detectedTrigger => {
                        setTriggerDetected(detectedTrigger);
                        //setTimeout(() => setTriggerDetected(null), 3000);
                      }, 3000);
                    }

                    throttledSetTriggerRef.current(trigger);
                  }

                  currentSegmentRef.current = lastIncompleteSegment.text.trim();
                }

                relevantSegments.forEach(seg => {
                  if (seg.completed && seg.text && seg.text.trim()) {
                    const trimmedText = seg.text.trim();
                    if (!segmentsRef.current.includes(trimmedText)) {
                      segmentsRef.current.push(trimmedText);
                    }
                  }
                });
              }
            };

            ws.onerror = error => {
              clearTimeout(connectionTimeout);
              if (!serverReady) {
                rejectUrl(new Error(`WebSocket error for ${url}`));
              }
            };

            ws.onclose = event => {
              clearTimeout(connectionTimeout);
              if (!serverReady) {
                rejectUrl(new Error(`WebSocket closed before SERVER_READY (code=${event.code})`));
              }
            };
          });

          resolve();
          return;
        } catch (error) {
          lastError = error;
        }
      }

      reject(lastError || new Error('All WebSocket URLs failed'));
    });
  }, [detectTrigger]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      if (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING) {
        wsRef.current.close();
      }
      wsRef.current = null;
    }
  }, []);

  const startRecord = useCallback(async () => {
    try {
      if (processorRef.current) {
        processorRef.current.disconnect();
        processorRef.current = null;
      }

      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        await audioContextRef.current.close();
        audioContextRef.current = null;
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 16000,
      });
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = ANALYSER_CONFIG.fftSize;
      analyserRef.current = analyser;
      dataArrayRef.current = new Uint8Array(analyser.fftSize);

      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = e => {
        if (isPausedRef.current) return;

        const inputData = e.inputBuffer.getChannelData(0);
        const floatCopy = new Float32Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          floatCopy[i] = inputData[i];
        }
        const audioBytes = floatCopy.buffer.slice(floatCopy.byteOffset, floatCopy.byteOffset + floatCopy.byteLength);

        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(audioBytes);
        }
      };

      source.connect(analyser);
      source.connect(processor);
      processor.connect(audioContext.destination);

      segmentsRef.current = [];
      currentSegmentRef.current = '';
      recordingStartTimeRef.current = audioContext.currentTime;
      setIsRecording(true);
      setIsPaused(false);
      isPausedRef.current = false;

      startVoiceDetection();
    } catch (error) {
      throw error;
    }
  }, [startVoiceDetection]);

  const stopRecord = useCallback(() => {
    return new Promise(resolve => {
      stopVoiceDetection();

      setTimeout(() => {
        if (processorRef.current) {
          processorRef.current.disconnect();
          processorRef.current = null;
        }

        audioContextRef.current = null;

        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }

        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
          silenceTimeoutRef.current = null;
        }

        analyserRef.current = null;
        dataArrayRef.current = null;

        const fullTranscription = segmentsRef.current.join(' ').trim();

        segmentsRef.current = [];
        currentSegmentRef.current = '';
        setIsSpeaking(false);
        setIsRecording(false);
        setIsPaused(false);
        isPausedRef.current = false;

        resolve(fullTranscription);
      }, 500);
    });
  }, [stopVoiceDetection]);

  const pauseRecord = useCallback(async () => {
    isPausedRef.current = true;
    setIsPaused(true);

    stopVoiceDetection();

    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
  }, [stopVoiceDetection]);

  const resumeRecord = useCallback(async () => {
    isPausedRef.current = false;
    setIsPaused(false);

    startVoiceDetection();
  }, [startVoiceDetection]);

  const endAudio = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const encoder = new TextEncoder();
      const endBytes = encoder.encode('END_OF_AUDIO');
      wsRef.current.send(endBytes);
    }
  }, []);

  useEffect(() => {
    return () => {
      disconnect();

      stopVoiceDetection();

      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }

      if (processorRef.current) {
        processorRef.current.disconnect();
      }

      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      if (throttledSetTriggerRef.current) {
        throttledSetTriggerRef.current.cancel();
      }
    };
  }, [disconnect, stopVoiceDetection]);

  return {
    isSpeaking,
    triggerDetected,
    setTriggerDetected,
    isRecording,
    isPaused,
    startRecord,
    stopRecord,
    pauseRecord,
    resumeRecord,
    connect,
    disconnect,
    endAudio,
  };
};
