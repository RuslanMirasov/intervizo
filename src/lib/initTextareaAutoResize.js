export function initTextareaAutoResize() {
  const resizeTextarea = el => {
    if (!el || el.nodeName !== 'TEXTAREA') return;
    el.style.height = '0px';
    el.style.height = `${el.scrollHeight}px`;
  };

  const handleInput = e => {
    if (e.target.nodeName === 'TEXTAREA') {
      resizeTextarea(e.target);
    }
  };

  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeName === 'TEXTAREA') {
          resizeTextarea(node);
          node.addEventListener('input', handleInput);
        } else if (node.querySelectorAll) {
          node.querySelectorAll('textarea').forEach(ta => {
            resizeTextarea(ta);
            ta.addEventListener('input', handleInput);
          });
        }
      });
    });
  });

  document.addEventListener('input', handleInput);
  observer.observe(document.body, { childList: true, subtree: true });

  return () => {
    document.removeEventListener('input', handleInput);
    observer.disconnect();
  };
}
