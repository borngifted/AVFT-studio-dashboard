import React from 'react';
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Video, Film, Headphones, Megaphone, PenTool, Share2, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const tracks = [
  { id: 'camera', label: 'Camera / Cinematography', icon: Video, color: 'from-blue-500 to-cyan-500' },
  { id: 'editing', label: 'Editing / Post-Production', icon: Film, color: 'from-purple-500 to-pink-500' },
  { id: 'audio', label: 'Audio / Podcasting', icon: Headphones, color: 'from-green-500 to-emerald-500' },
  { id: 'directing', label: 'Directing / Producing', icon: Megaphone, color: 'from-orange-500 to-amber-500' },
  { id: 'writing', label: 'Writing / Story Development', icon: PenTool, color: 'from-indigo-500 to-violet-500' },
  { id: 'social', label: 'Social Media / Marketing', icon: Share2, color: 'from-pink-500 to-rose-500' },
  { id: 'unsure', label: 'Unsure / Exploration', icon: HelpCircle, color: 'from-slate-400 to-slate-500' }
];

export default function SectionProduction({ data, onChange }) {
  const selected = data.track_interests || [];

  const toggleTrack = (trackId) => {
    let newSelected;
    if (selected.includes(trackId)) {
      newSelected = selected.filter(id => id !== trackId);
    } else if (selected.length < 2) {
      newSelected = [...selected, trackId];
    } else {
      return;
    }
    onChange('track_interests', newSelected);
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 mb-4">
          <Film className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-semibold text-slate-800">Production Track Interest</h2>
        <p className="text-slate-500 mt-2">Select up to 2 tracks you're most interested in</p>
      </div>

      <div className="grid gap-3">
        {tracks.map((track, index) => {
          const Icon = track.icon;
          const isSelected = selected.includes(track.id);
          const isDisabled = selected.length >= 2 && !isSelected;

          return (
            <motion.button
              key={track.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => toggleTrack(track.id)}
              disabled={isDisabled}
              className={`w-full p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 text-left
                ${isSelected 
                  ? 'border-indigo-500 bg-indigo-50/50 shadow-sm' 
                  : isDisabled 
                    ? 'border-slate-100 bg-slate-50/50 opacity-50 cursor-not-allowed' 
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'}`}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${track.color} flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <span className={`font-medium ${isSelected ? 'text-indigo-700' : 'text-slate-700'}`}>
                {track.label}
              </span>
              <div className="ml-auto">
                <Checkbox checked={isSelected} className="pointer-events-none" />
              </div>
            </motion.button>
          );
        })}
      </div>

      <p className="text-center text-sm text-slate-400">
        {selected.length}/2 selected
      </p>
    </div>
  );
}