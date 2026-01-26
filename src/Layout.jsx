import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  LayoutDashboard, FileText, DoorOpen, Users, LogOut, Menu, X, TrendingUp,
  CheckCircle2, Trophy, BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import InstallPrompt from '@/components/InstallPrompt';
import TeacherCodePrompt from '@/components/TeacherCodePrompt';

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showTeacherPrompt, setShowTeacherPrompt] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      // Show teacher code prompt for new users (non-admins) on first login
      if (u && u.role !== 'admin' && !localStorage.getItem('roleSelected')) {
        setShowTeacherPrompt(true);
      }
    }).catch(() => {});
  }, []);

  // Redirect based on role
  useEffect(() => {
    if (user) {
      // Always redirect based on role unless on a public page
      if (!currentPageName || currentPageName === 'Home') {
        const targetPage = user.role === 'admin' ? 'Home' : 'StudentPass';
        if (currentPageName !== targetPage) {
          window.location.href = createPageUrl(targetPage);
        }
      }
    }
  }, [user, currentPageName]);

  // Show teacher code prompt
  if (showTeacherPrompt) {
    return (
      <TeacherCodePrompt
        onComplete={(isTeacher) => {
          localStorage.setItem('roleSelected', 'true');
          setShowTeacherPrompt(false);
          if (isTeacher) {
            window.location.reload(); // Reload to get updated user role
          }
        }}
      />
    );
  }

  // Public pages that don't need auth
  const publicPages = ['StudentForm', 'StudentPass'];
  const isPublicPage = publicPages.includes(currentPageName);

  // If public page, show minimal layout
  if (isPublicPage) {
    return (
      <div className="min-h-screen bg-slate-50">
        {children}
        <InstallPrompt />
      </div>
    );
  }

  // Protected pages - require login
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">Teacher's Pet</h1>
          <p className="text-slate-600 mb-6">Please log in to access your dashboard</p>
          <Button onClick={() => base44.auth.redirectToLogin()}>
            Log In
          </Button>
        </div>
      </div>
    );
  }

  const isAdmin = user.role === 'admin';

  const navigation = isAdmin ? [
    { name: 'Home', page: 'Home', icon: LayoutDashboard },
    { name: 'Pass Dashboard', page: 'PassDashboard', icon: DoorOpen },
    { name: 'Teacher Dashboard', page: 'TeacherDashboard', icon: Users },
    { name: 'Analytics', page: 'PassAnalytics', icon: TrendingUp },
    { name: 'Monthly Reports', page: 'MonthlyReports', icon: FileText },
  ] : [
    { name: 'My Pass', page: 'StudentPass', icon: DoorOpen },
    { name: 'Check In', page: 'AttendanceCheckIn', icon: CheckCircle2 },
    { name: 'Leaderboard', page: 'Leaderboard', icon: Trophy },
    { name: 'Curriculum', page: 'GAStandards', icon: BookOpen },
  ];

  const visibleNav = navigation;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-slate-800">Teacher's Pet</span>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-1">
                {visibleNav.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPageName === item.page;
                  return (
                    <Link
                      key={item.page}
                      to={createPageUrl(item.page)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-600 font-medium'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg">
                <Users className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-700">{user.full_name}</span>
                {isAdmin && (
                  <span className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full">
                    Admin
                  </span>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => base44.auth.logout()}
                className="text-slate-500 hover:text-slate-700"
              >
                <LogOut className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <div className="space-y-1">
                {visibleNav.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPageName === item.page;
                  return (
                    <Link
                      key={item.page}
                      to={createPageUrl(item.page)}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-600 font-medium'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
              <div className="mt-4 pt-4 border-t px-4">
                <p className="text-sm text-slate-500 mb-1">Signed in as</p>
                <p className="text-sm font-medium text-slate-700">{user.full_name}</p>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main>{children}</main>

      {/* Install Prompt for PWA */}
      <InstallPrompt />
    </div>
  );
}