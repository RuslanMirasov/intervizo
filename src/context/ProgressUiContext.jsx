'use client';

import { createContext, useContext } from 'react';

const ProgressUiContext = createContext({
  countdown: null,
  loading: false,
  stepPhase: 'pause',
});

export const ProgressUiProvider = ({ value, children }) => (
  <ProgressUiContext.Provider value={value}>{children}</ProgressUiContext.Provider>
);

export const useProgressUi = () => useContext(ProgressUiContext);
