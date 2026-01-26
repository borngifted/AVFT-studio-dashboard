import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, Plus, Target, Calendar, 
  FileText, MessageSquare, CheckCircle2 
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function StudentProgress() {
  const [selectedStudent, setSelectedStudent] = useState('');
  const [showAddNote, setShowAddNote] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  
  const [newNote, setNewNote] = useState({ note_type: 'observation', content: '' });
  const [newGoal, setNewGoal] = useState({ 
    goal_title: '', 
    goal_description: '', 
    target_date: '', 
    progress_percentage: 0 
  });

  const queryClient = useQueryClient();

  const { data: students = [] } = useQuery({
    queryKey: ['studentPassData'],
    queryFn: () => base44.entities.StudentPassData.list(),
  });

  const { data: notes = [] } = useQuery({
    queryKey: ['studentNotes', selectedStudent],
    queryFn: () => base44.entities.StudentNote.filter({ student_email: selectedStudent }, '-created_date'),
    enabled: !!selectedStudent,
  });

  const { data: goals = [] } = useQuery({
    queryKey: ['studentGoals', selectedStudent],
    queryFn: () => base44.entities.StudentGoal.filter({ student_email: selectedStudent }, '-created_date'),
    enabled: !!selectedStudent,
  });

  const { data: passSessions = [] } = useQuery({
    queryKey: ['passSessions', selectedStudent],
    queryFn: () => base44.entities.PassSession.filter({ student_email: selectedStudent }, '-created_date', 20),
    enabled: !!selectedStudent,
  });

  const createNoteMutation = useMutation({
    mutationFn: (data) => base44.entities.StudentNote.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentNotes'] });
      toast.success('Note added');
      setShowAddNote(false);
      setNewNote({ note_type: 'observation', content: '' });
    },
  });

  const createGoalMutation = useMutation({
    mutationFn: (data) => base44.entities.StudentGoal.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentGoals'] });
      toast.success('Goal created');
      setShowAddGoal(false);
      setNewGoal({ goal_title: '', goal_description: '', target_date: '', progress_percentage: 0 });
    },
  });

  const updateGoalMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.StudentGoal.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentGoals'] });
      toast.success('Goal updated');
    },
  });

  const selectedStudentData = students.find(s => s.student_email === selectedStudent);

  const noteTypeColors = {
    observation: 'bg-blue-100 text-blue-700',
    achievement: 'bg-green-100 text-green-700',
    concern: 'bg-red-100 text-red-700',
    goal: 'bg-purple-100 text-purple-700',
    general: 'bg-slate-100 text-slate-700'
  };

  const goalStatusColors = {
    active: 'bg-blue-100 text-blue-700',
    achieved: 'bg-green-100 text-green-700',
    in_progress: 'bg-yellow-100 text-yellow-700',
    abandoned: 'bg-slate-100 text-slate-700'
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            Student Progress Tracker
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={selectedStudent} onValueChange={setSelectedStudent}>
            <SelectTrigger>
              <SelectValue placeholder="Select a student" />
            </SelectTrigger>
            <SelectContent>
              {students.map((student) => (
                <SelectItem key={student.id} value={student.student_email}>
                  {student.student_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedStudent && selectedStudentData && (
            <div className="space-y-6">
              {/* Overview Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-indigo-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-indigo-600">
                    {selectedStudentData.passes_used_this_month}/{selectedStudentData.monthly_pass_allowance}
                  </p>
                  <p className="text-xs text-slate-600">Passes Used</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-purple-600">{selectedStudentData.pbis_points_balance}</p>
                  <p className="text-xs text-slate-600">PBIS Points</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {goals.filter(g => g.status === 'achieved').length}/{goals.length}
                  </p>
                  <p className="text-xs text-slate-600">Goals Achieved</p>
                </div>
              </div>

              {/* Goals Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Goals
                  </h3>
                  <Button onClick={() => setShowAddGoal(!showAddGoal)} size="sm" variant="outline">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Goal
                  </Button>
                </div>

                {showAddGoal && (
                  <div className="p-4 bg-indigo-50 rounded-lg mb-3 space-y-3">
                    <Input
                      placeholder="Goal title"
                      value={newGoal.goal_title}
                      onChange={(e) => setNewGoal({ ...newGoal, goal_title: e.target.value })}
                    />
                    <Textarea
                      placeholder="Goal description"
                      value={newGoal.goal_description}
                      onChange={(e) => setNewGoal({ ...newGoal, goal_description: e.target.value })}
                    />
                    <Input
                      type="date"
                      value={newGoal.target_date}
                      onChange={(e) => setNewGoal({ ...newGoal, target_date: e.target.value })}
                    />
                    <Button
                      onClick={() => createGoalMutation.mutate({
                        ...newGoal,
                        student_name: selectedStudentData.student_name,
                        student_email: selectedStudent
                      })}
                      disabled={!newGoal.goal_title}
                      className="w-full"
                    >
                      Create Goal
                    </Button>
                  </div>
                )}

                <div className="space-y-2">
                  {goals.map((goal) => (
                    <div key={goal.id} className="p-3 bg-white rounded-lg border border-slate-200">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-medium text-slate-800">{goal.goal_title}</p>
                          <p className="text-xs text-slate-500">{goal.goal_description}</p>
                        </div>
                        <Badge className={goalStatusColors[goal.status]}>
                          {goal.status}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <Progress value={goal.progress_percentage} className="h-2" />
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>{goal.progress_percentage}% complete</span>
                          {goal.target_date && (
                            <span>Due: {format(new Date(goal.target_date), 'MMM d, yyyy')}</span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            placeholder="Update progress %"
                            className="h-8 text-xs"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                const newProgress = parseInt(e.target.value);
                                if (newProgress >= 0 && newProgress <= 100) {
                                  updateGoalMutation.mutate({
                                    id: goal.id,
                                    data: { 
                                      progress_percentage: newProgress,
                                      status: newProgress === 100 ? 'achieved' : 'in_progress'
                                    }
                                  });
                                  e.target.value = '';
                                }
                              }
                            }}
                          />
                          <Select
                            value={goal.status}
                            onValueChange={(value) => updateGoalMutation.mutate({ id: goal.id, data: { status: value } })}
                          >
                            <SelectTrigger className="w-32 h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="achieved">Achieved</SelectItem>
                              <SelectItem value="abandoned">Abandoned</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  ))}
                  {goals.length === 0 && (
                    <p className="text-sm text-slate-500 text-center py-4">No goals set yet</p>
                  )}
                </div>
              </div>

              {/* Notes Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Teacher Notes
                  </h3>
                  <Button onClick={() => setShowAddNote(!showAddNote)} size="sm" variant="outline">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Note
                  </Button>
                </div>

                {showAddNote && (
                  <div className="p-4 bg-blue-50 rounded-lg mb-3 space-y-3">
                    <Select
                      value={newNote.note_type}
                      onValueChange={(value) => setNewNote({ ...newNote, note_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="observation">Observation</SelectItem>
                        <SelectItem value="achievement">Achievement</SelectItem>
                        <SelectItem value="concern">Concern</SelectItem>
                        <SelectItem value="goal">Goal</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                      </SelectContent>
                    </Select>
                    <Textarea
                      placeholder="Add your note..."
                      value={newNote.content}
                      onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                      className="h-20"
                    />
                    <Button
                      onClick={() => createNoteMutation.mutate({
                        ...newNote,
                        student_name: selectedStudentData.student_name,
                        student_email: selectedStudent
                      })}
                      disabled={!newNote.content}
                      className="w-full"
                    >
                      Save Note
                    </Button>
                  </div>
                )}

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {notes.map((note) => (
                    <div key={note.id} className="p-3 bg-white rounded-lg border border-slate-200">
                      <div className="flex items-start justify-between mb-1">
                        <Badge className={noteTypeColors[note.note_type]}>
                          {note.note_type}
                        </Badge>
                        <span className="text-xs text-slate-500">
                          {format(new Date(note.created_date), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700">{note.content}</p>
                    </div>
                  ))}
                  {notes.length === 0 && (
                    <p className="text-sm text-slate-500 text-center py-4">No notes yet</p>
                  )}
                </div>
              </div>

              {/* Recent Pass Activity */}
              <div>
                <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Recent Pass Activity
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {passSessions.slice(0, 10).map((session) => (
                    <div key={session.id} className="p-2 bg-slate-50 rounded-lg text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-700">{session.destination}</span>
                        <span className="text-xs text-slate-500">
                          {format(new Date(session.start_time), 'MMM d, h:mm a')}
                        </span>
                      </div>
                      {session.duration_minutes && (
                        <p className="text-xs text-slate-500">{session.duration_minutes} mins</p>
                      )}
                    </div>
                  ))}
                  {passSessions.length === 0 && (
                    <p className="text-sm text-slate-500 text-center py-4">No pass history</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {!selectedStudent && (
            <div className="text-center py-8 text-slate-500">
              Select a student to view their progress
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}