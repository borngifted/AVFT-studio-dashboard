import React from 'react';
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, Clapperboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

export default function SectionAvailability({ data, onChange }) {
  const showDays = data.film_club_interest === 'Yes' || data.film_club_interest === 'Maybe';
  const selectedDays = data.available_days || [];

  const toggleDay = (day) => {
    const newDays = selectedDays.includes(day)
      ? selectedDays.filter(d => d !== day)
      : [...selectedDays, day];
    onChange('available_days', newDays);
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 mb-4">
          <Calendar className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-semibold text-slate-800">Availability & Commitments</h2>
        <p className="text-slate-500 mt-2">Help us plan after-school productions</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <Clapperboard className="w-4 h-4 text-violet-500" />
            Interested in Film Club or after-school productions?
          </Label>
          <RadioGroup
            value={data.film_club_interest || ''}
            onValueChange={(value) => onChange('film_club_interest', value)}
            className="grid grid-cols-3 gap-3"
          >
            {['Yes', 'Maybe', 'No'].map((option) => (
              <Label
                key={option}
                className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all
                  ${data.film_club_interest === option 
                    ? 'border-indigo-500 bg-indigo-50/50' 
                    : 'border-slate-200 hover:border-slate-300'}`}
              >
                <RadioGroupItem value={option} className="sr-only" />
                <span className={`font-medium ${data.film_club_interest === option ? 'text-indigo-700' : 'text-slate-700'}`}>
                  {option}
                </span>
              </Label>
            ))}
          </RadioGroup>
        </div>

        <AnimatePresence>
          {showDays && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <Label className="text-sm font-medium text-slate-700">
                  Which days can you usually stay after school?
                </Label>
                <div className="flex gap-2 justify-center">
                  {days.map((day, index) => {
                    const isSelected = selectedDays.includes(day);
                    return (
                      <motion.button
                        key={day}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => toggleDay(day)}
                        className={`w-14 h-14 rounded-xl border-2 font-medium transition-all duration-200
                          ${isSelected 
                            ? 'border-indigo-500 bg-indigo-500 text-white' 
                            : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                      >
                        {day}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}