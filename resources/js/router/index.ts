import { createRouter, createWebHistory } from "vue-router";
import Login from "../components/Authentication/Login.vue";

const router = createRouter({
    history: createWebHistory('/'),
    routes: [
        { path: '/', component: () => import('../components/Home.vue'), meta: { requiresAuth: true } },
        { path: '/dashboard', component: () => import('../components/Home.vue'), meta: { requiresAuth: true } },
        { path: '/students', component: () => import('../components/HomePage/Students.vue'), meta: { requiresAuth: true } },
        { path: '/students/add', component: () => import('../components/DataEntry/AddStudent.vue'), meta: { requiresAuth: true } },
        { path: '/students/:studentId', name: 'StudentDetails', component: () => import('../components/DetailPages/StudentDetails/StudentDetails.vue'), meta: { requiresAuth: true }, props: true },

        { path: '/lecturers', component: () => import('../components/HomePage/Lecturers.vue'), meta: { requiresAuth: true } },
        { path: '/lecturers/add', name: 'AddLecturer', component: () => import('../components/DataEntry/AddLecturer.vue'), meta: { requiresAuth: true }, props: true },
        { path: '/lecturers/:lecturerId', name: 'LecturerDetails', component: () => import('../components/DetailPages/LecturerDetails/LecturerDetails.vue'), meta: { requiresAuth: true }, props: true },

        { path: '/classes', component: () => import('../components/HomePage/Classes.vue'), meta: { requiresAuth: true } },
        { path: '/classes/add', component: () => import('../components/DataEntry/AddClass.vue'), meta: { requiresAuth: true } },
        { path: '/classes/:classId', name: 'ClassDetails', component: () => import('../components/DetailPages/ClassDetails/ClassDetails.vue'), meta: { requiresAuth: true }, props: true },


        { path: '/login', component: Login, meta: { requiresAuth: false } },
    ],
});

router.beforeEach((to, from, next) => {
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
    const isAuthenticated = !!localStorage.getItem("user"); // Check if user exists in local storage

    if (requiresAuth && !isAuthenticated) {
        // Redirect to login if not authenticated
        next('/login');
    } else if (!requiresAuth && isAuthenticated && to.path === '/login') {
        // Redirect authenticated users away from login page
        next('/');
    } else {
        next(); // Proceed as normal
    }
});

export default router;
