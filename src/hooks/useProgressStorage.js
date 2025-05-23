import { useRef } from 'react';

const KEY = 'progress';

export const useProgressStorage = () => {
  const isInitialized = useRef(false);

  const getProgress = () => {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const setProgress = data => {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch {}
  };

  const addQuestion = ({ id, question }) => {
    const current = getProgress();
    const index = current.findIndex(item => item.id === id);

    const newEntry = { id, question, answer: null, feedback: null, score: 0 };

    if (index !== -1 && current[index].question === question) return;

    if (index !== -1) {
      current[index] = newEntry;
    } else {
      current.push(newEntry);
    }

    setProgress(current);
  };

  const updateAnswer = (id, answer) => {
    const current = getProgress();
    const updated = current.map(item => (item.id === id ? { ...item, answer } : item));
    setProgress(updated);
  };

  const updateFeedback = (id, feedback, score) => {
    const current = getProgress();
    const updated = current.map(item => (item.id === id ? { ...item, feedback, score } : item));
    setProgress(updated);
  };

  const clearProgress = () => {
    localStorage.removeItem(KEY);
  };

  return {
    addQuestion,
    updateAnswer,
    updateFeedback,
    clearProgress,
    getProgress,
  };
};
