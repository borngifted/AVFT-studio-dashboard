import Home from './pages/Home';
import MonthlyReports from './pages/MonthlyReports';
import NotificationSettings from './pages/NotificationSettings';
import PassAnalytics from './pages/PassAnalytics';
import PassDashboard from './pages/PassDashboard';
import StudentForm from './pages/StudentForm';
import StudentPass from './pages/StudentPass';
import TeacherDashboard from './pages/TeacherDashboard';
import ParentNotifications from './pages/ParentNotifications';
import AttendanceCheckIn from './pages/AttendanceCheckIn';
import Leaderboard from './pages/Leaderboard';
import GAStandards from './pages/GAStandards';
import AttendanceAdmin from './pages/AttendanceAdmin';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "MonthlyReports": MonthlyReports,
    "NotificationSettings": NotificationSettings,
    "PassAnalytics": PassAnalytics,
    "PassDashboard": PassDashboard,
    "StudentForm": StudentForm,
    "StudentPass": StudentPass,
    "TeacherDashboard": TeacherDashboard,
    "ParentNotifications": ParentNotifications,
    "AttendanceCheckIn": AttendanceCheckIn,
    "Leaderboard": Leaderboard,
    "GAStandards": GAStandards,
    "AttendanceAdmin": AttendanceAdmin,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};