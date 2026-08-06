import React, { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';

/** Etter så lang tid slutter vi å late som om det går bra. */
const SLOW_AFTER_MS = 8000;

interface LoadingFallbackProps {
  /** `screen` fyller hele visningen, `block` holder plassen til en graf. */
  variant?: 'screen' | 'block';
  /** Høyde og lignende for `block`-varianten. */
  className?: string;
}

/**
 * Ventevisning for skjermer og grafer som lastes ved behov.
 *
 * En spinner uten slutt er ikke til hjelp: henger nedlastingen – dårlig nett på
 * senteret, eller en fil som ikke finnes lenger – ser appen frossen ut. Etter
 * noen sekunder sier vi ifra og gir en vei videre.
 */
export default function LoadingFallback({ variant = 'screen', className = '' }: LoadingFallbackProps) {
  const [isSlow, setIsSlow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsSlow(true), SLOW_AFTER_MS);
    return () => clearTimeout(timer);
  }, []);

  if (!isSlow) {
    if (variant === 'block') {
      return <div className={`bg-surface rounded-xl animate-pulse ${className}`} />;
    }
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const message = (
    <div className="text-center px-4">
      <p className="text-sm text-slate-300 font-medium">Dette tar lengre tid enn vanlig</p>
      <p className="text-xs text-muted mt-1">Sjekk nettforbindelsen, eller last inn appen på nytt.</p>
      <button
        onClick={() => window.location.reload()}
        className="mt-3 inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium py-2 px-4 rounded-lg transition-colors"
      >
        <RefreshCw size={14} />
        Last inn på nytt
      </button>
    </div>
  );

  if (variant === 'block') {
    return (
      <div className={`bg-surface border border-slate-700 rounded-xl flex items-center justify-center py-6 ${className}`}>
        {message}
      </div>
    );
  }

  return <div className="h-full flex items-center justify-center">{message}</div>;
}
