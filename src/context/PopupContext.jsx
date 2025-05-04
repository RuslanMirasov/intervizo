'use client';

import { createContext, useState, useEffect } from 'react';
import { bodyLock, bodyUnlock } from '../lib/popup';

const PopupContext = createContext(null);

export const PopupProvider = ({ children }) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [params, setParams] = useState({});

  useEffect(() => {
    if (!isPopupOpen || params.locked) return;

    const handleKeyDown = e => {
      if (e.key === 'Escape') {
        closePopup();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isPopupOpen, params.locked]);

  const openPopup = newParams => {
    bodyLock();
    setParams({ ...newParams });
    setIsPopupOpen(true);
    requestAnimationFrame(() => {
      setIsVisible(true);
    });
  };

  const refreshPopup = newParams => {
    setIsVisible(false);
    setTimeout(() => {
      setParams({ ...newParams });
    }, 350);
    setTimeout(() => {
      setIsVisible(true);
    }, 400);
  };

  const closePopup = () => {
    setIsVisible(false);
    setTimeout(() => {
      setIsPopupOpen(false);
      setParams({});
      bodyUnlock();
    }, 400);
  };

  return (
    <PopupContext.Provider value={{ isPopupOpen, isVisible, params, openPopup, closePopup, refreshPopup }}>
      {children}
    </PopupContext.Provider>
  );
};

export default PopupContext;
