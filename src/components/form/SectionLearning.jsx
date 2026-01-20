import React from 'react';
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Brain, MessageCircle, Eye, Hand, ListOrdered, Users, User } from 'lucide-react';
import { motion } from 'framer-motion';

const learningStyles = [
  { id: 'watching', label: 'Watching examples', icon: Eye },
  { id: 'hands_on', label: 'Hands-on practice', icon: Hand },
  { id: 'step_by_step', label: 'Step-by-step instructions', icon: ListOrdered },
  { id: 'group_work', label: 'Group work', icon: Users },
  { id: 'independent', label: 'Independent work', icon: User }
];

const feedbackStyles = [
  { value: 'one_on_one', label: 'One-on-one, in private' },
  { value: 'quiet_checkin', label: 'Quiet check-in' },
  { value: 'teams_email', label: 'Teams/email message' },
  { value: 'direct_candid', label: 'Direct & candid (respectful)' },
  { value: 'no_preference', label: 'No preference' }
];

export default function SectionLearning({ data, onChange }) {
  const selected = data.learning_preferences || [];

  const toggleStyle = (styleId) => {
    let newSelected;
    if (selected.includes(styleId)) {
      newSelected = selected.filter(id => id !== styleId);
    } else if (selected.length < 2) {
      newSelected = [...selected, styleId];
    } else {
      return;
    }
    onChange('learning_preferences', newSelected);
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 mb-4">
          <Brain className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-semibold text-slate-800">Learning & Support</h2>
        <p className="text-slate-500 mt-2">Help me teach you better</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <Label className="text-sm font-medium text-slate-700">
            How do you learn best? (Select up to 2)
          </Label>
          <div className="grid gap-2">
            {learningStyles.map((style, index) => {
              const Icon = style.icon;
              const isSelected = selected.includes(style.id);
              const isDisabled = selected.length >= 2 && !isSelected;

              return (
                <motion.button
                  key={style.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => toggleStyle(style.id)}
                  disabled={isDisabled}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 text-left
                    ${isSelected 
                      ? 'border-indigo-500 bg-indigo-50/50' 
                      : isDisabled 
                        ? 'border-slate-100 bg-slate-50/50 opacity-50 cursor-not-allowed' 
                        : 'border-slate-200 hover:border-slate-300'}`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center
                    ${isSelected ? 'bg-indigo-100' : 'bg-slate-100'}`}>
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-indigo-600' : 'text-slate-500'}`} />
                  </div>
                  <span className={`font-medium ${isSelected ? 'text-indigo-700' : 'text-slate-700'}`}>
                    {style.label}
                  </span>
                  <Checkbox checked={isSelected} className="ml-auto pointer-events-none" />
                </motion.button>
              );
            })}
          </div>
          <p className="text-center text-sm text-slate-400">{selected.length}/2 selected</p>
        </div>

        <div className="space-y-3 pt-4 border-t border-slate-200">
          <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-rose-500" />
            When there's a concern about your work or behavior, how should I address it?
          </Label>
          <RadioGroup
            value={data.feedback_preference || ''}
            onValueChange={(value) => onChange('feedback_preference', value)}
            className="grid gap-2"
          >
            {feedbackStyles.map((option) => (
              <Label
                key={option.value}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all
                  ${data.feedback_preference === option.value 
                    ? 'border-indigo-500 bg-indigo-50/50' 
                    : 'border-slate-200 hover:border-slate-300'}`}
              >
                <RadioGroupItem value={option.value} />
                <span className="text-slate-700">{option.label}</span>
              </Label>
            ))}
          </RadioGroup>
        </div>
      </div>
    </div>
  );
}