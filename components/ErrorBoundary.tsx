import React from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Tar imot feil som ellers ville revet ned hele React-treet.
 *
 * Uten denne endte enhver uventet feil – en skjerm som ikke lot seg laste, et
 * ødelagt tall i en graf – med blank skjerm som bare ble borte hvis du drepte
 * appen og åpnet den på nytt. Nå får du i det minste en knapp å trykke på, og
 * en beskjed om at det som er logget ligger trygt.
 */
export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Uventet feil i appen', error, info.componentStack);
  }

  private handleReload = () => {
    window.location.reload();
  };

  /**
   * Siste utvei når det er mellomlageret som er ødelagt: kast cachede filer og
   * service workeren, og hent alt på nytt. Økter, øvelser og profil ligger i
   * localStorage og røres ikke.
   */
  private handleResetCaches = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(registration => registration.unregister()));
      }
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(key => caches.delete(key)));
      }
    } catch (error) {
      console.error('Klarte ikke å tømme mellomlageret', error);
    } finally {
      window.location.reload();
    }
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-surface border border-slate-700 rounded-2xl p-6 space-y-5">
          <div className="flex flex-col items-center text-center">
            <div className="bg-red-500/15 p-4 rounded-full mb-4">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="text-xl font-bold text-white">Noe gikk galt</h1>
            <p className="text-muted text-sm mt-2">
              Appen klarte ikke å tegne opp skjermen. Øktene dine ligger trygt lagret på telefonen.
            </p>
          </div>

          <button
            onClick={this.handleReload}
            className="w-full bg-primary hover:bg-blue-600 text-white font-semibold py-3.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Last inn på nytt
          </button>

          <div>
            <button
              onClick={this.handleResetCaches}
              className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Tøm mellomlager og last inn
            </button>
            <p className="text-[11px] text-slate-500 text-center mt-2">
              Henter appfilene på nytt. Økter, øvelser og profil beholdes.
            </p>
          </div>

          <details className="text-xs text-slate-500">
            <summary className="cursor-pointer hover:text-slate-300">Teknisk detalj</summary>
            <pre className="mt-2 p-3 bg-background rounded-lg overflow-x-auto whitespace-pre-wrap break-words text-[10px] leading-relaxed">
              {error.message || String(error)}
            </pre>
          </details>
        </div>
      </div>
    );
  }
}
