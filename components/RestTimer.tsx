import React, { useState, useEffect, useRef } from 'react';
import { Timer, Play, Pause, RotateCcw } from 'lucide-react';

interface RestTimerProps {
    onComplete?: () => void;
}

const RestTimer: React.FC<RestTimerProps> = ({ onComplete }) => {
    const [timeLeft, setTimeLeft] = useState(90); // Default 90 seconds
    const [isRunning, setIsRunning] = useState(false);
    const [initialTime, setInitialTime] = useState(90);
    const [isCompact, setIsCompact] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const startTimeRef = useRef<number | null>(null);
    const remainingRef = useRef<number>(90);
    const hasPlayedBeepsRef = useRef<Set<number>>(new Set());

    // Initialize AudioContext on first user interaction
    const ensureAudioContext = () => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
        }
        return audioContextRef.current;
    };

    const playBeep = (frequency: number = 800, duration: number = 0.1) => {
        try {
            const ctx = ensureAudioContext();
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            oscillator.frequency.value = frequency;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + duration);
        } catch (e) {
            // Ignore audio errors
        }
    };

    const playCompletionSound = () => {
        try {
            const ctx = ensureAudioContext();
            // Play two tones for completion
            [0, 0.15].forEach((delay, i) => {
                const oscillator = ctx.createOscillator();
                const gainNode = ctx.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(ctx.destination);

                oscillator.frequency.value = i === 0 ? 600 : 800;
                oscillator.type = 'sine';

                gainNode.gain.setValueAtTime(0.3, ctx.currentTime + delay);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + 0.2);

                oscillator.start(ctx.currentTime + delay);
                oscillator.stop(ctx.currentTime + delay + 0.2);
            });
        } catch (e) {
            // Ignore audio errors
        }
    };

    useEffect(() => {
        if (isRunning) {
            if (!startTimeRef.current) {
                startTimeRef.current = Date.now();
                remainingRef.current = timeLeft;
            }

            const updateTimer = () => {
                const elapsed = Math.floor((Date.now() - startTimeRef.current!) / 1000);
                const newTimeLeft = Math.max(0, remainingRef.current - elapsed);

                setTimeLeft(newTimeLeft);

                // Play beep sound at 3, 2, 1 seconds
                if (newTimeLeft > 0 && newTimeLeft <= 3 && !hasPlayedBeepsRef.current.has(newTimeLeft)) {
                    hasPlayedBeepsRef.current.add(newTimeLeft);
                    playBeep(800 + (3 - newTimeLeft) * 100, 0.15); // Higher pitch as countdown progresses
                }

                if (newTimeLeft === 0) {
                    setIsRunning(false);
                    startTimeRef.current = null;
                    hasPlayedBeepsRef.current.clear();
                    playCompletionSound();
                    if (onComplete) onComplete();
                }
            };

            // Update immediately
            updateTimer();

            // Then update every 100ms
            timerRef.current = setInterval(updateTimer, 100);
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            // Reset start time when paused
            startTimeRef.current = null;
            remainingRef.current = timeLeft;
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isRunning, onComplete]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleStart = () => {
        // Initialize AudioContext on user interaction (required by browsers)
        ensureAudioContext();
        if (timeLeft === 0) {
            setTimeLeft(initialTime);
        }
        setIsRunning(true);
        setIsCompact(true); // Compact mode when timer starts
    };

    const handleReset = () => {
        setIsRunning(false);
        setTimeLeft(initialTime);
        setIsCompact(false); // Expand when reset
        hasPlayedBeepsRef.current.clear(); // Reset beeps
    };

    const presetTimes = [60, 90, 120, 180];

    // Compact view when timer is running
    if (isCompact && isRunning) {
        return (
            <div 
                onClick={() => setIsCompact(false)}
                className="bg-slate-800/95 backdrop-blur-sm rounded-lg p-3 border border-slate-700 cursor-pointer hover:border-primary transition-all"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Timer size={20} className="text-primary" />
                        <div className={`text-2xl font-mono font-bold ${timeLeft <= 10 && timeLeft > 0 ? 'text-red-400' : 'text-white'}`}>
                            {formatTime(timeLeft)}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsRunning(false);
                            }}
                            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors text-sm"
                        >
                            <Pause size={14} />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleReset();
                            }}
                            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors text-sm"
                        >
                            <RotateCcw size={14} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Full view
    return (
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center text-slate-300">
                    <Timer size={16} className="mr-2" />
                    <span className="text-sm font-medium">Hviletimer</span>
                </div>
            </div>

            <div className="text-center mb-4">
                <div className={`text-4xl font-mono font-bold ${timeLeft <= 10 && timeLeft > 0 ? 'text-red-400' : 'text-white'}`}>
                    {formatTime(timeLeft)}
                </div>
            </div>

            <div className="flex gap-2 mb-3">
                {presetTimes.map((time) => (
                    <button
                        key={time}
                        onClick={() => {
                            setTimeLeft(time);
                            setInitialTime(time);
                            setIsRunning(false);
                        }}
                        className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${initialTime === time && !isRunning
                                ? 'bg-primary text-white'
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            }`}
                    >
                        {time}s
                    </button>
                ))}
            </div>

            <div className="flex gap-2">
                <button
                    onClick={isRunning ? () => setIsRunning(false) : handleStart}
                    className="flex-1 py-3 bg-primary hover:bg-emerald-500 text-white rounded-lg font-medium flex items-center justify-center transition-colors"
                >
                    {isRunning ? (
                        <>
                            <Pause size={16} className="mr-2" />
                            Pause
                        </>
                    ) : (
                        <>
                            <Play size={16} className="mr-2" />
                            Start
                        </>
                    )}
                </button>
                <button
                    onClick={handleReset}
                    className="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
                >
                    <RotateCcw size={16} />
                </button>
            </div>
        </div>
    );
};

export default RestTimer;
