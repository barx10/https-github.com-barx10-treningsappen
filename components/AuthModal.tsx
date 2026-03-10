import React, { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { X, Mail, Loader2, CheckCircle, KeyRound } from 'lucide-react';

interface AuthModalProps {
    onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;
        setLoading(true);
        setError(null);
        const { error: supaError } = await supabase.auth.signInWithOtp({
            email: email.trim(),
            options: { shouldCreateUser: true },
        });
        setLoading(false);
        if (supaError) {
            setError(supaError.message);
        } else {
            setSent(true);
        }
    };

    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code.trim()) return;
        setLoading(true);
        setError(null);
        const { error: supaError } = await supabase.auth.verifyOtp({
            email: email.trim(),
            token: code.trim(),
            type: 'email',
        });
        setLoading(false);
        if (supaError) {
            setError('Ugyldig kode. Prøv igjen eller send en ny.');
        } else {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
            <div className="bg-surface border border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
                <div className="flex justify-between items-center mb-5">
                    <h2 className="text-lg font-bold text-white">Logg inn / Registrer deg</h2>
                    <button onClick={onClose} className="text-muted hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {!sent ? (
                    <form onSubmit={handleSendCode} className="space-y-4">
                        <p className="text-muted text-sm">
                            Logg inn med e-post for å aktivere automatisk sky-backup. Vi sender en
                            engangskode — ingen passord nødvendig.
                        </p>
                        <div className="relative">
                            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="din@epost.no"
                                required
                                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                            />
                        </div>
                        {error && <p className="text-red-400 text-sm">{error}</p>}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                            {loading ? 'Sender…' : 'Send engangskode'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyCode} className="space-y-4">
                        <div className="text-center pb-2">
                            <CheckCircle size={36} className="text-emerald-400 mx-auto mb-2" />
                            <p className="text-white font-medium">Sjekk e-posten din</p>
                            <p className="text-muted text-sm mt-1">
                                Vi sendte en 8-sifret kode til{' '}
                                <span className="text-white">{email}</span>.
                                Skriv den inn her.
                            </p>
                        </div>
                        <div className="relative">
                            <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                            <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={8}
                                value={code}
                                onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                                placeholder="12345678"
                                required
                                autoFocus
                                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors text-center text-xl tracking-widest"
                            />
                        </div>
                        {error && <p className="text-red-400 text-sm">{error}</p>}
                        <button
                            type="submit"
                            disabled={loading || code.length < 8}
                            className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                            {loading ? 'Verifiserer…' : 'Logg inn'}
                        </button>
                        <button
                            type="button"
                            onClick={() => { setSent(false); setCode(''); setError(null); }}
                            className="w-full py-2 text-sm text-muted hover:text-white transition-colors"
                        >
                            ← Endre e-postadresse
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default AuthModal;
