import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const sections = [
  { id: 'basics', label: 'Basics' },
  { id: 'production', label: 'Production' },
  { id: 'tech', label: 'Tech Access' },
  { id: 'laptop', label: 'Laptop' },
  { id: 'tools', label: 'Tools' },
  { id: 'learning', label: 'Learning' },
  { id: 'availability', label: 'Schedule' },
  { id: 'work', label: 'Work' },
  { id: 'contact', label: 'Contact' },
  { id: 'bonus', label: 'Bonus' }
];

export default function ProgressBar({ currentStep, completedSteps }) {
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between relative">
        {/* Progress line background */}
        <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-slate-200 -translate-y-1/2 z-0" />
        
        {/* Progress line filled */}
        <motion.div 
          className="absolute left-0 top-1/2 h-0.5 bg-gradient-to-r from-indigo-500 to-violet-500 -translate-y-1/2 z-0"
          initial={{ width: '0%' }}
          animate={{ width: `${(currentStep / (sections.length - 1)) * 100}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
        
        {sections.map((section, index) => {
          const isCompleted = completedSteps.includes(index);
          const isCurrent = currentStep === index;
          
          return (
            <div key={section.id} className="relative z-10 flex flex-col items-center">
              <motion.div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors duration-300
                  ${isCompleted ? 'bg-gradient-to-br from-indigo-500 to-violet-500 text-white' : 
                    isCurrent ? 'bg-white border-2 border-indigo-500 text-indigo-600' : 
                    'bg-white border-2 border-slate-200 text-slate-400'}`}
                initial={false}
                animate={{ scale: isCurrent ? 1.1 : 1 }}
                transition={{ duration: 0.2 }}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : index + 1}
              </motion.div>
              <span className={`absolute -bottom-6 text-[10px] font-medium whitespace-nowrap
                ${isCurrent ? 'text-indigo-600' : isCompleted ? 'text-slate-600' : 'text-slate-400'}`}>
                {section.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}