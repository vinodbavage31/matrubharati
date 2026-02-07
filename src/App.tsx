import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// Public pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import SetPassword from "./pages/SetPassword";
import NotFound from "./pages/NotFound";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminTeachers from "./pages/admin/AdminTeachers";
import AdminClasses from "./pages/admin/AdminClasses";
import AdminAcademics from "./pages/admin/AdminAcademics";
import AdminSettings from "./pages/admin/AdminSettings";

// Teacher pages
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import TeacherMarks from "./pages/teacher/TeacherMarks";
import TeacherAttendance from "./pages/teacher/TeacherAttendance";
import TeacherStudents from "./pages/teacher/TeacherStudents";
import TeacherProfile from "./pages/teacher/TeacherProfile";

// Student pages
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentMarks from "./pages/student/StudentMarks";
import StudentRankings from "./pages/student/StudentRankings";
import StudentAttendance from "./pages/student/StudentAttendance";
import StudentProgress from "./pages/student/StudentProgress";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/set-password" element={<SetPassword />} />

            {/* Admin routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/students"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminStudents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/teachers"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminTeachers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/classes"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminClasses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/academics"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminAcademics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminSettings />
                </ProtectedRoute>
              }
            />

            {/* Teacher routes */}
            <Route
              path="/teacher"
              element={
                <ProtectedRoute allowedRoles={["teacher"]}>
                  <TeacherDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/marks"
              element={
                <ProtectedRoute allowedRoles={["teacher"]}>
                  <TeacherMarks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/attendance"
              element={
                <ProtectedRoute allowedRoles={["teacher"]}>
                  <TeacherAttendance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/students"
              element={
                <ProtectedRoute allowedRoles={["teacher"]}>
                  <TeacherStudents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/profile"
              element={
                <ProtectedRoute allowedRoles={["teacher"]}>
                  <TeacherProfile />
                </ProtectedRoute>
              }
            />

            {/* Student/Parent routes */}
            <Route
              path="/student"
              element={
                <ProtectedRoute allowedRoles={["student", "parent"]}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/marks"
              element={
                <ProtectedRoute allowedRoles={["student", "parent"]}>
                  <StudentMarks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/rankings"
              element={
                <ProtectedRoute allowedRoles={["student", "parent"]}>
                  <StudentRankings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/attendance"
              element={
                <ProtectedRoute allowedRoles={["student", "parent"]}>
                  <StudentAttendance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/progress"
              element={
                <ProtectedRoute allowedRoles={["student", "parent"]}>
                  <StudentProgress />
                </ProtectedRoute>
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
