'use client';

import { usePopup } from '@/hooks/usePopup';
import {
  AddSectionPopup,
  ErrorPopup,
  LoadingPopup,
  MessagePopup,
  ProgressPopup,
  ConfirmPopup,
  DeleteInterviewPopup,
  UpdateInterviewPopup,
} from '@/components';
import css from './Popup.module.scss';

const Popup = () => {
  const { isPopupOpen, isVisible, params, closePopup } = usePopup();

  if (!isPopupOpen || !params) return null;

  const { type, locked } = params;
  const PopupClasses = `${css.Popup} ${type ? css[`popup--${type}`] : ''}${isVisible ? ' ' + css.Visible : ''}`.trim();

  return (
    <div className={`${css.Backdrop} ${isVisible ? css.Visible : ''}`} onClick={!locked ? closePopup : undefined}>
      <div className={PopupClasses} onClick={e => e.stopPropagation()}>
        {type === 'confirm' && <ConfirmPopup params={params} />}
        {type === 'message' && <MessagePopup params={params} />}
        {type === 'loading' && <LoadingPopup params={params} />}
        {type === 'error' && <ErrorPopup params={params} />}
        {type === 'save-interview' && <ProgressPopup params={params} />}
        {type === 'update-interview' && <UpdateInterviewPopup params={params} />}
        {type === 'delete-interview' && <DeleteInterviewPopup params={params} />}
        {type === 'add-section-popup' && <AddSectionPopup params={params} />}
      </div>
    </div>
  );
};

export default Popup;
