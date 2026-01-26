import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from 'lucide-react';
import GradeFeedbackHelper from '@/components/home/GradeFeedbackHelper';
import DraftParentMessage from '@/components/home/DraftParentMessage';
import StudentProgress from '@/components/home/StudentProgress';

export default function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold text-slate-800 mb-4">Teacher's Pet</h1>
            <p className="text-slate-500 mb-6">Please log in to continue</p>
            <Button onClick={() => base44.auth.redirectToLogin()}>
              Log In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Teacher Dashboard</h1>
          <p className="text-slate-600">Welcome back, {user.full_name}!</p>
        </div>

        {/* Time Saved Card */}
        <Card className="bg-gradient-to-br from-blue-400 to-blue-500 text-white border-0 shadow-lg mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm mb-2">Time Saved This Week</p>
                <p className="text-4xl font-bold">3 hrs 15 mins saved</p>
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <Clock className="w-8 h-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="feedback" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="feedback">Grade Feedback</TabsTrigger>
            <TabsTrigger value="messages">Parent Messages</TabsTrigger>
            <TabsTrigger value="progress">Student Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="feedback" className="mt-6">
            <GradeFeedbackHelper />
          </TabsContent>

          <TabsContent value="messages" className="mt-6">
            <DraftParentMessage />
          </TabsContent>

          <TabsContent value="progress" className="mt-6">
            <StudentProgress />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}