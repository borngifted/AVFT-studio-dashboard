import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  DoorOpen, LayoutDashboard, TrendingUp, FileText, 
  Award, Clock, Users, ChevronRight 
} from 'lucide-react';

export default function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-violet-600 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mx-auto mb-4">
              <DoorOpen className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">AVTF Management</h1>
            <p className="text-slate-600 mb-6">Digital Pass & Student Management System</p>
            <Button 
              onClick={() => base44.auth.redirectToLogin()}
              className="w-full h-12 bg-indigo-600 hover:bg-indigo-700"
            >
              Sign In to Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isAdmin = user.role === 'admin';

  const quickLinks = [
    {
      title: 'Pass Dashboard',
      description: 'Monitor active passes and student activity',
      icon: DoorOpen,
      page: 'PassDashboard',
      color: 'from-indigo-500 to-violet-500',
      adminOnly: false
    },
    {
      title: 'Teacher Dashboard',
      description: 'View and manage student submissions',
      icon: Users,
      page: 'TeacherDashboard',
      color: 'from-blue-500 to-cyan-500',
      adminOnly: false
    },
    {
      title: 'Analytics',
      description: 'Insights and trends for pass usage',
      icon: TrendingUp,
      page: 'PassAnalytics',
      color: 'from-purple-500 to-pink-500',
      adminOnly: false
    },
    {
      title: 'Monthly Reports',
      description: 'Automated monthly summaries and metrics',
      icon: FileText,
      page: 'MonthlyReports',
      color: 'from-amber-500 to-orange-500',
      adminOnly: true
    }
  ];

  const visibleLinks = quickLinks.filter(link => !link.adminOnly || isAdmin);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-violet-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-6">
              <DoorOpen className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Welcome to AVTF Management
            </h1>
            <p className="text-xl text-indigo-100 mb-2">
              Digital Pass & Student Management System
            </p>
            <p className="text-sm text-indigo-200">
              Signed in as <span className="font-semibold">{user.full_name}</span>
              {isAdmin && <span className="ml-2 px-2 py-1 bg-white/20 rounded-full text-xs">Admin</span>}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Quick Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {visibleLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.page} to={createPageUrl(link.page)}>
                <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer border-2 hover:border-indigo-200">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${link.color} flex items-center justify-center mb-4`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                    </div>
                    <CardTitle className="text-xl">{link.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600">{link.description}</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Stats Overview */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">System Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-indigo-50 to-purple-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h3 className="font-semibold text-slate-800">Real-Time Tracking</h3>
                </div>
                <p className="text-sm text-slate-600">
                  Monitor active passes with countdown timers and instant notifications
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-50 to-orange-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Award className="w-5 h-5 text-amber-600" />
                  </div>
                  <h3 className="font-semibold text-slate-800">PBIS Integration</h3>
                </div>
                <p className="text-sm text-slate-600">
                  Incentivize responsible pass usage with points and rewards
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-slate-800">Analytics & Reports</h3>
                </div>
                <p className="text-sm text-slate-600">
                  Automated insights and monthly summaries for data-driven decisions
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}