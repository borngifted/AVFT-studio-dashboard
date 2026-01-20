import StudentForm from './pages/StudentForm';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentPass from './pages/StudentPass';


export const PAGES = {
    "StudentForm": StudentForm,
    "TeacherDashboard": TeacherDashboard,
    "StudentPass": StudentPass,
}

export const pagesConfig = {
    mainPage: "StudentForm",
    Pages: PAGES,
};