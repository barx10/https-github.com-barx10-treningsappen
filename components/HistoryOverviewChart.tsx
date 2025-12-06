import React, { useMemo } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Line,
    ComposedChart
} from 'recharts';
import { WorkoutSession, ExerciseDefinition } from '../types';

interface HistoryOverviewChartProps {
    history: WorkoutSession[];
    exercises: ExerciseDefinition[];
}

const HistoryOverviewChart: React.FC<HistoryOverviewChartProps> = ({ history, exercises }) => {
    const getWeekNumber = (date: Date) => {
        // ISO 8601 week number calculation
        const target = new Date(date.valueOf());
        const dayNr = (date.getDay() + 6) % 7; // Monday = 0, Sunday = 6
        target.setDate(target.getDate() - dayNr + 3); // Nearest Thursday
        const firstThursday = new Date(target.getFullYear(), 0, 4); // Jan 4th is always in week 1
        const diff = target.getTime() - firstThursday.getTime();
        const weekNumber = 1 + Math.round(diff / 604800000); // 604800000 = 7 * 24 * 3600 * 1000
        return weekNumber;
    };

    const weeklyData = useMemo(() => {
        // Get last 12 weeks
        const weeks: Record<string, { workouts: number; volume: number; weekLabel: string }> = {};
        const now = new Date();

        // Create buckets for last 12 weeks
        for (let i = 11; i >= 0; i--) {
            const weekDate = new Date(now);
            weekDate.setDate(now.getDate() - (i * 7));
            const weekNum = getWeekNumber(weekDate);
            const weekLabel = `Uke ${weekNum}`;
            weeks[weekLabel] = { workouts: 0, volume: 0, weekLabel };
        }

        // Aggregate data
        history.forEach(session => {
            const sessionDate = new Date(session.date);
            const weekNum = getWeekNumber(sessionDate);
            const weekLabel = `Uke ${weekNum}`;

            if (weeks[weekLabel]) {
                weeks[weekLabel].workouts++;

                // Calculate volume
                session.exercises.forEach(ex => {
                    ex.sets.forEach(set => {
                        if (set.completed && set.weight && set.reps) {
                            weeks[weekLabel].volume += set.weight * set.reps;
                        }
                    });
                });
            }
        });

        return Object.values(weeks);
    }, [history, getWeekNumber]);

    if (history.length < 2) {
        return (
            <div className="h-40 flex items-center justify-center text-muted text-sm italic border border-dashed border-slate-700 rounded-xl bg-slate-800/50">
                Trenger minst 2 økter for å vise graf
            </div>
        );
    }

    return (
        <div className="w-full h-64 bg-slate-900/50 rounded-xl border border-slate-700 p-4 space-y-4">
            <h3 className="text-xs font-bold text-muted uppercase tracking-wider">Økter siste 12 uker</h3>
            <ResponsiveContainer width="100%" height="85%">
                <ComposedChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis
                        dataKey="weekLabel"
                        stroke="#94a3b8"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                    />
                    <YAxis
                        yAxisId="left"
                        stroke="#94a3b8"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        label={{ value: 'Økter', angle: -90, position: 'insideLeft', style: { fill: '#94a3b8', fontSize: 10 } }}
                    />
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="#94a3b8"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${(value / 1000).toFixed(0)}t`}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                        itemStyle={{ color: '#f8fafc' }}
                        labelStyle={{ color: '#94a3b8', marginBottom: '0.5rem' }}
                        formatter={(value: number, name: string) => {
                            if (name === 'volume') return [`${(value / 1000).toFixed(1)} tonn`, 'Volum'];
                            return [value, 'Økter'];
                        }}
                    />
                    <Bar
                        yAxisId="left"
                        dataKey="workouts"
                        fill="#10b981"
                        radius={[4, 4, 0, 0]}
                    />
                    <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="volume"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        dot={{ fill: '#f59e0b', r: 3 }}
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};

export default HistoryOverviewChart;
