import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { WorkoutSession, ExerciseDefinition, MuscleGroup } from '../types';

interface ExerciseDistributionChartProps {
    history: WorkoutSession[];
    exercises: ExerciseDefinition[];
}

const ExerciseDistributionChart: React.FC<ExerciseDistributionChartProps> = ({ history, exercises }) => {
    // Color mapping for muscle groups
    const muscleGroupColors: Record<MuscleGroup, string> = {
        [MuscleGroup.CHEST]: '#ef4444',
        [MuscleGroup.BACK]: '#3b82f6',
        [MuscleGroup.SHOULDERS]: '#f59e0b',
        [MuscleGroup.LEGS]: '#10b981',
        [MuscleGroup.ARMS]: '#8b5cf6',
        [MuscleGroup.CORE]: '#ec4899',
        [MuscleGroup.CARDIO]: '#06b6d4',
        [MuscleGroup.FULL_BODY]: '#6366f1'
    };

    const chartData = useMemo(() => {
        // Count exercises by muscle group
        const muscleGroupCount: Record<string, number> = {};

        history.forEach(session => {
            if (session.status === 'Fullført') {
                session.exercises.forEach(exercise => {
                    const def = exercises.find(e => e.id === exercise.exerciseDefinitionId);
                    if (def) {
                        // Count primary muscle group
                        muscleGroupCount[def.muscleGroup] = (muscleGroupCount[def.muscleGroup] || 0) + 1;

                        // Count secondary muscle groups (with half weight)
                        if (def.secondaryMuscleGroups) {
                            def.secondaryMuscleGroups.forEach(secondaryMuscle => {
                                muscleGroupCount[secondaryMuscle] = (muscleGroupCount[secondaryMuscle] || 0) + 0.5;
                            });
                        }
                    }
                });
            }
        });

        // Convert to array and sort by count
        return Object.entries(muscleGroupCount)
            .map(([muscleGroup, count]) => ({
                name: muscleGroup,
                value: Math.round(count),
                percentage: 0 // Will be calculated below
            }))
            .sort((a, b) => b.value - a.value)
            .filter(item => item.value > 0)
            .map(item => {
                const total = Object.values(muscleGroupCount).reduce((sum, val) => sum + val, 0);
                return {
                    ...item,
                    percentage: Math.round((item.value / total) * 100)
                };
            });
    }, [history, exercises]);

    if (chartData.length === 0) {
        return (
            <div className="h-40 flex items-center justify-center text-muted text-sm italic border border-dashed border-slate-700 rounded-xl bg-slate-800/50">
                Ingen data å vise ennå
            </div>
        );
    }

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0];
            return (
                <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 shadow-xl">
                    <p className="text-white font-semibold">{data.name}</p>
                    <p className="text-slate-300 text-sm">
                        {data.value} øvelser ({data.payload.percentage}%)
                    </p>
                </div>
            );
        }
        return null;
    };

    const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }: any) => {
        if (percentage < 5) return null; // Don't show label for small slices
        
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text 
                x={x} 
                y={y} 
                fill="white" 
                textAnchor={x > cx ? 'start' : 'end'} 
                dominantBaseline="central"
                fontSize="12"
                fontWeight="600"
            >
                {`${percentage}%`}
            </text>
        );
    };

    return (
        <div className="w-full bg-slate-900/50 rounded-xl border border-slate-700 p-4 space-y-4">
            <h3 className="text-xs font-bold text-muted uppercase tracking-wider">
                Fordeling av øvelser per muskelgruppe
            </h3>
            <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={renderCustomLabel}
                            outerRadius={90}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {chartData.map((entry, index) => (
                                <Cell 
                                    key={`cell-${index}`} 
                                    fill={muscleGroupColors[entry.name as MuscleGroup] || '#64748b'} 
                                />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend 
                            verticalAlign="bottom" 
                            height={36}
                            iconType="circle"
                            formatter={(value: string, entry: any) => (
                                <span className="text-xs text-slate-300">
                                    {value} ({entry.payload.value})
                                </span>
                            )}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-white">
                        {chartData.length}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">Muskelgrupper</div>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-white">
                        {chartData.reduce((sum, item) => sum + item.value, 0)}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">Totalt øvelser</div>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-white">
                        {chartData[0]?.name || '-'}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">Mest trent</div>
                </div>
            </div>
        </div>
    );
};

export default ExerciseDistributionChart;
