import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Clock, AlertTriangle, Award, MapPin, Calendar } from 'lucide-react';
import { startOfMonth, endOfMonth, format, subMonths } from 'date-fns';

export default function PassAnalytics() {
  const [timeRange, setTimeRange] = useState('30');

  const { data: sessions = [] } = useQuery({
    queryKey: ['analytics-sessions'],
    queryFn: () => base44.entities.PassSession.list('-created_date', 1000)
  });

  const { data: students = [] } = useQuery({
    queryKey: ['analytics-students'],
    queryFn: () => base44.entities.StudentPassData.list()
  });

  const filteredSessions = useMemo(() => {
    const daysAgo = parseInt(timeRange);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
    
    return sessions.filter(s => {
      if (!s.start_time) return false;
      return new Date(s.start_time) >= cutoffDate;
    });
  }, [sessions, timeRange]);

  // Destination breakdown
  const destinationData = useMemo(() => {
    const counts = {};
    filteredSessions.forEach(s => {
      counts[s.destination] = (counts[s.destination] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredSessions]);

  // Daily pass trend
  const dailyTrend = useMemo(() => {
    const days = {};
    filteredSessions.forEach(s => {
      const day = format(new Date(s.start_time), 'MMM dd');
      days[day] = (days[day] || 0) + 1;
    });
    return Object.entries(days)
      .map(([date, count]) => ({ date, count }))
      .slice(-14);
  }, [filteredSessions]);

  // Overtime analysis
  const overtimeData = useMemo(() => {
    const overtime = filteredSessions.filter(s => s.overtime).length;
    const ontime = filteredSessions.length - overtime;
    return [
      { name: 'On Time', value: ontime },
      { name: 'Overtime', value: overtime }
    ];
  }, [filteredSessions]);

  // PBIS effectiveness
  const pbisData = useMemo(() => {
    const totalPoints = students.reduce((sum, s) => sum + (s.pbis_points_balance || 0), 0);
    const totalPurchased = students.reduce((sum, s) => sum + (s.purchased_passes_this_month || 0), 0);
    const avgUnused = students.length > 0 
      ? students.reduce((sum, s) => sum + (s.unused_passes_last_month || 0), 0) / students.length 
      : 0;
    
    return [
      { metric: 'Avg Unused Passes', value: avgUnused.toFixed(1) },
      { metric: 'Total PBIS Points', value: totalPoints },
      { metric: 'Passes Purchased', value: totalPurchased }
    ];
  }, [students]);

  // Stats
  const stats = useMemo(() => {
    const avgDuration = filteredSessions.length > 0
      ? filteredSessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) / filteredSessions.length
      : 0;
    const overtimeCount = filteredSessions.filter(s => s.overtime).length;
    const unconfirmedCount = filteredSessions.filter(s => s.status === 'RETURN_UNCONFIRMED').length;
    
    return {
      total: filteredSessions.length,
      avgDuration: avgDuration.toFixed(1),
      overtime: overtimeCount,
      unconfirmed: unconfirmedCount
    };
  }, [filteredSessions]);

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#f97316'];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Pass Analytics</h1>
            <p className="text-slate-500">Insights and trends for pass management</p>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="90">Last 90 Days</SelectItem>
              <SelectItem value="365">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-indigo-100">
                  <TrendingUp className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
                  <p className="text-sm text-slate-500">Total Passes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-blue-100">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{stats.avgDuration}m</p>
                  <p className="text-sm text-slate-500">Avg Duration</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-red-100">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{stats.overtime}</p>
                  <p className="text-sm text-slate-500">Overtime</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-amber-100">
                  <Award className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{stats.unconfirmed}</p>
                  <p className="text-sm text-slate-500">Unconfirmed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Daily Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                Daily Pass Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Destination Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-indigo-600" />
                Popular Destinations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={destinationData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {destinationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Overtime Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Overtime Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={overtimeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#ef4444" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* PBIS Effectiveness */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-600" />
                PBIS Incentive Impact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={pbisData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="metric" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}