import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Download, Calendar, CheckCircle2, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function AttendanceAdmin() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const { data: attendance = [] } = useQuery({
    queryKey: ['attendance', selectedDate],
    queryFn: () => base44.entities.DailyAttendance.filter({ check_in_date: selectedDate }),
  });

  const { data: students = [] } = useQuery({
    queryKey: ['studentPassData'],
    queryFn: () => base44.entities.StudentPassData.list(),
  });

  const exportToExcel = () => {
    const headers = ['Student Name', 'Student Email', 'Status', 'Check-In Time', 'Daily Question', 'Answer'];
    
    // Get all students for the roster
    const roster = students.map(student => {
      const record = attendance.find(a => a.student_email === student.student_email);
      return {
        name: student.student_name,
        email: student.student_email,
        status: record ? record.status : 'absent',
        time: record ? format(new Date(record.check_in_time), 'h:mm a') : 'N/A',
        question: record ? record.daily_question : 'N/A',
        answer: record ? record.student_answer : 'N/A'
      };
    });

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...roster.map(r => 
        [r.name, r.email, r.status, r.time, `"${r.question}"`, `"${r.answer}"`].join(',')
      )
    ].join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${selectedDate}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
    
    toast.success('Attendance exported!');
  };

  const presentCount = attendance.filter(a => a.status === 'present').length;
  const lateCount = attendance.filter(a => a.status === 'late').length;
  const absentCount = students.length - attendance.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">PRESENT - Attendance Admin</h1>
          <p className="text-slate-600">View and export daily attendance records</p>
        </div>

        {/* Stats & Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-green-400 to-green-500 text-white border-0">
            <CardContent className="p-4 text-center">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2" />
              <p className="text-3xl font-bold">{presentCount}</p>
              <p className="text-sm text-green-100">Present</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-400 to-yellow-500 text-white border-0">
            <CardContent className="p-4 text-center">
              <Calendar className="w-8 h-8 mx-auto mb-2" />
              <p className="text-3xl font-bold">{lateCount}</p>
              <p className="text-sm text-yellow-100">Late</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-400 to-red-500 text-white border-0">
            <CardContent className="p-4 text-center">
              <XCircle className="w-8 h-8 mx-auto mb-2" />
              <p className="text-3xl font-bold">{absentCount}</p>
              <p className="text-sm text-red-100">Absent</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-400 to-indigo-500 text-white border-0">
            <CardContent className="p-4 text-center">
              <p className="text-xs text-indigo-100 mb-2">Total Students</p>
              <p className="text-3xl font-bold">{students.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Date Selection & Export */}
        <Card className="mb-6">
          <CardContent className="p-4 flex items-center gap-4">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="max-w-xs"
            />
            <Button onClick={exportToExcel} className="bg-green-600 hover:bg-green-700">
              <Download className="w-4 h-4 mr-2" />
              Export to Excel
            </Button>
          </CardContent>
        </Card>

        {/* Attendance List */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance Records - {format(new Date(selectedDate), 'MMMM d, yyyy')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {students.map((student) => {
              const record = attendance.find(a => a.student_email === student.student_email);
              const status = record ? record.status : 'absent';

              return (
                <div
                  key={student.id}
                  className={`p-4 rounded-lg border ${
                    status === 'present'
                      ? 'bg-green-50 border-green-200'
                      : status === 'late'
                      ? 'bg-yellow-50 border-yellow-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-slate-800">{student.student_name}</p>
                        <Badge
                          className={
                            status === 'present'
                              ? 'bg-green-600'
                              : status === 'late'
                              ? 'bg-yellow-600'
                              : 'bg-red-600'
                          }
                        >
                          {status.toUpperCase()}
                        </Badge>
                      </div>
                      {record && (
                        <div className="text-sm text-slate-600 space-y-1">
                          <p>Check-in: {format(new Date(record.check_in_time), 'h:mm a')}</p>
                          {record.student_answer && (
                            <div className="mt-2 p-2 bg-white rounded border border-slate-200">
                              <p className="text-xs text-slate-500 mb-1">"{record.daily_question}"</p>
                              <p className="text-sm text-slate-700">{record.student_answer}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}