// frontend2/src/components/ExportElevesButton.tsx

import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowDownTrayIcon,
  ArrowPathIcon,
  DocumentArrowDownIcon,
  TableCellsIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import {
  useExportElevesXlsx,
  useExportElevesCsv,
} from '../hooks/useExport';
import type { ExportElevesParams } from '../api/export.api';

interface Props {
  params?: ExportElevesParams;
  variant?: 'default' | 'minimal';
}

export const ExportElevesButton: React.FC<Props> = ({
  params,
  variant = 'default',
}) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const exportXlsx = useExportElevesXlsx();
  const exportCsv = useExportElevesCsv();
  const loading = exportXlsx.isPending || exportCsv.isPending;

  // Fermer au clic externe
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = (format: 'xlsx' | 'csv') => {
    if (format === 'xlsx') {
      exportXlsx.mutate(params);
    } else {
      exportCsv.mutate(params);
    }
    setOpen(false);
  };

  if (variant === 'minimal') {
    return (
      <button
        onClick={() => handleExport('xlsx')}
        disabled={loading}
        className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 text-sm font-medium disabled:opacity-60"
        title="Exporter en Excel"
      >
        {loading ? (
          <ArrowPathIcon className="h-4 w-4 animate-spin" />
        ) : (
          <ArrowDownTrayIcon className="h-4 w-4" />
        )}
        <span className="hidden sm:inline">Exporter</span>
      </button>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={loading}
        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 text-sm font-medium shadow-sm disabled:opacity-60"
      >
        {loading ? (
          <ArrowPathIcon className="h-4 w-4 animate-spin" />
        ) : (
          <ArrowDownTrayIcon className="h-4 w-4" />
        )}
        <span className="hidden sm:inline">Exporter</span>
        <ChevronDownIcon className="h-3 w-3" />
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
          <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              Format d'export
            </p>
          </div>

          <button
            onClick={() => handleExport('xlsx')}
            className="w-full text-left px-4 py-3 hover:bg-emerald-50 flex items-start gap-3 border-b border-gray-100 transition-colors"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
              <TableCellsIcon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">
                Excel (.xlsx)
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Recommandé — 3 feuilles, prêt à ré-importer
              </p>
            </div>
          </button>

          <button
            onClick={() => handleExport('csv')}
            className="w-full text-left px-4 py-3 hover:bg-emerald-50 flex items-start gap-3 transition-colors"
          >
            <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 shrink-0">
              <DocumentArrowDownIcon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">
                CSV (.csv)
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Compatible Excel FR — séparateur ;
              </p>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};