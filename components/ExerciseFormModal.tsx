import React, { useState } from 'react';
import { ExerciseDefinition, ExerciseType, MuscleGroup } from '../types';
import { X, Image as ImageIcon, Save } from 'lucide-react';

interface ExerciseFormModalProps {
  onSave: (exercise: ExerciseDefinition) => void;
  onClose: () => void;
}

const ExerciseFormModal: React.FC<ExerciseFormModalProps> = ({ onSave, onClose }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<ExerciseType>(ExerciseType.WEIGHTED);
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup>(MuscleGroup.FULL_BODY);
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const handleSubmit = () => {
    if (!name.trim()) return;

    const newExercise: ExerciseDefinition = {
      id: `custom_${crypto.randomUUID()}`,
      name,
      type,
      muscleGroup,
      description: description.trim() || undefined,
      imageUrl: imageUrl.trim() || undefined,
      isCustom: true,
    };

    onSave(newExercise);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4">
      <div 
        className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative bg-surface w-full max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-slate-700 animate-in slide-in-from-bottom duration-300 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-700 bg-slate-800">
          <h2 className="text-lg font-bold text-white">Ny Øvelse</h2>
          <button onClick={onClose} className="text-muted hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          
          {/* Name */}
          <div>
            <label className="block text-xs uppercase text-muted font-bold mb-2">Navn på øvelse *</label>
            <input 
              className="w-full bg-background border border-slate-700 rounded-lg p-3 text-white focus:border-primary outline-none"
              placeholder="F.eks. Motbakkeløp"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-xs uppercase text-muted font-bold mb-2">Type</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(ExerciseType).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`p-3 rounded-lg text-sm font-medium border transition-colors ${
                    type === t 
                    ? 'bg-primary/20 border-primary text-primary' 
                    : 'bg-background border-slate-700 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Muscle Group */}
          <div>
            <label className="block text-xs uppercase text-muted font-bold mb-2">Muskelgruppe</label>
            <select 
              value={muscleGroup}
              onChange={(e) => setMuscleGroup(e.target.value as MuscleGroup)}
              className="w-full bg-background border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-primary appearance-none"
            >
              {Object.values(MuscleGroup).map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs uppercase text-muted font-bold mb-2">Beskrivelse / Teknikk</label>
            <textarea 
              className="w-full bg-background border border-slate-700 rounded-lg p-3 text-white focus:border-primary outline-none min-h-[80px]"
              placeholder="Kort beskrivelse av hvordan øvelsen utføres..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-xs uppercase text-muted font-bold mb-2">Bilde URL (Valgfritt)</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                 <ImageIcon size={16} className="absolute left-3 top-3.5 text-muted" />
                 <input 
                  className="w-full bg-background border border-slate-700 rounded-lg p-3 pl-10 text-white focus:border-primary outline-none text-sm font-mono"
                  placeholder="https://..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>
            </div>
            {imageUrl && (
              <div className="mt-2 rounded-lg overflow-hidden h-32 border border-slate-700 bg-black/20 flex items-center justify-center">
                <img src={imageUrl} alt="Preview" className="h-full w-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
              </div>
            )}
            <p className="text-[10px] text-muted mt-1">Lim inn en lenke til et bilde eller en GIF.</p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 bg-slate-800">
          <button 
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="w-full bg-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 text-white font-bold py-3 rounded-xl flex items-center justify-center transition-all shadow-lg"
          >
            <Save size={18} className="mr-2" />
            Lagre Øvelse
          </button>
        </div>

      </div>
    </div>
  );
};

export default ExerciseFormModal;