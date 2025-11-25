import React from 'react';
import { Info, Mail, Github, Heart, Code, Sparkles } from 'lucide-react';

const InfoView: React.FC = () => {
    return (
        <div className="p-4 pb-24 space-y-6">
            <header className="flex items-center space-x-3 mb-6 mt-2">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <Info size={24} className="text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">Om Appen</h1>
                    <p className="text-muted text-sm">Versjon 1.0.0</p>
                </div>
            </header>

            {/* App Info Section */}
            <div className="bg-surface rounded-xl border border-slate-700 p-5 space-y-4">
                <h2 className="text-lg font-bold text-white flex items-center">
                    <Sparkles size={18} className="mr-2 text-yellow-400" />
                    Treningsappen
                </h2>
                <p className="text-slate-300 text-sm leading-relaxed">
                    En moderne treningsdagbok bygget for å hjelpe deg med å nå dine treningsmål. 
                    Logg økter, spor fremgang, og få personlige anbefalinger basert på din aktivitet.
                </p>
                <div className="pt-2 space-y-2 text-sm text-slate-400">
                    <div className="flex items-start">
                        <span className="mr-2">✓</span>
                        <span>Personlig treningslogg med automatisk lagring</span>
                    </div>
                    <div className="flex items-start">
                        <span className="mr-2">✓</span>
                        <span>Visuell fremgangsoversikt med grafer</span>
                    </div>
                    <div className="flex items-start">
                        <span className="mr-2">✓</span>
                        <span>Smartе anbefalinger tilpasset ditt mål</span>
                    </div>
                    <div className="flex items-start">
                        <span className="mr-2">✓</span>
                        <span>Ernæringsberegninger og kaloriestimater</span>
                    </div>
                    <div className="flex items-start">
                        <span className="mr-2">✓</span>
                        <span>PWA - installerbar på mobil og PC</span>
                    </div>
                </div>
            </div>

            {/* About Me Section */}
            <div className="bg-surface rounded-xl border border-slate-700 p-5 space-y-4">
                <h2 className="text-lg font-bold text-white flex items-center">
                    <Heart size={18} className="mr-2 text-red-400" />
                    Om Utvikleren
                </h2>
                <p className="text-slate-300 text-sm leading-relaxed">
                    Laget av Kenneth Bareksten – en utvikler med lidenskap for trening og teknologi. 
                    Denne appen er bygget for å kombinere det beste fra begge verdener.
                </p>
                
                <div className="flex flex-col gap-3 pt-2">
                    <a
                        href="mailto:kenneth@bareksten.no"
                        className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-colors"
                    >
                        <Mail size={20} className="text-blue-400" />
                        <div>
                            <div className="text-sm font-medium text-white">E-post</div>
                            <div className="text-xs text-slate-400">kenneth@bareksten.no</div>
                        </div>
                    </a>
                    
                    <a
                        href="https://github.com/barx10"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-colors"
                    >
                        <Github size={20} className="text-slate-300" />
                        <div>
                            <div className="text-sm font-medium text-white">GitHub</div>
                            <div className="text-xs text-slate-400">github.com/barx10</div>
                        </div>
                    </a>
                </div>
            </div>

            {/* Tech Stack Section */}
            <div className="bg-surface rounded-xl border border-slate-700 p-5 space-y-4">
                <h2 className="text-lg font-bold text-white flex items-center">
                    <Code size={18} className="mr-2 text-green-400" />
                    Teknologi
                </h2>
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                        <div className="text-sm font-medium text-white mb-1">React</div>
                        <div className="text-xs text-slate-400">Frontend framework</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                        <div className="text-sm font-medium text-white mb-1">TypeScript</div>
                        <div className="text-xs text-slate-400">Type safety</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                        <div className="text-sm font-medium text-white mb-1">Vite</div>
                        <div className="text-xs text-slate-400">Build tool</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                        <div className="text-sm font-medium text-white mb-1">Tailwind CSS</div>
                        <div className="text-xs text-slate-400">Styling</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                        <div className="text-sm font-medium text-white mb-1">Recharts</div>
                        <div className="text-xs text-slate-400">Grafer</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                        <div className="text-sm font-medium text-white mb-1">PWA</div>
                        <div className="text-xs text-slate-400">Progressive Web App</div>
                    </div>
                </div>
            </div>

            {/* Privacy & Data Section */}
            <div className="bg-surface rounded-xl border border-slate-700 p-5 space-y-4">
                <h2 className="text-lg font-bold text-white">Personvern & Data</h2>
                <div className="text-sm text-slate-300 space-y-3 leading-relaxed">
                    <p>
                        <strong className="text-white">All data lagres lokalt</strong> i nettleserens localStorage. 
                        Ingen informasjon sendes til eksterne servere.
                    </p>
                    <p>
                        Du kan når som helst eksportere eller slette dataene dine fra profilsiden. 
                        Appen krever ingen innlogging eller personlig informasjon utover det du velger å legge inn selv.
                    </p>
                    <p className="text-xs text-slate-500">
                        Merk: Hvis du sletter nettleserdata eller bytter enhet, må du importere en backup 
                        for å gjenopprette treningshistorikken din.
                    </p>
                </div>
            </div>

            {/* Footer */}
            <div className="text-center pt-4 pb-2">
                <p className="text-xs text-slate-500">
                    Laget med <Heart size={12} className="inline text-red-500" fill="currentColor" /> av Kenneth Bareksten
                </p>
                <p className="text-xs text-slate-600 mt-1">© 2025 Treningsappen</p>
            </div>
        </div>
    );
};

export default InfoView;
