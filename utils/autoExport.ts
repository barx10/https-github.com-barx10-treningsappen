import { BackupData, WorkoutSession, ExerciseDefinition } from '../types';
import { saveLastExportDate, loadLastExportDate } from './storage';

export const isExportDue = (intervalDays = 7): boolean => {
    const lastExport = loadLastExportDate();
    if (!lastExport) return true;
    const daysSince = (Date.now() - new Date(lastExport).getTime()) / (1000 * 60 * 60 * 24);
    return daysSince >= intervalDays;
};

const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export const exportJSON = (data: BackupData): void => {
    const payload: BackupData = { ...data, exportDate: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const today = new Date().toISOString().split('T')[0];
    triggerDownload(blob, `treningsappen-backup-${today}.json`);
    saveLastExportDate(new Date().toISOString());
};

export const exportCSV = (history: WorkoutSession[], exercises: ExerciseDefinition[]): void => {
    const headers = ['Dato', 'Økt', 'Øvelse', 'Muskelgruppe', 'Reps', 'Vekt (kg)', 'Varighet (min)'];
    const rows = history.flatMap(session =>
        session.exercises.flatMap(exercise => {
            const exerciseDef = exercises.find(e => e.id === exercise.exerciseDefinitionId);
            return exercise.sets.map(set => [
                new Date(session.date).toLocaleDateString('nb-NO'),
                session.name,
                exerciseDef?.name || 'Ukjent',
                exerciseDef?.muscleGroup || '',
                set.reps || '',
                set.weight || '',
                set.durationMinutes || '',
            ]);
        })
    );
    const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const today = new Date().toISOString().split('T')[0];
    triggerDownload(blob, `treningshistorikk-${today}.csv`);
};
