import PassDashboard from './pages/PassDashboard';
import StudentForm from './pages/StudentForm';
import StudentPass from './pages/StudentPass';
import TeacherDashboard from './pages/TeacherDashboard';
import __Layout from './Layout.jsx';


export const PAGES = {
    "PassDashboard": PassDashboard,
    "StudentForm": StudentForm,
    "StudentPass": StudentPass,
    "TeacherDashboard": TeacherDashboard,
}

export const pagesConfig = {
    mainPage: "StudentForm",
    Pages: PAGES,
    Layout: __Layout,
};