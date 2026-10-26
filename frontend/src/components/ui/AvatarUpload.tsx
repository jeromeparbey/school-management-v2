// frontend2/src/components/ui/AvatarUpload.tsx

import React, { useRef, useState } from 'react';
import {
  CameraIcon,
  UserCircleIcon,
  XMarkIcon,
  ArrowUpTrayIcon,
} from '@heroicons/react/24/outline';

interface AvatarUploadProps {
  /** URL actuelle de la photo */
  currentUrl?: string | null;
  /** Initiales de fallback */
  initials?: string;
  /** Callback quand un fichier est sélectionné */
  onFileSelected: (file: File) => void;
  /** Callback quand on supprime la photo */
  onRemove?: () => void;
  /** Taille max en MB (défaut 5) */
  maxSizeMB?: number;
  /** Désactivé */
  disabled?: boolean;
  /** Upload en cours */
  isUploading?: boolean;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentUrl,
  initials = '?',
  onFileSelected,
  onRemove,
  maxSizeMB = 5,
  disabled = false,
  isUploading = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleClick = () => {
    if (disabled || isUploading) return;
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Format accepté : JPG, PNG, WEBP, GIF');
      return;
    }

    // Validation taille
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`Taille max : ${maxSizeMB} MB`);
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);

    // Callback
    onFileSelected(file);

    // Reset input pour permettre re-sélection du même fichier
    e.target.value = '';
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
    onRemove?.();
  };

  const displayUrl = previewUrl ?? currentUrl;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative group">
        {/* Avatar */}
        <div
          onClick={handleClick}
          className={`w-32 h-32 rounded-2xl overflow-hidden border-4 border-white shadow-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center ${
            disabled || isUploading
              ? 'cursor-not-allowed opacity-70'
              : 'cursor-pointer hover:opacity-90'
          } transition-opacity`}
        >
          {displayUrl ? (
            <img
              src={displayUrl}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-white font-bold text-3xl">{initials}</span>
          )}
        </div>

        {/* Overlay caméra au hover */}
        {!disabled && (
          <div
            onClick={handleClick}
            className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
          >
            {isUploading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
            ) : (
              <CameraIcon className="w-8 h-8 text-white" />
            )}
          </div>
        )}

        {/* Bouton supprimer (visible si photo) */}
        {displayUrl && !disabled && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleRemove();
            }}
            className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600 transition-colors"
            title="Supprimer la photo"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        )}

        {/* Badge "en ligne" / upload */}
        {isUploading && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-blue-600 text-white text-[10px] font-semibold rounded-full">
            Envoi…
          </div>
        )}
      </div>

      {/* Input file caché */}
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(',')}
        onChange={handleChange}
        disabled={disabled || isUploading}
        className="hidden"
      />

      {/* Bouton upload */}
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || isUploading}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
      >
        {isUploading ? (
          <>
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600" />
            Envoi…
          </>
        ) : (
          <>
            <ArrowUpTrayIcon className="w-3.5 h-3.5" />
            Changer la photo
          </>
        )}
      </button>

      {/* Message d'erreur */}
      {error && (
        <p className="text-xs text-red-600 font-medium text-center">{error}</p>
      )}

      <p className="text-[10px] text-gray-500 text-center">
        JPG, PNG, WEBP, GIF · Max {maxSizeMB} MB
      </p>
    </div>
  );
};