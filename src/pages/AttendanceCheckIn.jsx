import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function AttendanceCheckIn() {
  const [user, setUser] = useState(null);
  const [answer, setAnswer] = useState('');
  const [todayQuestion] = useState("What are you most excited to work on today?");

  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const today = format(new Date(), 'yyyy-MM-dd');

  const { data: todayCheckIn } = useQuery({
    queryKey: ['todayCheckIn', user?.email, today],
    queryFn: async () => {
      const records = await base44.entities.DailyAttendance.filter({
        student_email: user.email,
        check_in_date: today
      });
      return records[0];
    },
    enabled: !!user,
  });

  const checkInMutation = useMutation({
    mutationFn: (data) => base44.entities.DailyAttendance.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todayCheckIn'] });
      toast.success('Attendance recorded! ✅');
      setAnswer('');
    },
  });

  const handleCheckIn = () => {
    if (!answer.trim()) {
      toast.error('Please answer the question');
      return;
    }

    checkInMutation.mutate({
      student_name: user.full_name,
      student_email: user.email,
      check_in_date: today,
      check_in_time: new Date().toISOString(),
      daily_question: todayQuestion,
      student_answer: answer,
      status: 'present'
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-slate-600 mb-4">Please log in to check in</p>
            <Button onClick={() => base44.auth.redirectToLogin()}>Log In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">PRESENT</h1>
          <p className="text-slate-600">Daily Attendance Check-In</p>
        </div>

        {todayCheckIn ? (
          <Card className="bg-gradient-to-br from-green-400 to-green-500 text-white border-0 shadow-lg">
            <CardContent className="p-8 text-center">
              <CheckCircle2 className="w-16 h-16 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">You're All Set!</h2>
              <p className="text-green-100 mb-4">
                Checked in at {format(new Date(todayCheckIn.check_in_time), 'h:mm a')}
              </p>
              <div className="bg-white/20 rounded-lg p-4 text-left">
                <p className="text-sm text-green-100 mb-1">Your answer:</p>
                <p className="text-white">{todayCheckIn.student_answer}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-lg">
            <CardHeader className="text-center border-b">
              <CardTitle className="flex items-center justify-center gap-2">
                <Calendar className="w-6 h-6 text-indigo-600" />
                {format(new Date(), 'EEEE, MMMM d, yyyy')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="p-6 bg-indigo-50 rounded-lg border-2 border-indigo-200">
                <p className="text-lg font-medium text-slate-800 mb-4">{todayQuestion}</p>
                <Textarea
                  placeholder="Type your answer here..."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="h-32 text-base"
                />
              </div>

              <Button
                onClick={handleCheckIn}
                disabled={checkInMutation.isPending}
                className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-lg"
              >
                <CheckCircle2 className="w-5 h-5 mr-2" />
                {checkInMutation.isPending ? 'Checking In...' : 'Check In'}
              </Button>

              <p className="text-sm text-slate-500 text-center">
                Complete your daily check-in to mark your attendance
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}