import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Clock, Check, X, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function PreAssignedPasses({ user }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    student_name: '',
    student_email: '',
    destination: '',
    scheduled_date: '',
    scheduled_time: '',
    reason: ''
  });

  const queryClient = useQueryClient();

  const { data: preAssignedPasses = [] } = useQuery({
    queryKey: ['pre-assigned-passes'],
    queryFn: () => base44.entities.PreAssignedPass.list('-created_date')
  });

  const { data: students = [] } = useQuery({
    queryKey: ['students-for-preassign'],
    queryFn: () => base44.entities.StudentPassData.list()
  });

  const createPreAssigned = useMutation({
    mutationFn: (data) => base44.entities.PreAssignedPass.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pre-assigned-passes'] });
      setShowForm(false);
      setFormData({ student_name: '', student_email: '', destination: '', scheduled_date: '', scheduled_time: '', reason: '' });
      toast.success('Pre-assigned pass created!');
    }
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status, notes }) => 
      base44.entities.PreAssignedPass.update(id, {
        status,
        teacher_notes: notes,
        approved_by: user.full_name
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pre-assigned-passes'] });
      toast.success('Pass updated!');
    }
  });

  const handleStudentSelect = (email) => {
    const student = students.find(s => s.student_email === email);
    if (student) {
      setFormData(prev => ({
        ...prev,
        student_email: email,
        student_name: student.student_name
      }));
    }
  };

  const pendingPasses = preAssignedPasses.filter(p => p.status === 'pending');
  const approvedPasses = preAssignedPasses.filter(p => p.status === 'approved');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">Pre-Assigned Passes</h3>
          <p className="text-sm text-slate-500">Schedule passes for specific students and times</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          New Pre-Assignment
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create Pre-Assigned Pass</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Student</Label>
                  <Select value={formData.student_email} onValueChange={handleStudentSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map(s => (
                        <SelectItem key={s.id} value={s.student_email}>
                          {s.student_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Destination</Label>
                  <Select value={formData.destination} onValueChange={(v) => setFormData(prev => ({ ...prev, destination: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select destination" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Restroom">Restroom</SelectItem>
                      <SelectItem value="Water Fountain">Water Fountain</SelectItem>
                      <SelectItem value="Main Office">Main Office</SelectItem>
                      <SelectItem value="Counselor">Counselor</SelectItem>
                      <SelectItem value="Nurse">Nurse</SelectItem>
                      <SelectItem value="Library">Library</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={formData.scheduled_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, scheduled_date: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Time</Label>
                  <Input
                    type="time"
                    value={formData.scheduled_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, scheduled_time: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label>Reason</Label>
                <Textarea
                  value={formData.reason}
                  onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Appointment, special activity, etc."
                />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button
                  onClick={() => createPreAssigned.mutate(formData)}
                  disabled={!formData.student_email || !formData.destination || !formData.scheduled_date || createPreAssigned.isPending}
                >
                  Create Pre-Assignment
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              Pending Approval ({pendingPasses.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingPasses.length === 0 ? (
                <p className="text-center py-8 text-slate-500">No pending requests</p>
              ) : (
                pendingPasses.map((pass) => (
                  <div key={pass.id} className="p-4 border rounded-lg space-y-3">
                    <div>
                      <p className="font-medium text-slate-800">{pass.student_name}</p>
                      <p className="text-sm text-slate-600">{pass.destination}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(pass.scheduled_date), 'MMM dd, yyyy')}
                        {pass.scheduled_time && ` at ${pass.scheduled_time}`}
                      </div>
                      {pass.reason && (
                        <p className="text-sm text-slate-600 mt-2">{pass.reason}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => updateStatus.mutate({ id: pass.id, status: 'approved', notes: 'Approved by teacher' })}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatus.mutate({ id: pass.id, status: 'denied', notes: 'Denied by teacher' })}
                        className="flex-1 border-red-500 text-red-600 hover:bg-red-50"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Deny
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600" />
              Approved ({approvedPasses.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-auto">
              {approvedPasses.length === 0 ? (
                <p className="text-center py-8 text-slate-500">No approved passes</p>
              ) : (
                approvedPasses.map((pass) => (
                  <div key={pass.id} className="p-3 bg-green-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-slate-800">{pass.student_name}</p>
                        <p className="text-sm text-slate-600">{pass.destination}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(pass.scheduled_date), 'MMM dd')}
                          {pass.scheduled_time && ` at ${pass.scheduled_time}`}
                        </div>
                      </div>
                      {pass.status === 'used' && <Badge className="bg-blue-100 text-blue-700">Used</Badge>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}