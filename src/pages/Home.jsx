import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Clock, Mail, AlertCircle, GraduationCap, ChevronRight, 
  Send, MessageSquare
} from 'lucide-react';

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
            <h1 className="text-2xl font-bold text-slate-800 mb-4">TeachersPet 🐾</h1>
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
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Home</h1>
          <p className="text-slate-600">Welcome back, {user.full_name}!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Time Saved Card */}
            <Card className="bg-gradient-to-br from-blue-400 to-blue-500 text-white border-0 shadow-lg">
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

            {/* Quick Actions */}
            <Card className="shadow-md">
              <CardContent className="p-4 space-y-3">
                <Link to={createPageUrl('TeacherDashboard')}>
                  <button className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                        <Mail className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-medium text-slate-800">Draft Parent Message</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </button>
                </Link>

                <Link to={createPageUrl('PassDashboard')}>
                  <button className="w-full flex items-center justify-between p-4 bg-orange-50 hover:bg-orange-100 rounded-xl transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-medium text-slate-800">Log Incident</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </button>
                </Link>

                <Link to={createPageUrl('TeacherDashboard')}>
                  <button className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                        <GraduationCap className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-medium text-slate-800">Grade Feedback Helper</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Interaction Log */}
          <div className="space-y-6">
            <Card className="shadow-md">
              <CardHeader className="border-b bg-slate-50">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageSquare className="w-5 h-5 text-slate-600" />
                  Interaction Log
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium text-slate-800">Apr 18 • Sent to: Mrs. Turner</p>
                      <p className="text-xs text-slate-500">11:23 AM</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600">"Update on Jason's Focus Issues"</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium text-slate-800">Apr 12 • Sent to: Mr. Carter</p>
                      <p className="text-xs text-slate-500">3:45 PM</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600">"Behavior Concern Follow-Up"</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium text-slate-800">Apr 8 • Sent to: Ms. Lee</p>
                      <p className="text-xs text-slate-500">9:10 AM</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600">"Project Deadline Reminder"</p>
                </div>
              </CardContent>
            </Card>

            {/* Draft Message Preview */}
            <Card className="shadow-md">
              <CardHeader className="border-b bg-slate-50">
                <CardTitle className="text-lg">Draft Message</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-blue-500 hover:bg-blue-600">Supportive</Button>
                    <Button size="sm" variant="outline">Firm</Button>
                    <Button size="sm" variant="outline">Admin-Safe</Button>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg text-sm text-slate-700 space-y-2">
                    <p className="font-medium">Hi Mrs. Turner,</p>
                    <p>I wanted to inform you that Jason has been having difficulty staying focused in class recently.</p>
                    <p>I'm here to help and we can work together to support him.</p>
                    <p>Let me know if there's a good time we could chat further.</p>
                    <p className="font-medium">Best regards,<br />Ms. Williams</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">Preview</Button>
                    <Button className="flex-1 bg-blue-500 hover:bg-blue-600">
                      <Send className="w-4 h-4 mr-2" />
                      Send
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}