import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Auth & Layout
import Login from './pages/Login'; 
import RegisterPage from './pages/RegisterPage';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import MainLayout from './components/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Feature Pages
import Dashboard from './pages/Dashboard';
import MyProjects from './pages/MyProjects';
import JoinedProjects from './pages/JoinedProjects';
import MyTasks from './pages/MyTask';
import Messages from './pages/Chat';
import Contacts from './pages/Contact';
import AcceptInvite from './pages/AcceptInvite';

// Project Workspace Pages (The ones we just created)
import ProjectWorkspace from './pages/project/ProjectWorkspace';
import ProjectSummary from './pages/project/ProjectSummary';
import ProjectBoard from './pages/project/ProjectBoard';
import ProjectBacklog from './pages/project/ProjectBacklog';
import TaskDetail from './pages/TaskDetail';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:uidb64/:token" element={<ResetPassword />} />
        
        {/* Invite Route (External link from Email) */}
        <Route path="invite/:token" element={<AcceptInvite />} />

        {/* Protected Private Routes */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          {/* Default Redirect */}
          <Route index element={<Navigate to="/dashboard" replace />} />
          
          {/* Main Sidebar Pages */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="my-projects" element={<MyProjects />} />
          <Route path="joined-projects" element={<JoinedProjects />} />
          <Route path="tasks" element={<MyTasks />}/>
          <Route path="messages" element={<Messages />} />
          <Route path="contact" element={<Contacts />} />
          

          {/* --- NEW: Project Workspace Nested Routes --- */}
          {/* When a user clicks a project, they enter this sub-section */}
          <Route path="projects/:id" element={<ProjectWorkspace />}>
            {/* Redirect /projects/12 to /projects/12/summary */}
            <Route index element={<Navigate to="summary" replace />} />
            
            <Route path="summary" element={<ProjectSummary />} />
            <Route path="board" element={<ProjectBoard />} />
            <Route path="backlog" element={<ProjectBacklog />} />
            <Route path="task/:taskId" element={<TaskDetail />} />

          </Route>
          {/* -------------------------------------------- */}

        </Route>

        {/* Catch-all Redirect to Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;