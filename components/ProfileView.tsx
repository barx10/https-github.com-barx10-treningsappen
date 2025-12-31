import React, { useState } from 'react';
import { UserProfile, WorkoutSession, ExerciseDefinition, BackupData } from '../types';
import { User, Target, TrendingUp, Save, Dumbbell, Trophy, Download, Upload, X, Calendar } from 'lucide-react';
import { getStrengthStandard } from '../utils/fitnessCalculations';
import WeeklySummaryView from './WeeklySummaryView';

interface ProfileViewProps {
    profile: UserProfile;
    onUpdateProfile: (profile: UserProfile) => void;
    history?: WorkoutSession[];
    exercises?: ExerciseDefinition[];
    activeSession?: WorkoutSession | null;
    onImportData?: (data: Partial<BackupData>) => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ profile, onUpdateProfile, history, exercises, activeSession, onImportData }) => {
    const [name, setName] = useState(profile.name || '');
    const [age, setAge] = useState(profile.age?.toString() || '');
    const [weight, setWeight] = useState(profile.weight?.toString() || '');
    const [height, setHeight] = useState(profile.height?.toString() || '');
    const [gender, setGender] = useState<UserProfile['gender']>(profile.gender || 'male');
    const [goal, setGoal] = useState(profile.goal || 'general');
    const [isSaving, setIsSaving] = useState(false);
    const [showSaved, setShowSaved] = useState(false);

    const handleSave = () => {
        setIsSaving(true);

        const updatedProfile: UserProfile = {
            name: name.trim() || 'Kenneth',
            age: age ? parseInt(age) : undefined,
            weight: weight ? parseFloat(weight) : undefined,
            height: height ? parseInt(height) : undefined,
            gender: gender,
            goal: goal as UserProfile['goal']
        };

        // Simulate save delay for better UX
        setTimeout(() => {
            onUpdateProfile(updatedProfile);
            setIsSaving(false);
            setShowSaved(true);

            // Hide success message after 2 seconds
            setTimeout(() => {
                setShowSaved(false);
            }, 2000);
        }, 300);
    };

    const goalOptions: { value: 'strength' | 'muscle' | 'weight_loss' | 'endurance' | 'general'; label: string; emoji: string }[] = [
        { value: 'strength', label: 'Bli sterkere', emoji: '💪' },
        { value: 'muscle', label: 'Bygge muskler', emoji: '🏋️' },
        { value: 'weight_loss', label: 'Gå ned i vekt', emoji: '📉' },
        { value: 'endurance', label: 'Forbedre kondisjonen', emoji: '🏃' },
        { value: 'general', label: 'Generell helse', emoji: '❤️' }
    ];

    const [selectedGoalInfo, setSelectedGoalInfo] = useState<string | null>(null);
    const [showStrengthModal, setShowStrengthModal] = useState(false);
    const [showNutritionInfo, setShowNutritionInfo] = useState(false);
    const [showWeeklySummary, setShowWeeklySummary] = useState(false);

    const goalInfo: Record<string, { title: string; tips: string[] }> = {
        strength: {
            title: 'Bli sterkere 💪',
            tips: [
                '🏋️ Tren 3-4 ganger per uke med fokus på tunge løft',
                '📊 Progressive overload: Øk vekt gradvis hver uke',
                '⏱️ Ta 2-3 minutters pause mellom tunge sett',
                '🎯 Fokuser på baseøvelser: knebøy, markløft, benkpress',
                '🍗 Spis nok protein: 1.6-2.2g per kg kroppsvekt',
                '💤 Hvil er viktig - muskler blir sterkere under restitusjon',
                '📈 Logg fremgang og øk vekt når du klarer 3x8-10 reps'
            ]
        },
        muscle: {
            title: 'Bygge muskler 🏋️',
            tips: [
                '💪 Tren 4-5 ganger per uke med høyt volum',
                '🎯 8-12 repetisjoner per sett for optimal muskelvekst',
                '🍖 Høyt proteininntak: 1.8-2.4g per kg kroppsvekt',
                '🍽️ Spis i kalorioverskudd (200-500 kcal over vedlikehold)',
                '⏱️ 60-90 sekunders pause mellom sett',
                '🔄 Tren hver muskelgruppe 2 ganger per uke',
                '💤 Sov 7-9 timer - muskler vokser mens du hviler',
                '📊 Variert trening: bytt øvelser hver 4-6 uke'
            ]
        },
        weight_loss: {
            title: 'Gå ned i vekt 📉',
            tips: [
                '🔥 Kombiner styrke og kondisjon 4-5 ganger per uke',
                '🥗 Spis i kaloriunderskudd (300-500 kcal under vedlikehold)',
                '🍗 Behold høyt proteininntak for å bevare muskelmasse',
                '🏃 Legg inn 2-3 kondisjonsøkter per uke',
                '💪 Styrketrening øker hvileforbrenningen',
                '💧 Drikk mye vann - minst 2-3 liter daglig',
                '📊 Vei deg 1 gang per uke, samme tid på dagen',
                '⏱️ Vær tålmodig - 0.5-1kg per uke er sunt'
            ]
        },
        endurance: {
            title: 'Forbedre kondisjonen 🏃',
            tips: [
                '❤️ Tren kondisjon 3-5 ganger per uke',
                '📈 Bygg opp distanse og varighet gradvis (10% per uke)',
                '🎯 Varier intensitet: rolig, moderat og intervaller',
                '🦵 Legg inn styrketrening 1-2 ganger per uke',
                '⏱️ Lange rolige økter bygger grunnkondisjonen',
                '🔥 Intervaller forbedrer VO2 max og hastighet',
                '💧 Hydrering er viktig - drikk før, under og etter',
                '🍝 Spis nok karbohydrater for energi'
            ]
        },
        general: {
            title: 'Generell helse ❤️',
            tips: [
                '🏃 Vær aktiv minst 150 min per uke (moderat intensitet)',
                '💪 Styrketrening 2-3 ganger per uke',
                '🚶 Daglige turer eller lett aktivitet',
                '🥗 Variert og balansert kosthold',
                '💧 Drikk nok vann gjennom dagen',
                '💤 Prioriter god søvn (7-9 timer)',
                '🧘 Inkluder mobilitet og tøying',
                '📊 Konsistens er viktigere enn intensitet'
            ]
        }
    };

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
        const data: Partial<BackupData> & { exportDate: string } = {
            profile,
            exercises: exercises ?? [],
            history: history ?? [],
            activeSession: activeSession ?? null,
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
                const data = JSON.parse(e.target?.result as string) as Partial<BackupData>;

                if (!data.profile && !data.exercises && !data.history) {
                    alert('Filen inneholder ingen kjente treningsdata.');
                    return;
                }

                if (confirm('Dette vil overskrive eksisterende data i appen. Vil du fortsette?')) {
                    if (onImportData) {
                        onImportData({
                            profile: data.profile,
                            exercises: data.exercises,
                            history: data.history,
                            activeSession: 'activeSession' in data ? data.activeSession ?? null : undefined
                        });
                        alert('Data importert!');
                    } else {
                        alert('Import-støtte er ikke tilgjengelig akkurat nå.');
                    }
                }
            } catch (error) {
                alert('Feil ved import av data. Sjekk at filen er gyldig.');
            }
        };
        reader.readAsText(file);
        event.target.value = '';
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
                <p className="text-xs text-muted">Trykk på ℹ️ for tips om hvordan nå målet</p>

                <div className="space-y-2">
                    {goalOptions.map((option) => (
                        <div key={option.value} className="relative">
                            <button
                                onClick={() => setGoal(option.value)}
                                className={`w-full p-4 rounded-lg border-2 transition-all text-left flex items-center justify-between ${goal === option.value
                                    ? 'border-primary bg-primary/10 text-white'
                                    : 'border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-600'
                                    }`}
                            >
                                <span className="font-medium">{option.label}</span>
                                <div className="flex items-center space-x-2">
                                    <span className="text-2xl">{option.emoji}</span>
                                </div>
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedGoalInfo(option.value);
                                }}
                                className="absolute right-14 top-1/2 transform -translate-y-1/2 p-2 hover:bg-slate-700 rounded-full transition-colors"
                            >
                                <span className="text-lg">ℹ️</span>
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Health Stats Section */}
            {bmi && profile.age && profile.weight && profile.height && (
                <div className="bg-surface rounded-xl border border-slate-700 p-5 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-white flex items-center">
                            <TrendingUp size={18} className="mr-2 text-primary" />
                            Helse & Ernæring
                        </h2>
                        <button
                            onClick={() => setShowNutritionInfo(true)}
                            className="p-2 hover:bg-slate-700 rounded-full transition-colors"
                        >
                            <span className="text-lg">ℹ️</span>
                        </button>
                    </div>

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

                        {/* Calories (Goal-based TDEE) */}
                        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                            <div className="text-[10px] text-muted uppercase tracking-wide mb-1">Daglig kaloribehov</div>
                            <div className="text-xl font-bold text-white">
                                {(() => {
                                    const s = gender === 'male' ? 5 : -161;
                                    const bmr = (10 * profile.weight!) + (6.25 * profile.height!) - (5 * profile.age!) + s;
                                    const tdee = Math.round(bmr * 1.375);

                                    // Adjust based on goal
                                    if (goal === 'weight_loss') {
                                        return tdee - 400; // Deficit
                                    } else if (goal === 'muscle') {
                                        return tdee + 300; // Surplus
                                    }
                                    return tdee; // Maintenance
                                })()}
                                <span className="text-xs font-normal text-muted ml-1">kcal</span>
                            </div>
                            <div className="text-xs text-slate-400 mt-1">
                                {goal === 'weight_loss' && 'Vektnedgang'}
                                {goal === 'muscle' && 'Muskelvekst'}
                                {(!goal || goal === 'strength' || goal === 'endurance' || goal === 'general') && 'Vedlikehold'}
                            </div>
                        </div>

                        {/* Protein (Goal-based) */}
                        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                            <div className="text-[10px] text-muted uppercase tracking-wide mb-1">Protein</div>
                            <div className="text-xl font-bold text-white">
                                {(() => {
                                    if (goal === 'muscle' || goal === 'strength') {
                                        return `${Math.round(profile.weight * 2.0)} - ${Math.round(profile.weight * 2.4)}`;
                                    } else if (goal === 'weight_loss') {
                                        return `${Math.round(profile.weight * 1.8)} - ${Math.round(profile.weight * 2.2)}`;
                                    }
                                    return `${Math.round(profile.weight * 1.6)} - ${Math.round(profile.weight * 2.0)}`;
                                })()}
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

                        {/* Macros Distribution */}
                        <div className="col-span-2 bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                            <div className="text-[10px] text-muted uppercase tracking-wide mb-2">Makrofordeling (anbefalt)</div>
                            <div className="flex justify-between text-xs">
                                {(() => {
                                    let protein, carbs, fat;
                                    if (goal === 'muscle' || goal === 'strength') {
                                        protein = 30; carbs = 45; fat = 25;
                                    } else if (goal === 'weight_loss') {
                                        protein = 35; carbs = 35; fat = 30;
                                    } else if (goal === 'endurance') {
                                        protein = 20; carbs = 55; fat = 25;
                                    } else {
                                        protein = 25; carbs = 45; fat = 30;
                                    }

                                    return (
                                        <>
                                            <div className="text-center">
                                                <div className="text-lg font-bold text-blue-400">{protein}%</div>
                                                <div className="text-muted">Protein</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-lg font-bold text-yellow-400">{carbs}%</div>
                                                <div className="text-muted">Karbs</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-lg font-bold text-orange-400">{fat}%</div>
                                                <div className="text-muted">Fett</div>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Strength Standards Section */}
            {profile.weight && history && exercises && (
                <div
                    className="bg-surface rounded-xl border border-slate-700 p-5 space-y-4 cursor-pointer hover:border-slate-600 transition-colors"
                    onClick={() => setShowStrengthModal(true)}
                >
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-white flex items-center">
                            <Trophy size={18} className="mr-2 text-yellow-500" />
                            Styrkeoversikt
                        </h2>
                        <div className="text-xs text-primary flex items-center">
                            Se alle øvelser →
                        </div>
                    </div>
                    <p className="text-xs text-muted">Basert på din kroppsvekt ({profile.weight}kg)</p>

                    <div className="grid grid-cols-2 gap-3">
                        {strengthExercises.slice(0, 4).map(exName => {
                            const maxWeight = getMaxWeight(exName);
                            if (maxWeight === 0) return null;

                            const standard = getStrengthStandard(exName, maxWeight, profile.weight);
                            if (!standard) return null;

                            return (
                                <div key={exName} className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/50">
                                    <div className="text-xs text-muted mb-1 truncate">{exName}</div>
                                    <div className="text-lg font-bold text-white">{maxWeight} kg</div>
                                    <div className="text-xs text-slate-400">{standard.level}</div>
                                </div>
                            );
                        })}
                    </div>

                    {strengthExercises.every(exName => getMaxWeight(exName) === 0) && (
                        <div className="text-sm text-muted italic text-center py-2">
                            Logg noen økter for å se din styrkeprofil!
                        </div>
                    )}
                </div>
            )}

            {/* Weekly Summary Section */}
            <div className="bg-surface rounded-xl border border-slate-700 p-5">
                <button
                    onClick={() => setShowWeeklySummary(true)}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg font-semibold flex items-center justify-center transition-all shadow-lg"
                >
                    <Calendar size={20} className="mr-2" />
                    📊 Ukesoppsummering
                </button>
                <p className="text-xs text-muted text-center mt-2">
                    Se fremgang og få motiverende pep talk
                </p>
            </div>

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
                disabled={isSaving}
                className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center ${isSaving
                    ? 'bg-emerald-400 cursor-wait'
                    : 'bg-primary hover:bg-emerald-500 text-white'
                    }`}
            >
                {isSaving ? (
                    <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Lagrer...
                    </>
                ) : (
                    <>
                        <Save size={20} className="mr-2" />
                        Lagre Profil
                    </>
                )}
            </button>

            {/* Success Toast */}
            {showSaved && (
                <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-emerald-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center space-x-2 animate-in slide-in-from-bottom-5 z-50">
                    <div className="h-5 w-5 rounded-full bg-white flex items-center justify-center">
                        <svg className="h-3 w-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <span className="font-medium">Profil lagret!</span>
                </div>
            )}

            {/* Goal Info Modal */}
            {selectedGoalInfo && goalInfo[selectedGoalInfo] && (
                <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-surface rounded-2xl border border-slate-700 w-full max-w-lg shadow-2xl max-h-[80vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-700 flex justify-between items-center sticky top-0 bg-surface">
                            <h2 className="text-2xl font-bold text-white">{goalInfo[selectedGoalInfo].title}</h2>
                            <button
                                onClick={() => setSelectedGoalInfo(null)}
                                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-3">
                            <p className="text-slate-300 mb-4">
                                Her er noen tips for å nå ditt mål:
                            </p>
                            {goalInfo[selectedGoalInfo].tips.map((tip, idx) => (
                                <div key={idx} className="flex items-start space-x-3 bg-slate-800/50 p-3 rounded-lg">
                                    <span className="text-primary font-bold text-sm mt-0.5">{idx + 1}.</span>
                                    <p className="text-slate-200 text-sm leading-relaxed flex-1">{tip}</p>
                                </div>
                            ))}
                        </div>

                        <div className="p-6 border-t border-slate-700 bg-slate-800/30">
                            <button
                                onClick={() => setSelectedGoalInfo(null)}
                                className="w-full py-3 bg-primary hover:bg-emerald-500 text-white rounded-xl font-medium transition-colors"
                            >
                                Lukk
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Strength Overview Modal */}
            {showStrengthModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-sm overflow-y-auto">
                    <div className="min-h-screen p-4 flex items-start justify-center pt-8">
                        <div className="bg-surface rounded-2xl border border-slate-700 w-full max-w-2xl shadow-2xl">
                            <div className="p-6 border-b border-slate-700 flex justify-between items-start sticky top-0 bg-surface z-10">
                                <div>
                                    <h2 className="text-2xl font-bold text-white flex items-center">
                                        <Trophy size={24} className="mr-2 text-yellow-500" />
                                        Styrkeoversikt
                                    </h2>
                                    <p className="text-sm text-muted mt-1">Alle øvelser med din max-vekt</p>
                                </div>
                                <button
                                    onClick={() => setShowStrengthModal(false)}
                                    className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                                {(() => {
                                    // Get all unique exercises from history
                                    const exerciseMaxes: Record<string, number> = {};

                                    history?.forEach(session => {
                                        session.exercises.forEach(ex => {
                                            const def = exercises?.find(e => e.id === ex.exerciseDefinitionId);
                                            if (def && def.type !== 'Kardio') {
                                                ex.sets.forEach(set => {
                                                    if (set.completed && set.weight) {
                                                        const current = exerciseMaxes[def.name] || 0;
                                                        if (set.weight > current) {
                                                            exerciseMaxes[def.name] = set.weight;
                                                        }
                                                    }
                                                });
                                            }
                                        });
                                    });

                                    const sortedExercises = Object.entries(exerciseMaxes)
                                        .sort(([, a], [, b]) => b - a);

                                    if (sortedExercises.length === 0) {
                                        return (
                                            <div className="text-center text-muted py-8">
                                                <Trophy size={48} className="mx-auto mb-4 opacity-30" />
                                                <p>Ingen styrkeøvelser logget ennå</p>
                                                <p className="text-sm mt-2">Start å trene for å se fremgang!</p>
                                            </div>
                                        );
                                    }

                                    return sortedExercises.map(([exerciseName, maxWeight]) => {
                                        const standard = profile.weight
                                            ? getStrengthStandard(exerciseName, maxWeight, profile.weight)
                                            : null;

                                        return (
                                            <div key={exerciseName} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="flex-1">
                                                        <h3 className="font-bold text-white">{exerciseName}</h3>
                                                        {standard && (
                                                            <div className="text-xs text-muted mt-1">
                                                                {standard.level} • {standard.percentile}% av din kroppsvekt
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-2xl font-bold text-white">{maxWeight} kg</div>
                                                        <div className="text-xs text-muted">Max</div>
                                                    </div>
                                                </div>

                                                {standard && (
                                                    <div className="relative h-2 bg-slate-700 rounded-full overflow-hidden">
                                                        <div
                                                            className={`absolute top-0 left-0 h-full rounded-full transition-all ${standard.level === 'Avansert' ? 'bg-purple-500' :
                                                                standard.level === 'Middels' ? 'bg-emerald-500' :
                                                                    standard.level === 'Nybegynner+' ? 'bg-blue-500' :
                                                                        'bg-slate-500'
                                                                }`}
                                                            style={{ width: `${standard.percentile}%` }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    });
                                })()}
                            </div>

                            <div className="p-6 border-t border-slate-700 bg-slate-800/30">
                                <button
                                    onClick={() => setShowStrengthModal(false)}
                                    className="w-full py-3 bg-primary hover:bg-emerald-500 text-white rounded-xl font-medium transition-colors"
                                >
                                    Lukk
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Nutrition Info Modal */}
            {showNutritionInfo && (
                <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-surface rounded-2xl border border-slate-700 w-full max-w-lg shadow-2xl max-h-[80vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-700 flex justify-between items-center sticky top-0 bg-surface">
                            <h2 className="text-2xl font-bold text-white">Ernæringsguide</h2>
                            <button
                                onClick={() => setShowNutritionInfo(false)}
                                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="bg-slate-800/50 p-4 rounded-lg">
                                <h3 className="font-bold text-white mb-2">📊 BMI (Body Mass Index)</h3>
                                <p className="text-sm text-slate-300">
                                    Beregnes som: vekt (kg) / høyde (m)²
                                </p>
                                <p className="text-xs text-muted mt-2">
                                    BMI er en generell indikator, men tar ikke hensyn til muskelmasse.
                                </p>
                            </div>

                            <div className="bg-slate-800/50 p-4 rounded-lg">
                                <h3 className="font-bold text-white mb-2">🔥 Kaloribehov</h3>
                                <p className="text-sm text-slate-300 mb-2">
                                    Beregnet med Mifflin-St Jeor formel og moderat aktivitetsnivå.
                                </p>
                                <div className="text-xs text-slate-400 space-y-1">
                                    <p>• <span className="text-emerald-400">Vedlikehold</span>: Oppretthold vekt</p>
                                    <p>• <span className="text-blue-400">Vektnedgang</span>: -400 kcal (0.5kg/uke)</p>
                                    <p>• <span className="text-yellow-400">Muskelvekst</span>: +300 kcal</p>
                                </div>
                            </div>

                            <div className="bg-slate-800/50 p-4 rounded-lg">
                                <h3 className="font-bold text-white mb-2">🍗 Protein</h3>
                                <p className="text-sm text-slate-300 mb-2">
                                    Tilpasset ditt treningsmål:
                                </p>
                                <div className="text-xs text-slate-400 space-y-1">
                                    <p>• <span className="text-white">Styrke/Muskel</span>: 2.0-2.4g per kg</p>
                                    <p>• <span className="text-white">Vektnedgang</span>: 1.8-2.2g per kg</p>
                                    <p>• <span className="text-white">Generelt</span>: 1.6-2.0g per kg</p>
                                </div>
                            </div>

                            <div className="bg-slate-800/50 p-4 rounded-lg">
                                <h3 className="font-bold text-white mb-2">💧 Vann</h3>
                                <p className="text-sm text-slate-300">
                                    Minimum 33ml per kg kroppsvekt. Øk ved hard trening eller varmt vær.
                                </p>
                            </div>

                            <div className="bg-slate-800/50 p-4 rounded-lg">
                                <h3 className="font-bold text-white mb-2">⚖️ Makrofordeling</h3>
                                <p className="text-sm text-slate-300 mb-2">
                                    Optimalisert for ditt mål:
                                </p>
                                <div className="text-xs text-slate-400 space-y-1">
                                    <p>• <span className="text-white">Styrke/Muskel</span>: 30% protein, 45% karbs, 25% fett</p>
                                    <p>• <span className="text-white">Vektnedgang</span>: 35% protein, 35% karbs, 30% fett</p>
                                    <p>• <span className="text-white">Kondisjon</span>: 20% protein, 55% karbs, 25% fett</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-700 bg-slate-800/30">
                            <button
                                onClick={() => setShowNutritionInfo(false)}
                                className="w-full py-3 bg-primary hover:bg-emerald-500 text-white rounded-xl font-medium transition-colors"
                            >
                                Lukk
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Weekly Summary Modal */}
            {showWeeklySummary && (
                <div className="fixed inset-0 bg-black/95 z-50 overflow-y-auto">
                    <WeeklySummaryView
                        history={history || []}
                        profile={profile}
                        exercises={exercises || []}
                        onClose={() => setShowWeeklySummary(false)}
                    />
                </div>
            )}
        </div>
    );
};

export default ProfileView;
