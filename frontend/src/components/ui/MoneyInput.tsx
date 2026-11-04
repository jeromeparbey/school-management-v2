// frontend2/src/components/ui/MoneyInput.tsx

import React, { useState, useEffect, forwardRef } from 'react';

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

export interface MoneyInputProps {
  /** Valeur numérique (0 = champ vide, affiche le placeholder) */
  value: number;
  /** Callback appelé avec la valeur numérique (0 si vide) */
  onChange: (value: number) => void;
  /** Placeholder affiché quand la valeur est 0 (défaut : "0") */
  placeholder?: string;
  /** Classes CSS Tailwind */
  className?: string;
  /** Valeur minimale (défaut : 0) */
  min?: number;
  /** Valeur maximale (optionnelle) */
  max?: number;
  /** Pas d'incrémentation (défaut : 1) */
  step?: number;
  /** Désactiver le champ */
  disabled?: boolean;
  /** ID HTML */
  id?: string;
  /** Nom HTML */
  name?: string;
  /** Focus automatique */
  autoFocus?: boolean;
  /** Callback sur blur */
  onBlur?: () => void;
  /** Callback sur focus */
  onFocus?: () => void;
  /** Accessibilité : aria-label */
  'aria-label'?: string;
  /** Accessibilité : aria-describedby */
  'aria-describedby'?: string;
  /** Classe pour le conteneur (optionnel) */
  containerClassName?: string;
  /** Afficher le séparateur de milliers (défaut : false) */
  withThousandsSeparator?: boolean;
}

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

/** Formate un nombre avec séparateurs de milliers (fr-FR) */
const formatWithSeparator = (value: number): string => {
  return new Intl.NumberFormat('fr-FR').format(value);
};

/** Parse une chaîne en nombre (ignore les séparateurs de milliers) */
const parseNumber = (raw: string): number | null => {
  const cleaned = raw.replace(/\s/g, '').replace(/,/g, '');
  if (cleaned === '') return null;
  const num = Number(cleaned);
  return Number.isNaN(num) ? null : num;
};

// ═══════════════════════════════════════════════════════════
// COMPOSANT
// ═══════════════════════════════════════════════════════════

export const MoneyInput = forwardRef<HTMLInputElement, MoneyInputProps>(
  (
    {
      value,
      onChange,
      placeholder = '0',
      className = '',
      min = 0,
      max,
      step,
      disabled = false,
      id,
      name,
      autoFocus = false,
      onBlur,
      onFocus,
      'aria-label': ariaLabel,
      'aria-describedby': ariaDescribedBy,
      containerClassName = '',
      withThousandsSeparator = false,
    },
    ref
  ) => {
    // ══════════════════════════════════════════
    // État local : string pour permettre saisie fluide
    // ══════════════════════════════════════════
    const [internalValue, setInternalValue] = useState<string>(() => {
      if (value === 0 || value == null) return '';
      return withThousandsSeparator
        ? formatWithSeparator(value)
        : String(value);
    });

    const [isFocused, setIsFocused] = useState(false);

    // ══════════════════════════════════════════
    // Synchronisation avec valeur externe
    // ══════════════════════════════════════════
    useEffect(() => {
      // Ne pas écraser pendant la saisie
      if (isFocused) return;

      const nextStr =
        value === 0 || value == null
          ? ''
          : withThousandsSeparator
          ? formatWithSeparator(value)
          : String(value);

      setInternalValue(nextStr);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, withThousandsSeparator, isFocused]);

    // ══════════════════════════════════════════
    // Handler changement
    // ══════════════════════════════════════════
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;

      // Cas 1 : champ vidé → on émet 0
      if (raw === '') {
        setInternalValue('');
        onChange(0);
        return;
      }

      // Cas 2 : parsing
      const num = parseNumber(raw);

      // Cas 3 : caractères non numériques → on ignore
      if (num === null) {
        return;
      }

      // Cas 4 : inférieur au min → on ignore (sauf si min=0 et num=0 accepté)
      if (num < min) {
        return;
      }

      // Cas 5 : supérieur au max → on ignore
      if (max !== undefined && num > max) {
        return;
      }

      // ✅ Valeur valide
      setInternalValue(
        withThousandsSeparator ? formatWithSeparator(num) : String(num)
      );
      onChange(num);
    };

    // ══════════════════════════════════════════
    // Handler focus
    // ══════════════════════════════════════════
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      // Sélectionner tout le contenu pour faciliter la saisie
      e.target.select();
      onFocus?.();
    };

    // ══════════════════════════════════════════
    // Handler blur
    // ══════════════════════════════════════════
    const handleBlur = () => {
      setIsFocused(false);

      // Si vide au blur → on remet 0 proprement
      if (internalValue === '') {
        onChange(0);
      }

      onBlur?.();
    };

    // ══════════════════════════════════════════
    // Rendu
    // ══════════════════════════════════════════
    return (
      <div className={containerClassName}>
        <input
          ref={ref}
          id={id}
          name={name}
          type="text"
          inputMode="numeric"
          pattern="[0-9\s,]*"
          value={internalValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedBy}
          className={className}
        />
        {/* step et max sont gérés côté logique, pas via HTML pour éviter les flèches */}
        {(step !== undefined || max !== undefined) && null}
      </div>
    );
  }
);

MoneyInput.displayName = 'MoneyInput';

export default MoneyInput;