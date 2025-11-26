import React, { useState, useEffect, useRef } from 'react';
import { Timer, Play, Pause, RotateCcw } from 'lucide-react';

interface RestTimerProps {
    onComplete?: () => void;
}

const RestTimer: React.FC<RestTimerProps> = ({ onComplete }) => {
    const [timeLeft, setTimeLeft] = useState(90); // Default 90 seconds
    const [isRunning, setIsRunning] = useState(false);
    const [initialTime, setInitialTime] = useState(90);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const startTimeRef = useRef<number | null>(null);
    const remainingRef = useRef<number>(90);

    useEffect(() => {
        // Create audio element for notification
        audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGWi77eafTRAMUKfj8LZjHAY4ktfyzHksBSR3x/DdkEAKFF606+uoVRQKRp/g8r5sIQUrgs7y2Ik2CBlou+3mn00QDFCn4/C2YxwGOJLX8sx5LAUkd8fw3ZBAC');
    }, []);

    useEffect(() => {
        if (isRunning) {
            startTimeRef.current = Date.now();
            remainingRef.current = timeLeft;

            timerRef.current = setInterval(() => {
                const elapsed = Math.floor((Date.now() - startTimeRef.current!) / 1000);
                const newTimeLeft = Math.max(0, remainingRef.current - elapsed);
                
                setTimeLeft(newTimeLeft);

                if (newTimeLeft === 0) {
                    setIsRunning(false);
                    if (timerRef.current) clearInterval(timerRef.current);
                    // Play sound
                    if (audioRef.current) {
                        audioRef.current.play().catch(() => { });
                    }
                    if (onComplete) onComplete();
                }
            }, 100); // Update more frequently for accuracy
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
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
        if (timeLeft === 0) {
            setTimeLeft(initialTime);
        }
        setIsRunning(true);
    };

    const handleReset = () => {
        setIsRunning(false);
        setTimeLeft(initialTime);
    };

    const presetTimes = [60, 90, 120, 180];

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
