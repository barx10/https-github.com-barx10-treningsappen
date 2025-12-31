import React, { useState, useEffect } from 'react';
import { Lock, Check } from 'lucide-react';

interface PinGateProps {
  children: React.ReactNode;
}

// PIN-kode settes via environment variable VITE_APP_PIN
// Hvis ikke satt, er PIN-gate deaktivert
const APP_PIN = import.meta.env.VITE_APP_PIN;
const STORAGE_KEY = 'app_pin_verified';

export default function PinGate({ children }: PinGateProps) {
  const [pin, setPin] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  useEffect(() => {
    // Hvis ingen PIN er konfigurert, hopp over gate
    if (!APP_PIN) {
      setIsVerified(true);
      return;
    }
    // Sjekk om bruker allerede har verifisert
    const verified = sessionStorage.getItem(STORAGE_KEY);
    if (verified === 'true') {
      setIsVerified(true);
    }
  }, []);

  const handlePinChange = (value: string) => {
    // Kun tillat tall
    const numericValue = value.replace(/\D/g, '');
    if (numericValue.length <= 6) {
      setPin(numericValue);
      setError(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === APP_PIN) {
      sessionStorage.setItem(STORAGE_KEY, 'true');
      setIsVerified(true);
    } else {
      setError(true);
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      setPin('');
    }
  };

  if (isVerified) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div
        className={`bg-gray-800 rounded-2xl p-8 w-full max-w-sm shadow-2xl ${isShaking ? 'animate-shake' : ''}`}
      >
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-500/20 p-4 rounded-full mb-4">
            <Lock className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-xl font-bold text-white">Treningsappen</h1>
          <p className="text-gray-400 text-sm mt-2">Skriv inn PIN-kode</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              value={pin}
              onChange={(e) => handlePinChange(e.target.value)}
              placeholder="••••"
              className={`w-full text-center text-2xl tracking-widest py-4 px-4 bg-gray-700 border-2 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                error ? 'border-red-500' : 'border-gray-600'
              }`}
              autoFocus
              autoComplete="off"
            />
            {error && (
              <p className="text-red-400 text-sm text-center mt-2">
                Feil PIN-kode. Prøv igjen.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={pin.length < 4}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-4 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            Bekreft
          </button>
        </form>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
    </div>
  );
}
