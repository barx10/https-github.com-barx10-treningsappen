import React, { useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';

interface PRCelebrationProps {
  exerciseName: string;
  prType: 'weight' | 'reps' | 'volume';
  value: number;
  onClose: () => void;
}

const PRCelebration: React.FC<PRCelebrationProps> = ({ exerciseName, prType, value, onClose }) => {
  const [confetti, setConfetti] = useState<Array<{ id: number; x: number; delay: number; color: string }>>([]);

  useEffect(() => {
    // Generate confetti particles
    const particles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.5,
      color: ['#fbbf24', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#10b981'][Math.floor(Math.random() * 6)]
    }));
    setConfetti(particles);

    // Auto-close after 3 seconds
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const getPRLabel = () => {
    switch (prType) {
      case 'weight':
        return `${value} kg`;
      case 'reps':
        return `${value} reps`;
      case 'volume':
        return `${value} kg`;
    }
  };

  const getPRTypeLabel = () => {
    switch (prType) {
      case 'weight':
        return 'Ny vektrekord!';
      case 'reps':
        return 'Ny reps-rekord!';
      case 'volume':
        return 'Ny volumrekord!';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* Confetti */}
      {confetti.map((particle) => (
        <div
          key={particle.id}
          className="absolute animate-confetti"
          style={{
            left: `${particle.x}%`,
            top: '-10%',
            animationDelay: `${particle.delay}s`,
            color: particle.color
          }}
        >
          <div className="text-2xl">🎉</div>
        </div>
      ))}

      {/* PR Message */}
      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-2xl p-6 shadow-2xl pointer-events-auto animate-bounce-in max-w-sm mx-4">
        <div className="flex items-center justify-center mb-4">
          <Trophy className="w-16 h-16 text-yellow-200" />
        </div>
        <h2 className="text-3xl font-bold text-center mb-2">🏆 NY PR! 🏆</h2>
        <h3 className="text-xl font-semibold text-center text-yellow-100 mb-1">
          {getPRTypeLabel()}
        </h3>
        <p className="text-center text-white/90 mb-3">{exerciseName}</p>
        <div className="text-4xl font-bold text-center text-yellow-100">
          {getPRLabel()}
        </div>
        <p className="text-center text-sm text-yellow-100 mt-4">
          Du blir sterkere! 💪
        </p>
      </div>

      {/* CSS for animations */}
      <style>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        @keyframes bounce-in {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-confetti {
          animation: confetti-fall 3s ease-in forwards;
        }

        .animate-bounce-in {
          animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
      `}</style>
    </div>
  );
};

export default PRCelebration;
