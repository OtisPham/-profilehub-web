import { Routes, Route } from 'react-router-dom';

import Login from '../src/pages/auth/Login';
import Dashboard from '../src/pages/student/Dashboard';
import Register from '../src/pages/auth/Register'; 
import Logout from '../src/pages/auth/Logout';
import MyProfile from './pages/student/MyProfile';
import Achievements from './pages/student/MyAchievements';
import Projects from './pages/student/MyProjects';
import CVBuilder from './pages/student/CVBuilder';
import Certificates from './pages/student/Certificates';
import VerificationInbox from './pages/teacher/VerificationInbox';
import TeacherProfile from './pages/teacher/TeacherProfile';
import CandidateSearch from './pages/recruiter/CandidateSearch';
import CandidatePipeline from './pages/recruiter/CandidatePipeline';
import SavedCandidates from './pages/recruiter/SavedCandidates';
import JobManagement from './pages/recruiter/JobManagement';
import AIRecruitmentAssistant from './pages/recruiter/AIRecruitmentAssistant';
import RecruiterProfile from './pages/recruiter/RecruiterProfile';
import AIInterviewPrep from './pages/student/AIInterviewPrep';
import { PortfolioMatchPage } from './pages/student/PortfolioMatchPage';
import StudentJobs from './pages/student/StudentJobs';
import MainLayout from './components/layout/MainLayout';

import PublicVerificationView from './pages/public/PublicVerificationView';

function App() {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} /> 
      <Route path="/register" element={<Register />} />
      <Route path="/logout" element={<Logout />} />
      <Route path="/verify/:verificationCode" element={<PublicVerificationView />} />

      {/* Persistent App Layout with Single Mounted Sidebar */}
      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<Dashboard />} /> 
        <Route path="/profile" element={<MyProfile />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/cv-builder" element={<CVBuilder />} />
        <Route path="/interview-prep" element={<AIInterviewPrep />} />
        <Route path="/portfolio-match" element={<PortfolioMatchPage />} />
        <Route path="/student/jobs" element={<StudentJobs />} />
        <Route path="/certificates" element={<Certificates />}/>
        <Route path="/teacher/profile" element={<TeacherProfile />} />
        <Route path="/teacher/inbox" element={<VerificationInbox />} />
        <Route path="/recruiter/profile" element={<RecruiterProfile />} />
        <Route path="/recruiter/ai-assistant" element={<AIRecruitmentAssistant />} />
        <Route path="/recruiter/search" element={<CandidateSearch />} />
        <Route path="/recruiter/pipeline" element={<CandidatePipeline />} />
        <Route path="/recruiter/saved" element={<SavedCandidates />} />
        <Route path="/recruiter/jobs" element={<JobManagement />} />
      </Route>

      {/* 404 Route */}
      <Route 
        path="*" 
        element={<h2 style={{ textAlign: 'center', color: 'red', marginTop: '50px' }}>404 - Không tìm thấy trang</h2>} 
      />
    </Routes>
  );
}

export default App;