import StudentForm from './pages/StudentForm';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentPass from './pages/StudentPass';
import PassDashboard from './pages/PassDashboard';


export const PAGES = {
    "StudentForm": StudentForm,
    "TeacherDashboard": TeacherDashboard,
    "StudentPass": StudentPass,
    "PassDashboard": PassDashboard,
}

export const pagesConfig = {
    mainPage: "StudentForm",
    Pages: PAGES,
};