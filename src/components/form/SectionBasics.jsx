import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, BookOpen } from 'lucide-react';

export default function SectionBasics({ data, onChange }) {
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 mb-4">
          <User className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-semibold text-slate-800">Student Basics</h2>
        <p className="text-slate-500 mt-2">Let's start with some basic information</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="student_name" className="text-sm font-medium text-slate-700">
            Full Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="student_name"
            value={data.student_name || ''}
            onChange={(e) => onChange('student_name', e.target.value)}
            placeholder="Enter your full name"
            className="h-12 text-base border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-500" />
            Block / Course Level <span className="text-red-500">*</span>
          </Label>
          <Select
            value={data.block_course || ''}
            onValueChange={(value) => onChange('block_course', value)}
          >
            <SelectTrigger className="h-12 text-base border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20">
              <SelectValue placeholder="Select your block or course level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Block 1">Block 1</SelectItem>
              <SelectItem value="Block 2">Block 2</SelectItem>
              <SelectItem value="Block 3">Block 3</SelectItem>
              <SelectItem value="Block 4">Block 4</SelectItem>
              <SelectItem value="Level I">Level I</SelectItem>
              <SelectItem value="Level II">Level II</SelectItem>
              <SelectItem value="Level III">Level III</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}