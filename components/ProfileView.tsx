import React, { useState } from 'react';
import { UserProfile, WorkoutSession, ExerciseDefinition } from '../types';
import { User, Target, TrendingUp, Save, Dumbbell, Trophy, Download, Upload } from 'lucide-react';
import { getStrengthStandard } from '../utils/fitnessCalculations';

interface ProfileViewProps {
    profile: UserProfile;
    onUpdateProfile: (profile: UserProfile) => void;
    history?: WorkoutSession[];
    exercises?: ExerciseDefinition[];
}

const ProfileView: React.FC<ProfileViewProps> = ({ profile, onUpdateProfile, history, exercises }) => {
    const [name, setName] = useState(profile.name || '');
    const [age, setAge] = useState(profile.age?.toString() || '');
    const [weight, setWeight] = useState(profile.weight?.toString() || '');
    const [height, setHeight] = useState(profile.height?.toString() || '');
    const [gender, setGender] = useState<UserProfile['gender']>(profile.gender || 'male');
    const [goal, setGoal] = useState(profile.goal || 'general');

    const handleSave = () => {
        const updatedProfile: UserProfile = {
            name: name.trim() || 'Kenneth',
            age: age ? parseInt(age) : undefined,
            weight: weight ? parseFloat(weight) : undefined,
            height: height ? parseInt(height) : undefined,
            gender: gender,
            goal: goal as UserProfile['goal']
        };
        onUpdateProfile(updatedProfile);
    };

    const goalOptions = [
        { value: 'strength', label: 'Bli sterkere', emoji: '💪' },
        { value: 'muscle', label: 'Bygge muskler', emoji: '🏋️' },
        { value: 'weight_loss', label: 'Gå ned i vekt', emoji: '📉' },
        { value: 'endurance', label: 'Forbedre kondisjonen', emoji: '🏃' },
        { value: 'general', label: 'Generell helse', emoji: '❤️' }
    ];

    // Calculate BMI if height and weight are available
    const bmi = profile.height && profile.weight
        ? (profile.weight / Math.pow(profile.height / 100, 2)).toFixed(1)
        : null;

    // Helper to find max weight for an exercise
    const getMaxWeight = (exerciseName: string): number => {
        if (!history || !exercises) return 0;

        // Find definition ID
        const def = exercises.find(e => e.name === exerciseName);
        if (!def) return 0;

        let max = 0;
        history.forEach(session => {
            const exData = session.exercises.find(e => e.exerciseDefinitionId === def.id);
            if (exData) {
                exData.sets.forEach(set => {
                    if (set.completed && set.weight && set.weight > max) {
                        max = set.weight;
                    }
                });
            }
        });
        return max;
    };

    const strengthExercises = [
        'Knebøy / Goblet Squat',
        'Markløft (KB/Stang)',
        'Benkpress',
        'Skulderpress'
    ];

    const handleExport = () => {
        const data = {
            profile,
            exercises,
            history,
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `treningsapp-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target?.result as string);

                if (confirm('Dette vil overskrive all eksisterende data. Er du sikker?')) {
                    // Import to localStorage
                    if (data.profile) localStorage.setItem('userProfile', JSON.stringify(data.profile));
                    if (data.exercises) localStorage.setItem('exercises', JSON.stringify(data.exercises));
                    if (data.history) localStorage.setItem('history', JSON.stringify(data.history));

                    alert('Data importert! Refresh siden for å se endringene.');
                    window.location.reload();
                }
            } catch (error) {
                alert('Feil ved import av data. Sjekk at filen er gyldig.');
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="p-4 pb-24 space-y-6">
            <header className="flex items-center space-x-3 mb-6 mt-2">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    <User size={24} className="text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">Min Profil</h1>
                    <p className="text-muted text-sm">Personlig informasjon og mål</p>
                </div>
            </header>

            {/* Personal Info Section */}
            <div className="bg-surface rounded-xl border border-slate-700 p-5 space-y-4">
                <h2 className="text-lg font-bold text-white flex items-center">
                    <User size={18} className="mr-2 text-primary" />
                    Personlig Info
                </h2>

                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Navn</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-background border border-slate-700 rounded-lg p-3 text-white focus:border-primary focus:outline-none"
                        placeholder="Ditt navn"
                    />
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Alder</label>
                        <input
                            type="number"
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                            className="w-full bg-background border border-slate-700 rounded-lg p-3 text-white focus:border-primary focus:outline-none"
                            placeholder="25"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Vekt (kg)</label>
                        <input
                            type="number"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            className="w-full bg-background border border-slate-700 rounded-lg p-3 text-white focus:border-primary focus:outline-none"
                            placeholder="75"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Høyde (cm)</label>
                        <input
                            type="number"
                            value={height}
                            onChange={(e) => setHeight(e.target.value)}
                            className="w-full bg-background border border-slate-700 rounded-lg p-3 text-white focus:border-primary focus:outline-none"
                            placeholder="180"
                        />
                    </div>
                </div>

                <div className="mt-4">
                    <label className="block text-sm font-medium text-slate-300 mb-2">Kjønn</label>
                    <div className="flex space-x-3">
                        <button
                            onClick={() => setGender('male')}
                            className={`flex-1 py-2 rounded-lg border border-slate-700 transition-colors ${gender === 'male' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 text-slate-400'}`}
                        >
                            Mann
                        </button>
                        <button
                            onClick={() => setGender('female')}
                            className={`flex-1 py-2 rounded-lg border border-slate-700 transition-colors ${gender === 'female' ? 'bg-pink-600 border-pink-500 text-white' : 'bg-slate-800 text-slate-400'}`}
                        >
                            Kvinne
                        </button>
                    </div>
                </div>
            </div>

            {/* Goal Section */}
            <div className="bg-surface rounded-xl border border-slate-700 p-5 space-y-4">
                <h2 className="text-lg font-bold text-white flex items-center">
                    <Target size={18} className="mr-2 text-primary" />
                    Treningsmål
                </h2>

                <div className="space-y-2">
                    {goalOptions.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => setGoal(option.value)}
                            className={`w-full p-4 rounded-lg border-2 transition-all text-left flex items-center justify-between ${goal === option.value
                                ? 'border-primary bg-primary/10 text-white'
                                : 'border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-600'
                                }`}
                        >
                            <span className="font-medium">{option.label}</span>
                            <span className="text-2xl">{option.emoji}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Health Stats Section */}
            {bmi && profile.age && profile.weight && profile.height && (
                <div className="bg-surface rounded-xl border border-slate-700 p-5 space-y-4">
                    <h2 className="text-lg font-bold text-white flex items-center">
                        <TrendingUp size={18} className="mr-2 text-primary" />
                        Helse & Ernæring
                    </h2>

                    <div className="grid grid-cols-2 gap-3">
                        {/* BMI */}
                        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                            <div className="text-[10px] text-muted uppercase tracking-wide mb-1">BMI</div>
                            <div className="text-xl font-bold text-white">{bmi}</div>
                            <div className={`text-xs mt-1 font-medium ${parseFloat(bmi) < 18.5 ? 'text-blue-400' :
                                parseFloat(bmi) < 25 ? 'text-emerald-400' :
                                    parseFloat(bmi) < 30 ? 'text-yellow-400' : 'text-red-400'
                                }`}>
                                {parseFloat(bmi) < 18.5 && 'Undervekt'}
                                {parseFloat(bmi) >= 18.5 && parseFloat(bmi) < 25 && 'Normal'}
                                {parseFloat(bmi) >= 25 && parseFloat(bmi) < 30 && 'Overvekt'}
                                {parseFloat(bmi) >= 30 && 'Fedme'}
                            </div>
                        </div>

                        {/* Calories (BMR/TDEE) */}
                        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                            <div className="text-[10px] text-muted uppercase tracking-wide mb-1">Daglig kaloribehov</div>
                            <div className="text-xl font-bold text-white">
                                {(() => {
                                    // Mifflin-St Jeor Equation
                                    const s = gender === 'male' ? 5 : -161;
                                    const bmr = (10 * profile.weight!) + (6.25 * profile.height!) - (5 * profile.age!) + s;
                                    // Activity factor (Estimated Moderate 1.375 or Active 1.55)
                                    // Let's assume Moderate for general active users
                                    const tdee = Math.round(bmr * 1.375);
                                    return tdee;
                                })()}
                                <span className="text-xs font-normal text-muted ml-1">kcal</span>
                            </div>
                            <div className="text-xs text-slate-400 mt-1">Vedlikehold</div>
                        </div>

                        {/* Protein */}
                        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                            <div className="text-[10px] text-muted uppercase tracking-wide mb-1">Protein</div>
                            <div className="text-xl font-bold text-white">
                                {Math.round(profile.weight * 1.8)} - {Math.round(profile.weight * 2.2)}
                                <span className="text-xs font-normal text-muted ml-1">g</span>
                            </div>
                            <div className="text-xs text-slate-400 mt-1">Anbefalt daglig</div>
                        </div>

                        {/* Water */}
                        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                            <div className="text-[10px] text-muted uppercase tracking-wide mb-1">Vann</div>
                            <div className="text-xl font-bold text-white">
                                {(profile.weight * 0.033).toFixed(1)}
                                <span className="text-xs font-normal text-muted ml-1">L</span>
                            </div>
                            <div className="text-xs text-slate-400 mt-1">Minimum daglig</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Strength Standards Section */}
            {profile.weight && history && exercises && (
                <div className="bg-surface rounded-xl border border-slate-700 p-5 space-y-4">
                    <h2 className="text-lg font-bold text-white flex items-center">
                        <Trophy size={18} className="mr-2 text-yellow-500" />
                        Styrkestandarder
                    </h2>
                    <p className="text-xs text-muted">Basert på din kroppsvekt ({profile.weight}kg)</p>

                    <div className="space-y-4">
                        {strengthExercises.map(exName => {
                            const maxWeight = getMaxWeight(exName);
                            if (maxWeight === 0) return null;

                            const standard = getStrengthStandard(exName, maxWeight, profile.weight);
                            if (!standard) return null;

                            return (
                                <div key={exName} className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/50">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium text-slate-200">{exName}</span>
                                        <span className="text-sm font-bold text-white">{maxWeight} kg</span>
                                    </div>

                                    <div className="relative h-2 bg-slate-700 rounded-full overflow-hidden mb-1">
                                        <div
                                            className={`absolute top-0 left-0 h-full rounded-full ${standard.level === 'Avansert' ? 'bg-purple-500' :
                                                standard.level === 'Middels' ? 'bg-emerald-500' :
                                                    standard.level === 'Nybegynner+' ? 'bg-blue-500' :
                                                        'bg-slate-500'
                                                }`}
                                            style={{ width: `${standard.percentile}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-[10px] text-muted uppercase tracking-wider">
                                        <span>Nivå: <span className="text-slate-300">{standard.level}</span></span>
                                        <span>{standard.percentile}%</span>
                                    </div>
                                </div>
                            );
                        })}
                        {strengthExercises.every(exName => getMaxWeight(exName) === 0) && (
                            <div className="text-sm text-muted italic text-center py-2">
                                Logg noen økter med baseøvelser for å se din styrkeprofil!
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Backup & Restore Section */}
            <div className="bg-surface rounded-xl border border-slate-700 p-5 space-y-4">
                <h2 className="text-lg font-bold text-white flex items-center">
                    <Download size={18} className="mr-2 text-blue-400" />
                    Backup & Gjenopprett
                </h2>
                <p className="text-xs text-muted">
                    Sikkerhetskopier all data (profil, øvelser, historikk) eller gjenopprett fra tidligere backup.
                </p>

                <div className="flex gap-3">
                    <button
                        onClick={handleExport}
                        className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium flex items-center justify-center transition-colors"
                    >
                        <Download size={16} className="mr-2" />
                        Eksporter Data
                    </button>

                    <label className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium flex items-center justify-center transition-colors cursor-pointer">
                        <Upload size={16} className="mr-2" />
                        Importer Data
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleImport}
                            className="hidden"
                        />
                    </label>
                </div>
            </div>

            {/* Save Button */}
            <button
                onClick={handleSave}
                className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-emerald-500 transition-all flex items-center justify-center"
            >
                <Save size={20} className="mr-2" />
                Lagre Profil
            </button>
        </div>
    );
};

export default ProfileView;
