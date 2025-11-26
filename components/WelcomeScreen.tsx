import React from 'react';
import { Play } from 'lucide-react';

interface WelcomeScreenProps {
    onEnter: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onEnter }) => {
    return (
        <div
            className="fixed inset-0 z-[100] bg-slate-900 flex flex-col items-center justify-center cursor-pointer"
            onClick={onEnter}
        >
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src="/cover.png"
                    alt="Fitness App Cover"
                    className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center text-center p-8 animate-in fade-in zoom-in duration-1000">
                <div className="mb-8 p-6 bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-2xl shadow-primary/20 animate-pulse">
                    <img src="/icon.svg" alt="Logo" className="w-20 h-20" />
                </div>

                <h1 className="text-4xl font-black text-white mb-2 tracking-tight drop-shadow-lg">
                    TRENINGS<span className="text-primary">APPEN</span>
                </h1>

                <p className="text-slate-300 text-lg font-medium mb-12 max-w-[200px] leading-relaxed drop-shadow-md">
                    Din personlige vei til en sunnere kropp
                </p>

                <div className="flex items-center space-x-2 text-white/80 text-sm uppercase tracking-widest font-bold animate-bounce">
                    <span>Trykk for å starte</span>
                    <Play size={12} fill="currentColor" />
                </div>
            </div>
        </div>
    );
};

export default WelcomeScreen;
