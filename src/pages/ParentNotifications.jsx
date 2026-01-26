import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Mail, MessageSquare, AlertTriangle, TrendingDown, Newspaper } from 'lucide-react';
import { toast } from 'sonner';

export default function ParentNotifications() {
  const [studentEmail, setStudentEmail] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [preferences, setPreferences] = useState({
    notify_on_absence: true,
    notify_on_referral: true,
    notify_on_failing: true,
    notify_on_updates: false,
    preferred_contact_method: 'email'
  });

  const queryClient = useQueryClient();

  const { data: students = [] } = useQuery({
    queryKey: ['studentPassData'],
    queryFn: () => base44.entities.StudentPassData.list(),
  });

  const { data: submissions = [] } = useQuery({
    queryKey: ['formSubmissions'],
    queryFn: () => base44.entities.FormSubmission.list(),
  });

  const { data: existingPreference } = useQuery({
    queryKey: ['parentPreference', studentEmail],
    queryFn: async () => {
      const prefs = await base44.entities.ParentContactPreference.filter({ student_email: studentEmail });
      return prefs[0];
    },
    enabled: !!studentEmail,
  });

  useEffect(() => {
    if (existingPreference) {
      setParentEmail(existingPreference.parent_email);
      setParentPhone(existingPreference.parent_phone || '');
      setPreferences({
        notify_on_absence: existingPreference.notify_on_absence,
        notify_on_referral: existingPreference.notify_on_referral,
        notify_on_failing: existingPreference.notify_on_failing,
        notify_on_updates: existingPreference.notify_on_updates,
        preferred_contact_method: existingPreference.preferred_contact_method
      });
    }
  }, [existingPreference]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (existingPreference) {
        return await base44.entities.ParentContactPreference.update(existingPreference.id, data);
      } else {
        return await base44.entities.ParentContactPreference.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parentPreference'] });
      toast.success('Notification preferences saved!');
    },
  });

  const handleStudentSelect = (email) => {
    setStudentEmail(email);
    const submission = submissions.find(s => s.student_email === email);
    if (submission && !existingPreference) {
      setParentEmail(submission.parent_email || '');
    }
  };

  const handleSave = () => {
    if (!studentEmail || !parentEmail) {
      toast.error('Please select student and provide parent email');
      return;
    }

    const student = students.find(s => s.student_email === studentEmail);

    saveMutation.mutate({
      student_name: student?.student_name || '',
      student_email: studentEmail,
      parent_email: parentEmail,
      parent_phone: parentPhone,
      ...preferences
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Parent Contact Automation</h1>
          <p className="text-slate-600">Set up "Notify me when..." preferences</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-600" />
              Notification Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Student Selection */}
            <div className="space-y-2">
              <Label>Select Student</Label>
              <Select value={studentEmail} onValueChange={handleStudentSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.student_email}>
                      {student.student_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Parent Email</Label>
                <Input
                  type="email"
                  placeholder="parent@email.com"
                  value={parentEmail}
                  onChange={(e) => setParentEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Parent Phone (Optional)</Label>
                <Input
                  type="tel"
                  placeholder="555-123-4567"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                />
              </div>
            </div>

            {/* Notification Triggers */}
            <div className="space-y-4">
              <Label className="text-base">Notify me when...</Label>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="font-medium text-slate-800">Student is Absent</p>
                      <p className="text-xs text-slate-500">Get notified of any absences</p>
                    </div>
                  </div>
                  <Switch
                    checked={preferences.notify_on_absence}
                    onCheckedChange={(checked) => setPreferences({ ...preferences, notify_on_absence: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="font-medium text-slate-800">Student Receives Referral</p>
                      <p className="text-xs text-slate-500">Disciplinary action notifications</p>
                    </div>
                  </div>
                  <Switch
                    checked={preferences.notify_on_referral}
                    onCheckedChange={(checked) => setPreferences({ ...preferences, notify_on_referral: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <TrendingDown className="w-5 h-5 text-yellow-600" />
                    <div>
                      <p className="font-medium text-slate-800">Student is Failing</p>
                      <p className="text-xs text-slate-500">Grade alerts and academic concerns</p>
                    </div>
                  </div>
                  <Switch
                    checked={preferences.notify_on_failing}
                    onCheckedChange={(checked) => setPreferences({ ...preferences, notify_on_failing: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Newspaper className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-slate-800">General Updates</p>
                      <p className="text-xs text-slate-500">Class news and announcements</p>
                    </div>
                  </div>
                  <Switch
                    checked={preferences.notify_on_updates}
                    onCheckedChange={(checked) => setPreferences({ ...preferences, notify_on_updates: checked })}
                  />
                </div>
              </div>
            </div>

            {/* Contact Method */}
            <div className="space-y-2">
              <Label>Preferred Contact Method</Label>
              <Select
                value={preferences.preferred_contact_method}
                onValueChange={(value) => setPreferences({ ...preferences, preferred_contact_method: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email Only
                    </div>
                  </SelectItem>
                  <SelectItem value="sms">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      SMS Only
                    </div>
                  </SelectItem>
                  <SelectItem value="both">Both Email & SMS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleSave}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
              disabled={!studentEmail || !parentEmail}
            >
              Save Preferences
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}