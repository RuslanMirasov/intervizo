const modifyFixedElements = false;

const setPaddingsToFixedElements = scrollbar => {
  document.body.style.paddingRight = `${scrollbar}px`;

  if (!modifyFixedElements) return;

  const fixedElements = Array.from(document.all).filter(e => getComputedStyle(e).position === 'fixed');

  fixedElements.forEach(fix => {
    if (!fix.classList.contains('popup')) {
      fix.style.paddingRight = `${scrollbar}px`;
    }
  });
};

export const bodyLock = () => {
  const scrollbarWidth = window.innerWidth - document.body.offsetWidth;
  if (!document.body.classList.contains('locked')) {
    document.body.classList.add('locked');
    setPaddingsToFixedElements(scrollbarWidth);
  }
};

export const bodyUnlock = () => {
  if (document.body.classList.contains('locked')) {
    document.body.classList.remove('locked');
    setPaddingsToFixedElements(0);
  }
};

export const showPopup = () => {
  const popupEl = document.querySelector('.popup');
  if (popupEl) {
    popupEl.classList.add('is-open');
  }
};

export const hidePopup = () => {
  const popupEl = document.querySelector('.popup');
  if (popupEl && popupEl.classList.contains('is-open')) {
    popupEl.classList.remove('is-open');
  }
};
