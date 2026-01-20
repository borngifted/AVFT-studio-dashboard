import React from 'react';
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Wrench } from 'lucide-react';
import { motion } from 'framer-motion';

const tools = [
  { id: 'capcut', label: 'CapCut', color: 'bg-black' },
  { id: 'premiere', label: 'Adobe Premiere', color: 'bg-purple-600' },
  { id: 'canva', label: 'Canva', color: 'bg-cyan-500' },
  { id: 'audacity', label: 'Audacity', color: 'bg-blue-600' },
  { id: 'obs', label: 'OBS', color: 'bg-slate-700' },
  { id: 'teams', label: 'Microsoft Teams', color: 'bg-indigo-600' },
  { id: 'gdrive', label: 'Google Drive', color: 'bg-amber-500' },
  { id: 'none', label: 'None / still learning', color: 'bg-slate-400' }
];

export default function SectionTools({ data, onChange }) {
  const selected = data.tools_familiar || [];

  const toggleTool = (toolId) => {
    let newSelected;
    if (toolId === 'none') {
      newSelected = selected.includes('none') ? [] : ['none'];
    } else {
      newSelected = selected.includes(toolId)
        ? selected.filter(id => id !== toolId)
        : [...selected.filter(id => id !== 'none'), toolId];
    }
    onChange('tools_familiar', newSelected);
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 mb-4">
          <Wrench className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-semibold text-slate-800">Tool Familiarity</h2>
        <p className="text-slate-500 mt-2">What software do you already know?</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <Label className="text-sm font-medium text-slate-700">
            Which tools are you already familiar with?
          </Label>
          <div className="grid grid-cols-2 gap-3">
            {tools.map((tool, index) => {
              const isSelected = selected.includes(tool.id);
              return (
                <motion.button
                  key={tool.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => toggleTool(tool.id)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-3 text-left
                    ${isSelected 
                      ? 'border-indigo-500 bg-indigo-50/50' 
                      : 'border-slate-200 hover:border-slate-300'}`}
                >
                  <div className={`w-8 h-8 rounded-lg ${tool.color} flex items-center justify-center flex-shrink-0`}>
                    <span className="text-white text-xs font-bold">{tool.label[0]}</span>
                  </div>
                  <span className={`text-sm font-medium ${isSelected ? 'text-indigo-700' : 'text-slate-700'}`}>
                    {tool.label}
                  </span>
                  <Checkbox checked={isSelected} className="ml-auto pointer-events-none" />
                </motion.button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2 pt-4 border-t border-slate-200">
          <Label className="text-sm font-medium text-slate-700">
            Which tool do you feel MOST confident using?
          </Label>
          <Input
            value={data.most_confident_tool || ''}
            onChange={(e) => onChange('most_confident_tool', e.target.value)}
            placeholder="e.g., CapCut, Canva, or 'None yet'"
            className="h-12"
          />
        </div>
      </div>
    </div>
  );
}