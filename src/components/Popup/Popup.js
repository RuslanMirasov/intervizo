'use client';

import { useState } from 'react';
import { usePopup } from '@/hooks/usePopup';
import { AddSectionPopup, Button, Icon } from '@/components';
import css from './Popup.module.scss';

const Popup = () => {
  const { isPopupOpen, isVisible, params, closePopup } = usePopup();

  if (!isPopupOpen || !params) return null;

  const { type, locked } = params;
  const PopupClasses = `${css.Popup} ${type ? css[`popup--${type}`] : ''}${isVisible ? ' ' + css.Visible : ''}`.trim();

  return (
    <div className={`${css.Backdrop} ${isVisible ? css.Visible : ''}`} onClick={!locked ? closePopup : undefined}>
      <div className={PopupClasses} onClick={e => e.stopPropagation()}>
        {type === 'ssssss' && <AddSectionPopup params={params} />}
      </div>
    </div>
  );
};

export default Popup;
