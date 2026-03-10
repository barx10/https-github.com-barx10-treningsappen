import React, { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { X, Mail, Loader2, CheckCircle } from 'lucide-react';

interface AuthModalProps {
    onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSend = async (e: React.FormEvent) => {
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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
            <div className="bg-surface border border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
                <div className="flex justify-between items-center mb-5">
                    <h2 className="text-lg font-bold text-white">Logg inn / Registrer deg</h2>
                    <button onClick={onClose} className="text-muted hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {sent ? (
                    <div className="text-center py-4 space-y-3">
                        <CheckCircle size={40} className="text-emerald-400 mx-auto" />
                        <p className="text-white font-medium">Sjekk e-posten din!</p>
                        <p className="text-muted text-sm">
                            Vi har sendt en innloggingslenke til <span className="text-white">{email}</span>.
                            Klikk på lenken for å logge inn og aktivere sky-syncing.
                        </p>
                        <button
                            onClick={onClose}
                            className="mt-3 w-full py-2 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors"
                        >
                            OK
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSend} className="space-y-4">
                        <p className="text-muted text-sm">
                            Logg inn med e-post for å aktivere automatisk sky-backup av treningsdataene dine.
                            Ingen passord — vi sender en magisk lenke.
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
                            {loading ? 'Sender…' : 'Send innloggingslenke'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default AuthModal;
