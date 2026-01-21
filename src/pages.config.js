import MonthlyReports from './pages/MonthlyReports';
import NotificationSettings from './pages/NotificationSettings';
import PassAnalytics from './pages/PassAnalytics';
import PassDashboard from './pages/PassDashboard';
import StudentForm from './pages/StudentForm';
import StudentPass from './pages/StudentPass';
import TeacherDashboard from './pages/TeacherDashboard';
import Home from './pages/Home';
import __Layout from './Layout.jsx';


export const PAGES = {
    "MonthlyReports": MonthlyReports,
    "NotificationSettings": NotificationSettings,
    "PassAnalytics": PassAnalytics,
    "PassDashboard": PassDashboard,
    "StudentForm": StudentForm,
    "StudentPass": StudentPass,
    "TeacherDashboard": TeacherDashboard,
    "Home": Home,
}

export const pagesConfig = {
    mainPage: "StudentForm",
    Pages: PAGES,
    Layout: __Layout,
};