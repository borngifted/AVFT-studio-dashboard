import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, AlertCircle } from 'lucide-react';

export default function SectionContact({ data, onChange }) {
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const email = data.parent_email || '';
  const showError = email && !isValidEmail(email);

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 mb-4">
          <Mail className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-semibold text-slate-800">Parent Contact</h2>
        <p className="text-slate-500 mt-2">Required for events, releases, and communication</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="parent_email" className="text-sm font-medium text-slate-700">
            Parent / Guardian Email Address <span className="text-red-500">*</span>
          </Label>
          <Input
            id="parent_email"
            type="email"
            value={email}
            onChange={(e) => onChange('parent_email', e.target.value)}
            placeholder="parent@email.com"
            className={`h-12 text-base ${showError ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
          />
          {showError && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              Please enter a valid email address
            </p>
          )}
        </div>

        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Why we need this:</strong> Your parent/guardian may receive information about 
            production events, permission forms, and class updates throughout the semester.
          </p>
        </div>
      </div>
    </div>
  );
}