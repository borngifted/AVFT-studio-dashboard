import PassDashboard from './pages/PassDashboard';
import StudentForm from './pages/StudentForm';
import StudentPass from './pages/StudentPass';
import TeacherDashboard from './pages/TeacherDashboard';
import PassAnalytics from './pages/PassAnalytics';
import NotificationSettings from './pages/NotificationSettings';
import MonthlyReports from './pages/MonthlyReports';
import __Layout from './Layout.jsx';


export const PAGES = {
    "PassDashboard": PassDashboard,
    "StudentForm": StudentForm,
    "StudentPass": StudentPass,
    "TeacherDashboard": TeacherDashboard,
    "PassAnalytics": PassAnalytics,
    "NotificationSettings": NotificationSettings,
    "MonthlyReports": MonthlyReports,
}

export const pagesConfig = {
    mainPage: "StudentForm",
    Pages: PAGES,
    Layout: __Layout,
};