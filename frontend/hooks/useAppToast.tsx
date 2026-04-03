'use client';

import { toast as sonnerToast } from 'sonner';
import { useTranslations } from 'next-intl';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning' | 'default';

interface ToastOptions {
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  cancel?: {
    label: string;
    onClick: () => void;
  };
}

export function useAppToast() {
  const t = useTranslations('Common');

  const toast = (messageKey: string, options?: ToastOptions & { variant?: ToastVariant }) => {
    const { variant = 'default', description, duration, action, cancel } = options || {};
    
    let translatedMessage = messageKey;
    try {
      translatedMessage = t(messageKey);
    } catch (e) {
      // If key not found, use it as raw message
    }

    let translatedDescription = description;
    if (description) {
      try {
        translatedDescription = t(description);
      } catch (e) {
        // use raw
      }
    }
    
    const sonnerOptions = {
      description: translatedDescription,
      duration: duration || 5000,
      action: action ? {
        label: t(action.label),
        onClick: action.onClick
      } : undefined,
      cancel: cancel ? {
        label: t(cancel.label),
        onClick: cancel.onClick
      } : undefined,
    };

    switch (variant) {
      case 'success':
        return sonnerToast.success(translatedMessage, sonnerOptions);
      case 'error':
        return sonnerToast.error(translatedMessage, sonnerOptions);
      case 'warning':
        return sonnerToast.warning(translatedMessage, sonnerOptions);
      case 'info':
        return sonnerToast.info(translatedMessage, sonnerOptions);
      default:
        return sonnerToast(translatedMessage, sonnerOptions);
    }
  };

  return {
    toast,
    success: (key: string, options?: ToastOptions) => toast(key, { ...options, variant: 'success' }),
    error: (key: string, options?: ToastOptions) => toast(key, { ...options, variant: 'error' }),
    warning: (key: string, options?: ToastOptions) => toast(key, { ...options, variant: 'warning' }),
    info: (key: string, options?: ToastOptions) => toast(key, { ...options, variant: 'info' }),
    dismiss: (id?: string | number) => sonnerToast.dismiss(id),
  };
}
