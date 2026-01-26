import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Send, Calendar, Mail } from 'lucide-react';
import { toast } from 'sonner';

export default function DraftParentMessage() {
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [context, setContext] = useState('');
  const [tone, setTone] = useState('friendly');
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [generating, setGenerating] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');

  const queryClient = useQueryClient();

  const { data: students = [] } = useQuery({
    queryKey: ['studentPassData'],
    queryFn: () => base44.entities.StudentPassData.list(),
  });

  const { data: submissions = [] } = useQuery({
    queryKey: ['formSubmissions'],
    queryFn: () => base44.entities.FormSubmission.list(),
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ to, subject, body }) => {
      return await base44.integrations.Core.SendEmail({
        to,
        subject,
        body
      });
    },
    onSuccess: () => {
      toast.success('Message sent!');
      resetForm();
    },
  });

  const scheduleMessageMutation = useMutation({
    mutationFn: (data) => base44.entities.ScheduledMessage.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduledMessages'] });
      toast.success('Message scheduled!');
      resetForm();
    },
  });

  const handleGenerate = async () => {
    if (!studentName || !context) {
      toast.error('Please provide student name and context');
      return;
    }

    setGenerating(true);
    try {
      const response = await base44.functions.invoke('generateParentMessage', {
        studentName,
        studentEmail,
        tone,
        context
      });
      setGeneratedMessage(response.data.message);
    } catch (error) {
      toast.error('Failed to generate message');
    }
    setGenerating(false);
  };

  const handleSend = () => {
    if (!parentEmail || !subject || !generatedMessage) {
      toast.error('Please fill in all fields');
      return;
    }

    if (scheduleDate) {
      scheduleMessageMutation.mutate({
        student_name: studentName,
        parent_email: parentEmail,
        subject,
        message_content: generatedMessage,
        tone,
        scheduled_date: new Date(scheduleDate).toISOString()
      });
    } else {
      sendMessageMutation.mutate({
        to: parentEmail,
        subject,
        body: generatedMessage
      });
    }
  };

  const resetForm = () => {
    setStudentName('');
    setStudentEmail('');
    setParentEmail('');
    setSubject('');
    setContext('');
    setGeneratedMessage('');
    setScheduleDate('');
  };

  const handleStudentSelect = (email) => {
    const student = students.find(s => s.student_email === email);
    const submission = submissions.find(s => s.student_email === email);
    
    if (student) {
      setStudentName(student.student_name);
      setStudentEmail(email);
    }
    
    if (submission) {
      setParentEmail(submission.parent_email || '');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-indigo-600" />
          Draft Parent Message
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select onValueChange={handleStudentSelect}>
          <SelectTrigger>
            <SelectValue placeholder="Select student" />
          </SelectTrigger>
          <SelectContent>
            {students.map((student) => (
              <SelectItem key={student.id} value={student.student_email}>
                {student.student_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          placeholder="Parent email"
          type="email"
          value={parentEmail}
          onChange={(e) => setParentEmail(e.target.value)}
        />

        <Input
          placeholder="Message subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />

        <div className="flex gap-2">
          <Select value={tone} onValueChange={setTone}>
            <SelectTrigger className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="formal">Formal</SelectItem>
              <SelectItem value="friendly">Friendly</SelectItem>
              <SelectItem value="concerned">Concerned</SelectItem>
              <SelectItem value="encouraging">Encouraging</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Textarea
          placeholder="What would you like to communicate? (e.g., 'Student has been improving in class participation')"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          className="h-24"
        />

        <Button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full bg-indigo-600 hover:bg-indigo-700"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {generating ? 'Generating...' : 'Generate Message'}
        </Button>

        {generatedMessage && (
          <div className="space-y-3">
            <Textarea
              value={generatedMessage}
              onChange={(e) => setGeneratedMessage(e.target.value)}
              className="h-48"
            />

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-500" />
                <Input
                  type="datetime-local"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  placeholder="Schedule for later (optional)"
                />
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleSend} className="flex-1 bg-green-600 hover:bg-green-700">
                  <Send className="w-4 h-4 mr-2" />
                  {scheduleDate ? 'Schedule' : 'Send Now'}
                </Button>
                <Button onClick={resetForm} variant="outline" className="flex-1">
                  Clear
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}