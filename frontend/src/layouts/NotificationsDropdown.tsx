// frontend2/src/components/layout/NotificationsDropdown.tsx
import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

interface Notif {
  id: number;
  type: 'payment' | 'absence' | 'bulletin' | 'heure-supp';
  title: string;
  desc: string;
  time: string;
  unread: boolean;
}

const MOCK: Notif[] = [
  { id: 1, type: 'payment', title: 'Paiement reçu', desc: 'Famille Martin - 250 000 FCFA', time: 'Il y a 5 min', unread: true },
  { id: 2, type: 'absence', title: 'Demande d\'absence', desc: 'M. Diallo - 2 jours', time: 'Il y a 1h', unread: true },
  { id: 3, type: 'bulletin', title: 'Bulletins disponibles', desc: 'Trimestre 1 - 6ème A', time: 'Il y a 3h', unread: true },
  { id: 4, type: 'heure-supp', title: 'Heures supp. approuvées', desc: '4h - M. Traoré', time: 'Hier', unread: false },
];

const iconMap = {
  payment: { icon: CurrencyDollarIcon, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  absence: { icon: ExclamationTriangleIcon, color: 'text-red-600', bg: 'bg-red-50' },
  bulletin: { icon: DocumentTextIcon, color: 'text-purple-600', bg: 'bg-purple-50' },
  'heure-supp': { icon: ClockIcon, color: 'text-orange-600', bg: 'bg-orange-50' },
};

const NotificationsDropdown: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: -8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.96 }}
      transition={{ duration: 0.15 }}
      className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
        <button className="text-xs text-blue-600 hover:underline">Tout marquer comme lu</button>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {MOCK.map((n) => {
          const { icon: Icon, color, bg } = iconMap[n.type];
          return (
            <Link
              key={n.id}
              to={`/dashboard/notifications/${n.id}`}
              onClick={onClose}
              className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                n.unread ? 'bg-blue-50/30' : ''
              }`}
            >
              <div className={`p-2 rounded-lg ${bg} flex-shrink-0`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{n.title}</p>
                <p className="text-xs text-gray-600 truncate">{n.desc}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{n.time}</p>
              </div>
              {n.unread && <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />}
            </Link>
          );
        })}
      </div>

      <div className="border-t border-gray-100 p-2">
        <Link
          to="/dashboard/notifications"
          onClick={onClose}
          className="block text-center text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg py-2"
        >
          Voir toutes les notifications
        </Link>
      </div>
    </motion.div>
  );
};

export default NotificationsDropdown;