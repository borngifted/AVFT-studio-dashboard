import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users, Clock, AlertTriangle, CheckCircle, TrendingUp,
  DoorOpen, Calendar, Award, Download, Search, X, StickyNote
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import ReturnCodeDisplay from '@/components/pass/ReturnCodeDisplay';
import ShareFormButton from '@/components/ShareFormButton';
import { toast } from 'sonner';

export default function PassDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSession, setSelectedSession] = useState(null);
  const [teacherNotes, setTeacherNotes] = useState('');

  const queryClient = useQueryClient();

  // Get active passes
  const { data: activePasses = [] } = useQuery({
    queryKey: ['activePasses'],
    queryFn: () => base44.entities.PassSession.filter({ status: 'OPEN' }, '-created_date'),
    refetchInterval: 3000 // Auto-refresh every 3 seconds
  });

  // Get all students
  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: () => base44.entities.StudentPassData.list('-student_name')
  });

  // Get recent pass history
  const { data: recentPasses = [] } = useQuery({
    queryKey: ['recentPasses'],
    queryFn: () => base44.entities.PassSession.list('-created_date', 50)
  });

  // Get PBIS transactions
  const { data: pbisTransactions = [] } = useQuery({
    queryKey: ['pbisTransactions'],
    queryFn: () => base44.entities.PBISTransaction.list('-created_date', 100)
  });

  // Add teacher note mutation
  const addNote = useMutation({
    mutationFn: ({ sessionId, notes }) => 
      base44.entities.PassSession.update(sessionId, { teacher_notes: notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recentPasses'] });
      setSelectedSession(null);
      setTeacherNotes('');
      toast.success('Note added');
    }
  });

  // Monthly reset mutation
  const performMonthlyReset = useMutation({
    mutationFn: async () => {
      const updates = [];
      
      for (const student of students) {
        const unused = (student.monthly_pass_allowance) - student.passes_used_this_month;
        const pbisPoints = unused > 0 ? unused * 5 : 0;
        
        // Update student data
        updates.push(
          base44.entities.StudentPassData.update(student.id, {
            passes_used_this_month: 0,
            purchased_passes_this_month: 0,
            unused_passes_last_month: unused,
            pbis_points_balance: student.pbis_points_balance + pbisPoints,
            last_reset_date: new Date().toISOString().split('T')[0]
          })
        );
        
        // Create PBIS transaction
        if (pbisPoints > 0) {
          updates.push(
            base44.entities.PBISTransaction.create({
              student_name: student.student_name,
              student_email: student.student_email,
              points_delta: pbisPoints,
              reason: 'unused_pass_trade_in',
              description: `${unused} unused passes x 5 points`
            })
          );
        }
      }
      
      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success('Monthly reset completed!');
    }
  });

  // Calculate stats
  const totalPassesUsed = recentPasses.filter(p => 
    new Date(p.created_date) >= startOfMonth(new Date())
  ).length;
  
  const overtimePasses = recentPasses.filter(p => p.overtime).length;
  const unconfirmedReturns = recentPasses.filter(p => p.status === 'RETURN_UNCONFIRMED').length;

  const currentMonth = format(new Date(), 'MMMM yyyy');

  // Filter students
  const filteredStudents = students.filter(s =>
    s.student_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Export CSV
  const exportPassData = () => {
    const headers = ['Date', 'Student', 'Destination', 'Start Time', 'End Time', 'Duration (min)', 'Status', 'Overtime', 'Return Verified', 'Notes'];
    const rows = recentPasses.map(p => [
      format(new Date(p.created_date), 'yyyy-MM-dd'),
      p.student_name,
      p.destination,
      format(new Date(p.start_time), 'HH:mm:ss'),
      p.end_time ? format(new Date(p.end_time), 'HH:mm:ss') : 'N/A',
      p.duration_minutes || 'N/A',
      p.status,
      p.overtime ? 'Yes' : 'No',
      p.return_code_validated ? 'Yes' : 'No',
      p.teacher_notes || ''
    ]);
    
    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pass-data-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const getElapsedTime = (startTime) => {
    const now = new Date();
    const start = new Date(startTime);
    const elapsedSeconds = Math.floor((now - start) / 1000);
    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = elapsedSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-7xl mx-auto py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Pass Management Dashboard</h1>
            <p className="text-slate-500">AVTF Digital Pass System</p>
          </div>
          <div className="flex gap-3">
            <ShareFormButton />
            <Button onClick={exportPassData} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button 
              onClick={() => performMonthlyReset.mutate()}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Monthly Reset
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-100">
                  <DoorOpen className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{activePasses.length}</p>
                  <p className="text-xs text-slate-500">Active Now</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{totalPassesUsed}</p>
                  <p className="text-xs text-slate-500">This Month</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{overtimePasses}</p>
                  <p className="text-xs text-slate-500">Overtime</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-100">
                  <X className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{unconfirmedReturns}</p>
                  <p className="text-xs text-slate-500">Unconfirmed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Left Column - Return Code & Active Passes */}
          <div className="md:col-span-2 space-y-6">
            {/* Return Code */}
            <ReturnCodeDisplay />

            {/* Active Passes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-600" />
                  Active Passes ({activePasses.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activePasses.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <CheckCircle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p>No active passes</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activePasses.map((pass) => {
                      const elapsed = Math.floor((new Date() - new Date(pass.start_time)) / 1000);
                      const isWarning = elapsed >= 480;
                      const isOvertime = elapsed >= 600;

                      return (
                        <motion.div
                          key={pass.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`p-4 rounded-xl border-2 ${
                            isOvertime
                              ? 'border-red-500 bg-red-50'
                              : isWarning
                              ? 'border-amber-500 bg-amber-50'
                              : 'border-slate-200 bg-white'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-semibold text-slate-800">{pass.student_name}</p>
                              <p className="text-sm text-slate-600">{pass.destination}</p>
                              <p className="text-xs text-slate-500 mt-1">
                                Started: {format(new Date(pass.start_time), 'h:mm a')}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className={`text-2xl font-bold font-mono ${
                                isOvertime ? 'text-red-600' : isWarning ? 'text-amber-600' : 'text-slate-700'
                              }`}>
                                {getElapsedTime(pass.start_time)}
                              </p>
                              {isOvertime && (
                                <Badge className="bg-red-100 text-red-700 mt-1">
                                  <AlertTriangle className="w-3 h-3 mr-1" />
                                  OVERTIME
                                </Badge>
                              )}
                              {isWarning && !isOvertime && (
                                <Badge className="bg-amber-100 text-amber-700 mt-1">
                                  <Clock className="w-3 h-3 mr-1" />
                                  Warning
                                </Badge>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-600" />
                  Recent Pass History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {recentPasses.slice(0, 20).map((pass) => (
                    <div key={pass.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 border border-slate-100">
                      <div className="flex-1">
                        <p className="font-medium text-slate-800">{pass.student_name}</p>
                        <p className="text-sm text-slate-600">{pass.destination}</p>
                        <p className="text-xs text-slate-500">
                          {format(new Date(pass.created_date), 'MMM d, h:mm a')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {pass.duration_minutes && (
                          <span className="text-sm text-slate-600">{pass.duration_minutes}min</span>
                        )}
                        {pass.overtime && (
                          <Badge className="bg-red-100 text-red-700">Overtime</Badge>
                        )}
                        {pass.status === 'RETURN_UNCONFIRMED' && (
                          <Badge className="bg-amber-100 text-amber-700">Unverified</Badge>
                        )}
                        {pass.status === 'CLOSED' && pass.return_code_validated && (
                          <Badge className="bg-green-100 text-green-700">Verified</Badge>
                        )}
                        {pass.teacher_notes && (
                          <StickyNote className="w-4 h-4 text-slate-400" />
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedSession(pass);
                            setTeacherNotes(pass.teacher_notes || '');
                          }}
                        >
                          Note
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Student Overview */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600" />
                  Students ({students.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {filteredStudents.map((student) => {
                    const remaining = (student.monthly_pass_allowance + student.purchased_passes_this_month) - student.passes_used_this_month;
                    
                    return (
                      <div key={student.id} className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-slate-800">{student.student_name}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-mono">
                              {remaining}/{student.monthly_pass_allowance + student.purchased_passes_this_month}
                            </Badge>
                            <Award className="w-4 h-4 text-amber-500" />
                            <span className="text-sm font-medium">{student.pbis_points_balance}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 text-xs text-slate-500">
                          <span>Used: {student.passes_used_this_month}</span>
                          {student.purchased_passes_this_month > 0 && (
                            <span className="text-indigo-600">+{student.purchased_passes_this_month} purchased</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Add Note Modal */}
        {selectedSession && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-md w-full">
              <CardHeader>
                <CardTitle>Add Teacher Note</CardTitle>
                <p className="text-sm text-slate-500">
                  {selectedSession.student_name} - {selectedSession.destination}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Add notes about this pass..."
                  value={teacherNotes}
                  onChange={(e) => setTeacherNotes(e.target.value)}
                  rows={4}
                />
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedSession(null);
                      setTeacherNotes('');
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => addNote.mutate({ 
                      sessionId: selectedSession.id, 
                      notes: teacherNotes 
                    })}
                    disabled={addNote.isPending}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                  >
                    Save Note
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}