import { useEffect, useRef } from 'react';

const closers = new Set<() => void>();
let guardActive = false;

const handlePopState = () => {
  if (window.history.state?.memodiaModal) return;
  guardActive = false;
  window.removeEventListener('popstate', handlePopState);
  const pending = Array.from(closers).reverse();
  closers.clear();
  pending.forEach((close) => close());
};

const pushGuard = () => {
  if (guardActive) return;
  guardActive = true;
  window.history.pushState({ ...(window.history.state || {}), memodiaModal: true }, '');
  window.addEventListener('popstate', handlePopState);
};

const removeGuard = () => {
  if (!guardActive) return;
  guardActive = false;
  window.removeEventListener('popstate', handlePopState);
  if (window.history.state?.memodiaModal) {
    window.history.back();
  }
};

export function useBackToClose(isOpen: boolean, onClose: () => void) {
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const cleanupTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (cleanupTimer.current !== null) {
      window.clearTimeout(cleanupTimer.current);
      cleanupTimer.current = null;
    }

    const closer = () => onCloseRef.current();
    closers.add(closer);
    pushGuard();

    return () => {
      cleanupTimer.current = window.setTimeout(() => {
        cleanupTimer.current = null;
        closers.delete(closer);
        if (closers.size === 0) removeGuard();
      }, 0);
    };
  }, [isOpen]);
}
