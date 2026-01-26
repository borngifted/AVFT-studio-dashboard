import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { GraduationCap, User } from 'lucide-react';
import { toast } from 'sonner';

export default function TeacherCodePrompt({ onComplete }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTeacherCode = async () => {
    setLoading(true);
    try {
      await base44.functions.invoke('verifyTeacherCode', { code });
      toast.success('Teacher access granted!');
      onComplete(true);
    } catch (error) {
      toast.error('Invalid teacher code');
      setLoading(false);
    }
  };

  const handleSkip = () => {
    onComplete(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to Teacher's Pet</CardTitle>
          <CardDescription>Are you a teacher or a student?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
              <div className="flex items-center gap-3 mb-3">
                <GraduationCap className="w-5 h-5 text-indigo-600" />
                <span className="font-medium text-slate-800">I'm a Teacher</span>
              </div>
              <p className="text-sm text-slate-600 mb-3">
                Enter the teacher code to access the full dashboard
              </p>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Enter teacher code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleTeacherCode()}
                />
                <Button
                  onClick={handleTeacherCode}
                  disabled={!code || loading}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  Submit
                </Button>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center gap-3 mb-2">
                <User className="w-5 h-5 text-slate-600" />
                <span className="font-medium text-slate-800">I'm a Student</span>
              </div>
              <p className="text-sm text-slate-600 mb-3">
                Continue to your student pass dashboard
              </p>
              <Button
                onClick={handleSkip}
                variant="outline"
                className="w-full"
              >
                Continue as Student
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}