// frontend2/src/components/ui/Toast.tsx

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

// ============================================
// TYPES
// ============================================
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number; // ms (0 = persistant)
  action?: {
    label: string;
    onClick: () => void;
  };
}

// ============================================
// STYLES PAR TYPE
// ============================================
const TOAST_STYLES: Record<
  ToastType,
  {
    bg: string;
    border: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    iconColor: string;
    titleColor: string;
    messageColor: string;
    progressColor: string;
  }
> = {
  success: {
    bg: 'bg-white',
    border: 'border-emerald-200',
    icon: CheckCircleIcon,
    iconColor: 'text-emerald-500',
    titleColor: 'text-emerald-900',
    messageColor: 'text-emerald-700',
    progressColor: 'bg-emerald-500',
  },
  error: {
    bg: 'bg-white',
    border: 'border-red-200',
    icon: XCircleIcon,
    iconColor: 'text-red-500',
    titleColor: 'text-red-900',
    messageColor: 'text-red-700',
    progressColor: 'bg-red-500',
  },
  warning: {
    bg: 'bg-white',
    border: 'border-amber-200',
    icon: ExclamationTriangleIcon,
    iconColor: 'text-amber-500',
    titleColor: 'text-amber-900',
    messageColor: 'text-amber-700',
    progressColor: 'bg-amber-500',
  },
  info: {
    bg: 'bg-white',
    border: 'border-blue-200',
    icon: InformationCircleIcon,
    iconColor: 'text-blue-500',
    titleColor: 'text-blue-900',
    messageColor: 'text-blue-700',
    progressColor: 'bg-blue-500',
  },
};

// ============================================
// COMPOSANT : Toast Item
// ============================================
interface ToastItemProps {
  toast: Toast;
  onClose: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onClose }) => {
  const styles = TOAST_STYLES[toast.type];
  const Icon = styles.icon;
  const duration = toast.duration ?? 5000;

  // Auto-close après duration (si duration > 0)
  React.useEffect(() => {
    if (duration <= 0) return;
    const timer = setTimeout(() => onClose(toast.id), duration);
    return () => clearTimeout(timer);
  }, [toast.id, duration, onClose]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`relative w-full sm:w-96 ${styles.bg} border ${styles.border} rounded-xl shadow-lg shadow-gray-900/5 overflow-hidden pointer-events-auto`}
    >
      <div className="flex items-start gap-3 p-4">
        {/* Icône */}
        <div className="flex-shrink-0 mt-0.5">
          <Icon className={`w-5 h-5 ${styles.iconColor}`} />
        </div>

        {/* Contenu */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold ${styles.titleColor}`}>
            {toast.title}
          </p>
          {toast.message && (
            <p
              className={`text-sm mt-1 ${styles.messageColor} whitespace-pre-line`}
            >
              {toast.message}
            </p>
          )}

          {/* Action optionnelle */}
          {toast.action && (
            <button
              onClick={() => {
                toast.action!.onClick();
                onClose(toast.id);
              }}
              className={`mt-2 text-xs font-semibold ${styles.iconColor} hover:underline`}
            >
              {toast.action.label} →
            </button>
          )}
        </div>

        {/* Bouton fermer */}
        <button
          onClick={() => onClose(toast.id)}
          className="flex-shrink-0 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Fermer"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Barre de progression */}
      {duration > 0 && (
        <motion.div
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: duration / 1000, ease: 'linear' }}
          className={`h-1 ${styles.progressColor}`}
        />
      )}
    </motion.div>
  );
};

// ============================================
// COMPOSANT : Container de Toasts
// ============================================
interface ToastContainerProps {
  toasts: Toast[];
  onClose: (id: string) => void;
  position?: 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center';
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onClose,
  position = 'top-right',
}) => {
  const positionClasses: Record<string, string> = {
    'top-right': 'top-4 right-4 items-end',
    'top-center': 'top-4 left-1/2 -translate-x-1/2 items-center',
    'bottom-right': 'bottom-4 right-4 items-end',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2 items-center',
  };

  return (
    <div
      className={`fixed z-[9999] flex flex-col gap-3 pointer-events-none ${positionClasses[position]}`}
      style={{ maxWidth: 'calc(100vw - 2rem)' }}
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={onClose} />
        ))}
      </AnimatePresence>
    </div>
  );
};