import React from 'react';
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Smartphone, HardDrive, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SectionTech({ data, onChange }) {
  const showFollowUp = data.phone_access && data.phone_access !== 'no_access';

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 mb-4">
          <Smartphone className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-semibold text-slate-800">Tech & Recording Access</h2>
        <p className="text-slate-500 mt-2">Help us plan equipment and workflows</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <Label className="text-sm font-medium text-slate-700">
            Do you have reliable access to a phone for recording?
          </Label>
          <RadioGroup
            value={data.phone_access || ''}
            onValueChange={(value) => onChange('phone_access', value)}
            className="grid gap-2"
          >
            {[
              { value: 'yes_consistent', label: 'Yes, consistently' },
              { value: 'yes_limited', label: 'Yes, but limited (storage/performance)' },
              { value: 'sometimes', label: 'Sometimes / shared' },
              { value: 'no_access', label: 'No access' }
            ].map((option) => (
              <Label
                key={option.value}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all
                  ${data.phone_access === option.value 
                    ? 'border-indigo-500 bg-indigo-50/50' 
                    : 'border-slate-200 hover:border-slate-300'}`}
              >
                <RadioGroupItem value={option.value} />
                <span className="text-slate-700">{option.label}</span>
              </Label>
            ))}
          </RadioGroup>
        </div>

        <AnimatePresence>
          {showFollowUp && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-6 overflow-hidden"
            >
              <div className="pt-4 border-t border-slate-200 space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-cyan-500" />
                    What type of phone do you use?
                  </Label>
                  <Select
                    value={data.phone_type || ''}
                    onValueChange={(value) => onChange('phone_type', value)}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select phone type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="iPhone">iPhone</SelectItem>
                      <SelectItem value="Android">Android</SelectItem>
                      <SelectItem value="Other">Other / Not sure</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-cyan-500" />
                    How much free storage do you have?
                  </Label>
                  <Select
                    value={data.phone_storage || ''}
                    onValueChange={(value) => onChange('phone_storage', value)}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select storage amount" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="20+ GB">20+ GB</SelectItem>
                      <SelectItem value="10-19 GB">10–19 GB</SelectItem>
                      <SelectItem value="5-9 GB">5–9 GB</SelectItem>
                      <SelectItem value="Less than 5 GB">Less than 5 GB</SelectItem>
                      <SelectItem value="Not sure">Not sure</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-cyan-500" />
                    Any parent/guardian restrictions on recording or apps?
                  </Label>
                  <Select
                    value={data.parent_restrictions || ''}
                    onValueChange={(value) => onChange('parent_restrictions', value)}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="No">No</SelectItem>
                      <SelectItem value="Some">Some</SelectItem>
                      <SelectItem value="Yes">Yes</SelectItem>
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