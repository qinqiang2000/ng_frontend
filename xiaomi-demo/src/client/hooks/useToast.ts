'use client';

import { useState, useCallback } from 'react';
import { ToastProps } from '../components/ui/Toast';

interface Toast extends Omit<ToastProps, 'onClose'> {
  id: string;
}

let toastIdCounter = 0;

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const generateId = useCallback(() => {
    return `toast-${++toastIdCounter}-${Date.now()}`;
  }, []);

  const showToast = useCallback((
    type: Toast['type'],
    title: string,
    message?: string,
    duration?: number
  ) => {
    const id = generateId();
    const toast: Toast = {
      id,
      type,
      title,
      message,
      duration,
    };

    setToasts(prev => [...prev, toast]);
    return id;
  }, [generateId]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const success = useCallback((title: string, message?: string) => {
    return showToast('success', title, message);
  }, [showToast]);

  const error = useCallback((title: string, message?: string, duration?: number) => {
    return showToast('error', title, message, duration);
  }, [showToast]);

  const warning = useCallback((title: string, message?: string) => {
    return showToast('warning', title, message);
  }, [showToast]);

  const info = useCallback((title: string, message?: string) => {
    return showToast('info', title, message);
  }, [showToast]);

  return {
    toasts,
    success,
    error,
    warning,
    info,
    removeToast,
  };
};