import React from 'react';
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Laptop, Wrench } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SectionLaptop({ data, onChange }) {
  const needsSupport = data.laptop_condition === 'frequently_freezes' || data.laptop_condition === 'barely_works';

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 mb-4">
          <Laptop className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-semibold text-slate-800">School Laptop Readiness</h2>
        <p className="text-slate-500 mt-2">Help us identify tech support needs early</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <Label className="text-sm font-medium text-slate-700">
            How does your school-issued laptop currently run?
          </Label>
          <RadioGroup
            value={data.laptop_condition || ''}
            onValueChange={(value) => onChange('laptop_condition', value)}
            className="grid gap-2"
          >
            {[
              { value: 'runs_smoothly', label: 'Runs smoothly', emoji: '✨' },
              { value: 'occasional_issues', label: 'Occasional issues', emoji: '😐' },
              { value: 'slow_usable', label: 'Slow but usable', emoji: '🐢' },
              { value: 'frequently_freezes', label: 'Frequently freezes', emoji: '❄️' },
              { value: 'barely_works', label: 'Barely works / needs support', emoji: '🆘' }
            ].map((option) => (
              <Label
                key={option.value}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all
                  ${data.laptop_condition === option.value 
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

        <AnimatePresence>
          {needsSupport && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-4 border-t border-slate-200">
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 mb-4">
                  <p className="text-sm text-amber-800">
                    ⚠️ We'll help connect you with tech support to resolve this!
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-emerald-500" />
                    Have you received Media Center / tech support before?
                  </Label>
                  <Select
                    value={data.tech_support_received || ''}
                    onValueChange={(value) => onChange('tech_support_received', value)}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                      <SelectItem value="Not sure">Not sure</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}