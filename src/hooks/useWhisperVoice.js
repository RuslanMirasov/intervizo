'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

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
  'repeat the question',
  'can you repeat the question',
  'say the question again',
  'could you repeat the question please',
  'i didn’t hear the question',
  'i didn’t get the question',
  'wiederholen sie die frage',
  'wiederhole die frage',
  'nochmal die frage',
  'frage wiederholen',
  'können sie die frage wiederholen',
  'ich habe die frage nicht verstanden',
  'ich habe die frage nicht gehört',
];

const DEFAULT_NEXT_TRIGGERS = [
  'следующий вопрос',
  'к следующему вопросу',
  'пропустить вопрос',
  'вопрос пропустить',
  'next question',
  'go to the next question',
  'skip the question',
  'skip this question',
  'nächste frage',
  'zur nächsten frage',
  'frage überspringen',
  'diese frage überspringen',
];

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

  const detectTrigger = useCallback(text => {
    const lowerText = text.toLowerCase();

    for (const trigger of DEFAULT_REPEAT_TRIGGERS) {
      if (lowerText.includes(trigger.toLowerCase())) {
        return 'repeat';
      }
    }

    for (const trigger of DEFAULT_NEXT_TRIGGERS) {
      if (lowerText.includes(trigger.toLowerCase())) {
        return 'next';
      }
    }

    return null;
  }, []);

  const connect = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      const ws = new WebSocket('wss://asr.motrig.ru:9090/');
      wsRef.current = ws;

      ws.onopen = () => {
        const config = {
          uid: `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
        ws.send(JSON.stringify(config));
      };

      ws.onmessage = event => {
        try {
          const data = JSON.parse(event.data);

          if (data.status === 'SERVER_READY') {
            keepAliveIntervalRef.current = setInterval(() => {
              if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ ping: true }));
              }
            }, 10000);
            resolve();
            return;
          }

          if (data.segments) {
            data.segments.forEach(seg => {
              if (seg.completed) {
                segmentsRef.current.push(seg.text);
              }
            });
          }

          if (data.text && !data.completed) {
            currentSegmentRef.current = data.text;

            const trigger = detectTrigger(data.text);
            if (trigger) {
              setTriggerDetected(trigger);
              setTimeout(() => setTriggerDetected(null), 3000);
            }

            setIsSpeaking(data.text.trim().length > 0);
          }
        } catch (error) {
          console.error(' WebSocket message error:', error);
        }
      };

      ws.onerror = error => {
        console.error(' WebSocket error:', error);
        reject(error);
      };

      ws.onclose = () => {
        if (keepAliveIntervalRef.current) {
          clearInterval(keepAliveIntervalRef.current);
          keepAliveIntervalRef.current = null;
        }
      };
    });
  }, [detectTrigger]);

  const disconnect = useCallback(() => {
    if (keepAliveIntervalRef.current) {
      clearInterval(keepAliveIntervalRef.current);
      keepAliveIntervalRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const startRecord = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 16000,
      });
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = e => {
        if (isPausedRef.current) return;

        const inputData = e.inputBuffer.getChannelData(0);
        const audioData = new Float32Array(inputData);

        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(audioData.buffer);
        }
      };

      source.connect(processor);
      processor.connect(audioContext.destination);

      segmentsRef.current = [];
      currentSegmentRef.current = '';
      setIsRecording(true);
      setIsPaused(false);
      isPausedRef.current = false;
    } catch (error) {
      console.error(' Start record error:', error);
      throw error;
    }
  }, []);

  const stopRecord = useCallback(() => {
    return new Promise(resolve => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ END_OF_AUDIO: true }));
      }

      setTimeout(() => {
        if (processorRef.current) {
          processorRef.current.disconnect();
          processorRef.current = null;
        }

        if (audioContextRef.current) {
          audioContextRef.current.close();
          audioContextRef.current = null;
        }

        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }

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
  }, []);

  const pauseRecord = useCallback(async () => {
    isPausedRef.current = true;
    setIsPaused(true);
    setIsSpeaking(false);
  }, []);

  const resumeRecord = useCallback(async () => {
    isPausedRef.current = false;
    setIsPaused(false);
  }, []);

  useEffect(() => {
    return () => {
      disconnect();

      if (processorRef.current) {
        processorRef.current.disconnect();
      }

      if (audioContextRef.current) {
        audioContextRef.current.close();
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [disconnect]);

  return {
    isSpeaking,
    triggerDetected,
    isRecording,
    isPaused,
    startRecord,
    stopRecord,
    pauseRecord,
    resumeRecord,
    connect,
    disconnect,
  };
};
