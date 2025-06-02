import { useRef } from 'react';

const KEY = 'progress';

const defaultProgress = {
  company: '',
  interviewId: '',
  owners: [],
  totalScore: 0.0,
  name: '',
  email: '',
  video: '',
  data: [],
};

export const useProgressStorage = () => {
  const isInitialized = useRef(false);

  const getProgress = () => {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : { ...defaultProgress };
    } catch {
      return { ...defaultProgress };
    }
  };

  const setProgress = data => {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch {}
  };

  const addQuestion = ({ id, question }) => {
    const current = getProgress();
    const index = current.data.findIndex(item => item.id === id);

    const newEntry = { id, question, answer: null, feedback: null, score: 0 };

    if (index !== -1 && current.data[index].question === question) return;

    if (index !== -1) {
      current.data[index] = newEntry;
    } else {
      current.data.push(newEntry);
    }

    setProgress(current);
  };

  const updateAnswer = (id, answer) => {
    const current = getProgress();
    current.data = current.data.map(item => (item.id === id ? { ...item, answer } : item));
    setProgress(current);
  };

  const updateFeedback = (id, feedback, score) => {
    const current = getProgress();
    current.data = current.data.map(item => (item.id === id ? { ...item, feedback, score } : item));
    setProgress(current);
  };

  const setMeta = (meta = {}) => {
    const current = getProgress();
    const updated = {
      ...current,
      ...meta,
    };
    setProgress(updated);
  };

  const clearProgress = () => {
    localStorage.removeItem(KEY);
  };

  return {
    addQuestion,
    updateAnswer,
    updateFeedback,
    setMeta,
    clearProgress,
    getProgress,
    setProgress,
  };
};
