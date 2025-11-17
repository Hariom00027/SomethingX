import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Navbar from "./components/layout/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import AuthCallback from "./pages/AuthCallback";
import Dashboard from "./pages/Dashboard";
import UserProfile from "./pages/UserProfile";
import CareerBlueprint from "./pages/students/CareerBlueprint";
import EducationList from "./pages/students/education/EducationList";
import RoleList from "./pages/students/RoleList";
import IndustrySelection from "./pages/students/industry/IndustrySelection";
import RoleOrEducation from "./pages/students/industry/RoleOrEducation";
import EducationSelection from "./pages/students/industry/EducationSelection";
import SpecializationSelection from "./pages/students/education/SpecializationSelection";
import RoleSelection from "./pages/students/RoleSelection";
import JobDescription from "./pages/students/JobDescription";
import ResumeBuilder from "./pages/students/ResumeBuilder";
import CareerCounselling from "./pages/students/CareerCounselling";
import ApplyJobs from "./pages/students/ApplyJobs";
import Courses from "./pages/students/Courses";
import RoleReadyTraining from "./pages/students/RoleReadyTraining";
import InternshipManagement from "./pages/institutes/InternshipManagement";
import ExpertSessions from "./pages/institutes/ExpertSessions";
import ExpertDetails from "./pages/institutes/ExpertDetails";
import ExpertEnrollment from "./pages/institutes/ExpertEnrollment";
import Workshops from "./pages/institutes/Workshops";
import StudentTrainingRoleReady from "./pages/institutes/StudentTrainingRoleReady";
import ResumeAccess from "./pages/industry/ResumeAccess";
import PostJobs from "./pages/industry/PostJobs";
import RoleReadyFreshers from "./pages/industry/RoleReadyFreshers";
import RoleReadyFreshersRequest from "./pages/industry/RoleReadyFreshersRequest";
import AiInterview from "./pages/industry/AiInterview";
import AdminDashboard from "./pages/AdminDashboard";
import ResumeReview from "./pages/admin/ResumeReview";
import IndustryTrainingRequests from "./pages/admin/IndustryTrainingRequests";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          } />
          
          {/* Students */}
          <Route path="/students/career-blueprint" element={
            <ProtectedRoute requiredUserType="STUDENT">
              <CareerBlueprint />
            </ProtectedRoute>
          } />
          <Route path="/students/career-blueprint/education" element={
            <ProtectedRoute requiredUserType="STUDENT">
              <EducationList />
            </ProtectedRoute>
          } />
          <Route path="/students/career-blueprint/role" element={
            <ProtectedRoute requiredUserType="STUDENT">
              <RoleList />
            </ProtectedRoute>
          } />
          <Route path="/students/career-blueprint/industry" element={
            <ProtectedRoute requiredUserType="STUDENT">
              <IndustrySelection />
            </ProtectedRoute>
          } />
          <Route path="/students/career-blueprint/industry/:industryName" element={
            <ProtectedRoute requiredUserType="STUDENT">
              <RoleOrEducation />
            </ProtectedRoute>
          } />
          <Route path="/students/career-blueprint/industry/:industryName/roles" element={
            <ProtectedRoute requiredUserType="STUDENT">
              <RoleSelection />
            </ProtectedRoute>
          } />
          <Route path="/students/career-blueprint/industry/:industryName/education" element={
            <ProtectedRoute requiredUserType="STUDENT">
              <EducationSelection />
            </ProtectedRoute>
          } />
          <Route path="/students/career-blueprint/education/:educationName" element={
            <ProtectedRoute requiredUserType="STUDENT">
              <SpecializationSelection />
            </ProtectedRoute>
          } />
          <Route path="/students/career-blueprint/specialization/:specializationName/roles" element={
            <ProtectedRoute requiredUserType="STUDENT">
              <RoleSelection />
            </ProtectedRoute>
          } />
          <Route path="/students/career-blueprint/role/:roleName" element={
            <ProtectedRoute requiredUserType="STUDENT">
              <JobDescription />
            </ProtectedRoute>
          } />
          <Route path="/students/resume-builder" element={
            <ProtectedRoute requiredUserType="STUDENT">
              <ResumeBuilder />
            </ProtectedRoute>
          } />
          <Route path="/students/career-counselling" element={
            <ProtectedRoute requiredUserType="STUDENT">
              <CareerCounselling />
            </ProtectedRoute>
          } />
          <Route path="/students/apply-jobs" element={
            <ProtectedRoute requiredUserType="STUDENT">
              <ApplyJobs />
            </ProtectedRoute>
          } />
          <Route path="/students/courses" element={
            <ProtectedRoute requiredUserType="STUDENT">
              <Courses />
            </ProtectedRoute>
          } />
          <Route path="/students/role-ready-training" element={
            <ProtectedRoute requiredUserType="STUDENT">
              <RoleReadyTraining />
            </ProtectedRoute>
          } />
          
          {/* Institutes */}
          <Route path="/institutes/internship-management" element={
            <ProtectedRoute requiredUserType="INSTITUTE">
              <InternshipManagement />
            </ProtectedRoute>
          } />
          <Route path="/institutes/expert-sessions" element={
            <ProtectedRoute requiredUserType="INSTITUTE">
              <ExpertSessions />
            </ProtectedRoute>
          } />
          <Route path="/institutes/expert-sessions/:expertId" element={
            <ProtectedRoute requiredUserType="INSTITUTE">
              <ExpertDetails />
            </ProtectedRoute>
          } />
          <Route path="/institutes/expert-sessions/:expertId/enroll" element={
            <ProtectedRoute requiredUserType="INSTITUTE">
              <ExpertEnrollment />
            </ProtectedRoute>
          } />
          <Route path="/institutes/workshops" element={
            <ProtectedRoute requiredUserType="INSTITUTE">
              <Workshops />
            </ProtectedRoute>
          } />
          <Route path="/institutes/student-training-role-ready" element={
            <ProtectedRoute requiredUserType="INSTITUTE">
              <StudentTrainingRoleReady />
            </ProtectedRoute>
          } />
          
          {/* Industry */}
          <Route path="/industry/resume-access" element={
            <ProtectedRoute requiredUserType="INDUSTRY">
              <ResumeAccess />
            </ProtectedRoute>
          } />
          <Route path="/industry/post-jobs" element={
            <ProtectedRoute requiredUserType="INDUSTRY">
              <PostJobs />
            </ProtectedRoute>
          } />
          <Route path="/industry/role-ready-freshers" element={
            <ProtectedRoute requiredUserType="INDUSTRY">
              <RoleReadyFreshers />
            </ProtectedRoute>
          } />
          <Route path="/industry/role-ready-freshers/request" element={
            <ProtectedRoute requiredUserType="INDUSTRY">
              <RoleReadyFreshersRequest />
            </ProtectedRoute>
          } />
          <Route path="/industry/ai-interview" element={
            <ProtectedRoute requiredUserType="INDUSTRY">
              <AiInterview />
            </ProtectedRoute>
          } />
          
          {/* Admin */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/resume-review" element={
            <ProtectedRoute requiredRole="ADMIN">
              <ResumeReview />
            </ProtectedRoute>
          } />
          <Route path="/admin/industry-training" element={
            <ProtectedRoute requiredRole="ADMIN">
              <IndustryTrainingRequests />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;