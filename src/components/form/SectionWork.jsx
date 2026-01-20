import React from 'react';
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SectionWork({ data, onChange }) {
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-600 to-slate-800 mb-4">
          <Briefcase className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-semibold text-slate-800">Work Commitments</h2>
        <p className="text-slate-500 mt-2">Help me understand your schedule</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <Label className="text-sm font-medium text-slate-700">
            Do you currently have a job?
          </Label>
          <RadioGroup
            value={data.has_job === true ? 'yes' : data.has_job === false ? 'no' : ''}
            onValueChange={(value) => onChange('has_job', value === 'yes')}
            className="grid grid-cols-2 gap-3"
          >
            {[
              { value: 'yes', label: 'Yes' },
              { value: 'no', label: 'No' }
            ].map((option) => (
              <Label
                key={option.value}
                className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all
                  ${(data.has_job === true && option.value === 'yes') || (data.has_job === false && option.value === 'no')
                    ? 'border-indigo-500 bg-indigo-50/50' 
                    : 'border-slate-200 hover:border-slate-300'}`}
              >
                <RadioGroupItem value={option.value} className="sr-only" />
                <span className={`font-medium 
                  ${(data.has_job === true && option.value === 'yes') || (data.has_job === false && option.value === 'no')
                    ? 'text-indigo-700' : 'text-slate-700'}`}>
                  {option.label}
                </span>
              </Label>
            ))}
          </RadioGroup>
        </div>

        <AnimatePresence>
          {data.has_job === true && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <Label className="text-sm font-medium text-slate-700">
                  Does your job ever make balancing school difficult?
                </Label>
                <RadioGroup
                  value={data.job_balance_difficulty || ''}
                  onValueChange={(value) => onChange('job_balance_difficulty', value)}
                  className="grid gap-2"
                >
                  {[
                    { value: 'No', label: 'No, I manage it well', emoji: '✅' },
                    { value: 'Sometimes', label: "Sometimes it's challenging", emoji: '⚖️' },
                    { value: 'Often', label: 'Often difficult to balance', emoji: '😓' }
                  ].map((option) => (
                    <Label
                      key={option.value}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all
                        ${data.job_balance_difficulty === option.value 
                          ? 'border-indigo-500 bg-indigo-50/50' 
                          : 'border-slate-200 hover:border-slate-300'}`}
                    >
                      <RadioGroupItem value={option.value} />
                      <span className="text-lg">{option.emoji}</span>
                      <span className="text-slate-700">{option.label}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}