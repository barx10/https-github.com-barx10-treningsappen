import React from 'react';
import { Home, History, Dumbbell, PlayCircle, User, Info } from 'lucide-react';
import { Screen } from '../types';

interface BottomNavProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
  hasActiveWorkout: boolean;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentScreen, onNavigate, hasActiveWorkout }) => {
  const navItems = [
    { screen: Screen.HOME, icon: Home, label: 'Hjem' },
    { screen: Screen.HISTORY, icon: History, label: 'Historikk' },
    { screen: Screen.EXERCISES, icon: Dumbbell, label: 'Øvelser' },
    { screen: Screen.PROFILE, icon: User, label: 'Profil' },
    { screen: Screen.INFO, icon: Info, label: 'Info' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-slate-700 pb-safe z-50">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => (
          <button
            key={item.screen}
            onClick={() => onNavigate(item.screen)}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${currentScreen === item.screen ? 'text-primary' : 'text-muted hover:text-slate-300'
              }`}
          >
            <item.icon size={20} strokeWidth={2.5} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}

        {/* Floating Action Button logic for Active Workout */}
        <button
          onClick={() => onNavigate(Screen.ACTIVE_WORKOUT)}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${currentScreen === Screen.ACTIVE_WORKOUT ? 'text-secondary' : 'text-muted hover:text-slate-300'
            }`}
        >
          <div className={`relative ${hasActiveWorkout ? 'animate-pulse text-secondary' : ''}`}>
            <PlayCircle size={hasActiveWorkout ? 24 : 20} strokeWidth={2.5} />
            {hasActiveWorkout && (
              <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            )}
          </div>
          <span className={`text-[10px] font-medium ${hasActiveWorkout ? 'text-secondary font-bold' : ''}`}>
            {hasActiveWorkout ? 'Fortsett' : 'Økt'}
          </span>
        </button>
      </div>
    </div>
  );
};

export default BottomNav;