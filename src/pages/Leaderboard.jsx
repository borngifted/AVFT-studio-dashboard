import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, TrendingUp, Award, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function Leaderboard() {
  const [user, setUser] = useState(null);
  const [showAwardPoints, setShowAwardPoints] = useState(false);
  const [awardData, setAwardData] = useState({
    student_email: '',
    points_awarded: 0,
    reason: '',
    category: 'initiative'
  });

  const queryClient = useQueryClient();

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: students = [] } = useQuery({
    queryKey: ['studentPassData'],
    queryFn: () => base44.entities.StudentPassData.list(),
  });

  const { data: pointTransactions = [] } = useQuery({
    queryKey: ['employabilityPoints'],
    queryFn: () => base44.entities.EmployabilityPoint.list('-created_date'),
  });

  const awardPointsMutation = useMutation({
    mutationFn: (data) => base44.entities.EmployabilityPoint.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employabilityPoints'] });
      toast.success('Points awarded!');
      setShowAwardPoints(false);
      setAwardData({ student_email: '', points_awarded: 0, reason: '', category: 'initiative' });
    },
  });

  // Calculate total points per student
  const studentScores = students.map(student => {
    const totalPoints = pointTransactions
      .filter(pt => pt.student_email === student.student_email)
      .reduce((sum, pt) => sum + pt.points_awarded, 0);
    
    return {
      ...student,
      totalPoints,
      pbisPoints: student.pbis_points_balance || 0,
      combinedScore: totalPoints + (student.pbis_points_balance || 0)
    };
  }).sort((a, b) => b.totalPoints - a.totalPoints);

  const isAdmin = user?.role === 'admin';

  const categoryIcons = {
    initiative: '🚀',
    helping: '🤝',
    leadership: '👑',
    attendance: '📅',
    quality_work: '⭐',
    other: '✨'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-slate-800 mb-2 flex items-center justify-center gap-3">
            <Trophy className="w-10 h-10 text-yellow-500" />
            Employability Leaderboard
          </h1>
          <p className="text-slate-600">Students earning points through initiative, leadership, and quality work</p>
        </div>

        {isAdmin && (
          <Card className="mb-6 bg-indigo-50 border-indigo-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-indigo-600" />
                  Award Points
                </CardTitle>
                <Button onClick={() => setShowAwardPoints(!showAwardPoints)} size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  {showAwardPoints ? 'Close' : 'Award'}
                </Button>
              </div>
            </CardHeader>
            {showAwardPoints && (
              <CardContent className="space-y-3">
                <Select
                  value={awardData.student_email}
                  onValueChange={(value) => setAwardData({ ...awardData, student_email: value })}
                >
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

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    type="number"
                    placeholder="Points"
                    value={awardData.points_awarded || ''}
                    onChange={(e) => setAwardData({ ...awardData, points_awarded: parseInt(e.target.value) || 0 })}
                  />
                  <Select
                    value={awardData.category}
                    onValueChange={(value) => setAwardData({ ...awardData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="initiative">Initiative</SelectItem>
                      <SelectItem value="helping">Helping Others</SelectItem>
                      <SelectItem value="leadership">Leadership</SelectItem>
                      <SelectItem value="attendance">Attendance</SelectItem>
                      <SelectItem value="quality_work">Quality Work</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Textarea
                  placeholder="Reason for award..."
                  value={awardData.reason}
                  onChange={(e) => setAwardData({ ...awardData, reason: e.target.value })}
                  className="h-20"
                />

                <Button
                  onClick={() => {
                    const student = students.find(s => s.student_email === awardData.student_email);
                    awardPointsMutation.mutate({
                      ...awardData,
                      student_name: student?.student_name || '',
                      awarded_by: user.full_name
                    });
                  }}
                  disabled={!awardData.student_email || !awardData.points_awarded || !awardData.reason}
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                >
                  Award Points
                </Button>
              </CardContent>
            )}
          </Card>
        )}

        {/* Top 3 Podium */}
        <div className="grid grid-cols-3 gap-4 mb-8 items-end">
          {studentScores[1] && (
            <Card className="bg-gradient-to-br from-slate-200 to-slate-300 border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto bg-slate-400 rounded-full flex items-center justify-center mb-3">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <p className="font-bold text-slate-800 mb-1">{studentScores[1].student_name}</p>
                <p className="text-3xl font-bold text-slate-700">{studentScores[1].totalPoints}</p>
                <p className="text-xs text-slate-600">points</p>
              </CardContent>
            </Card>
          )}

          {studentScores[0] && (
            <Card className="bg-gradient-to-br from-yellow-300 to-yellow-400 border-0 shadow-xl transform scale-105">
              <CardContent className="p-6 text-center">
                <Trophy className="w-12 h-12 mx-auto text-yellow-600 mb-2" />
                <div className="w-20 h-20 mx-auto bg-yellow-500 rounded-full flex items-center justify-center mb-3">
                  <span className="text-3xl font-bold text-white">1</span>
                </div>
                <p className="font-bold text-slate-800 mb-1 text-lg">{studentScores[0].student_name}</p>
                <p className="text-4xl font-bold text-yellow-800">{studentScores[0].totalPoints}</p>
                <p className="text-xs text-yellow-700">points</p>
              </CardContent>
            </Card>
          )}

          {studentScores[2] && (
            <Card className="bg-gradient-to-br from-orange-200 to-orange-300 border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto bg-orange-400 rounded-full flex items-center justify-center mb-3">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                <p className="font-bold text-slate-800 mb-1">{studentScores[2].student_name}</p>
                <p className="text-3xl font-bold text-orange-700">{studentScores[2].totalPoints}</p>
                <p className="text-xs text-orange-600">points</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Full Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              Full Rankings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {studentScores.slice(3).map((student, index) => (
              <div key={student.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                    <span className="font-bold text-slate-700">{index + 4}</span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{student.student_name}</p>
                    {student.pbisPoints > 0 && (
                      <p className="text-xs text-slate-500">
                        {student.pbisPoints} PBIS points
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-indigo-600">{student.totalPoints}</p>
                  <p className="text-xs text-slate-500">employability pts</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Awards */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Recent Awards
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {pointTransactions.slice(0, 10).map((transaction) => (
              <div key={transaction.id} className="p-3 bg-white rounded-lg border border-slate-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{categoryIcons[transaction.category]}</span>
                      <p className="font-medium text-slate-800">{transaction.student_name}</p>
                      <Badge variant="outline">+{transaction.points_awarded} pts</Badge>
                    </div>
                    <p className="text-sm text-slate-600">{transaction.reason}</p>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-indigo-100 text-indigo-700 text-xs">
                      {transaction.category}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}