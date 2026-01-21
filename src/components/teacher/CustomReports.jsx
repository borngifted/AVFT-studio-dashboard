import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileDown, Filter, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function CustomReports() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [destination, setDestination] = useState('all');
  const [status, setStatus] = useState('all');

  const { data: sessions = [] } = useQuery({
    queryKey: ['all-sessions'],
    queryFn: () => base44.entities.PassSession.list('-created_date', 1000)
  });

  const filteredSessions = useMemo(() => {
    return sessions.filter(s => {
      if (!s.start_time) return false;
      
      const sessionDate = new Date(s.start_time);
      
      if (startDate && sessionDate < new Date(startDate)) return false;
      if (endDate && sessionDate > new Date(endDate + 'T23:59:59')) return false;
      if (destination !== 'all' && s.destination !== destination) return false;
      if (status !== 'all' && s.status !== status) return false;
      
      return true;
    });
  }, [sessions, startDate, endDate, destination, status]);

  const stats = useMemo(() => {
    const total = filteredSessions.length;
    const avgDuration = total > 0
      ? filteredSessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) / total
      : 0;
    const overtimeCount = filteredSessions.filter(s => s.overtime).length;
    const unconfirmedCount = filteredSessions.filter(s => s.status === 'RETURN_UNCONFIRMED').length;
    
    const destinations = {};
    filteredSessions.forEach(s => {
      destinations[s.destination] = (destinations[s.destination] || 0) + 1;
    });

    return { total, avgDuration, overtimeCount, unconfirmedCount, destinations };
  }, [filteredSessions]);

  const exportReport = () => {
    const csv = [
      ['Student Name', 'Destination', 'Start Time', 'End Time', 'Duration (min)', 'Status', 'Overtime', 'Return Verified', 'Notes'].join(','),
      ...filteredSessions.map(s => [
        s.student_name,
        s.destination,
        s.start_time ? format(new Date(s.start_time), 'yyyy-MM-dd HH:mm') : '',
        s.end_time ? format(new Date(s.end_time), 'yyyy-MM-dd HH:mm') : '',
        s.duration_minutes || '',
        s.status,
        s.overtime ? 'Yes' : 'No',
        s.return_code_validated ? 'Yes' : 'No',
        (s.teacher_notes || '').replace(/,/g, ';')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pass-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    toast.success('Report exported!');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-indigo-600" />
            Custom Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label>End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div>
              <Label>Destination</Label>
              <Select value={destination} onValueChange={setDestination}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Destinations</SelectItem>
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
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="OPEN">Open</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                  <SelectItem value="AUTO_CLOSED">Auto Closed</SelectItem>
                  <SelectItem value="RETURN_UNCONFIRMED">Unconfirmed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-indigo-600">{stats.total}</p>
            <p className="text-sm text-slate-500">Total Passes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-blue-600">{stats.avgDuration.toFixed(1)}m</p>
            <p className="text-sm text-slate-500">Avg Duration</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-red-600">{stats.overtimeCount}</p>
            <p className="text-sm text-slate-500">Overtime</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-amber-600">{stats.unconfirmedCount}</p>
            <p className="text-sm text-slate-500">Unconfirmed</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Report Results ({filteredSessions.length} passes)</CardTitle>
            <Button onClick={exportReport} disabled={filteredSessions.length === 0}>
              <FileDown className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-auto">
            {filteredSessions.length === 0 ? (
              <p className="text-center py-8 text-slate-500">No passes match the filters</p>
            ) : (
              filteredSessions.slice(0, 50).map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">{session.student_name}</p>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <span>{session.destination}</span>
                      <span>•</span>
                      <span>{format(new Date(session.start_time), 'MMM dd, HH:mm')}</span>
                      {session.duration_minutes && (
                        <>
                          <span>•</span>
                          <span>{session.duration_minutes}m</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {session.overtime && <Badge variant="destructive">Overtime</Badge>}
                    {session.status === 'RETURN_UNCONFIRMED' && <Badge variant="outline" className="border-amber-500 text-amber-700">Unconfirmed</Badge>}
                    {session.status === 'CLOSED' && <Badge className="bg-green-100 text-green-700">Verified</Badge>}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}