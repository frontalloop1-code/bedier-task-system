import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './auth/ProtectedRoute.jsx';
import { Shell } from './components/layout/Shell.jsx';

import Login from './pages/auth/Login.jsx';
import AdminDashboard from './pages/admin/Dashboard.jsx';
import AdminTasks from './pages/admin/Tasks.jsx';
import AdminTaskForm from './pages/admin/TaskForm.jsx';
import AdminUsers from './pages/admin/Users.jsx';
import AdminTeams from './pages/admin/Teams.jsx';
import AdminLeaderboards from './pages/admin/Leaderboards.jsx';
import AdminActivity from './pages/admin/ActivityLog.jsx';
import AdminSettings from './pages/admin/Settings.jsx';

import MyDashboard from './pages/employee/MyDashboard.jsx';
import Profile from './pages/employee/Profile.jsx';
import Notifications from './pages/shared/Notifications.jsx';
import TaskDetail from './pages/shared/TaskDetail.jsx';

import TeamDashboard from './pages/manager/TeamDashboard.jsx';
import ReviewQueue from './pages/manager/ReviewQueue.jsx';

import Forbidden from './pages/shared/Forbidden.jsx';
import NotFound from './pages/shared/NotFound.jsx';
import { useAuth } from './auth/AuthContext.jsx';

function HomeRedirect() {
  const { user, ready } = useAuth();
  if (!ready) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'SUPER_ADMIN') return <Navigate to="/admin" replace />;
  if (user.role === 'TEAM_MANAGER') return <Navigate to="/team" replace />;
  return <Navigate to="/me" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/403" element={<Forbidden />} />

      <Route
        element={
          <ProtectedRoute>
            <Shell />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<HomeRedirect />} />

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={['SUPER_ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/tasks"
          element={
            <ProtectedRoute roles={['SUPER_ADMIN', 'TEAM_MANAGER']}>
              <AdminTasks />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/tasks/new"
          element={
            <ProtectedRoute roles={['SUPER_ADMIN', 'TEAM_MANAGER']}>
              <AdminTaskForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute roles={['SUPER_ADMIN']}>
              <AdminUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/teams"
          element={
            <ProtectedRoute roles={['SUPER_ADMIN']}>
              <AdminTeams />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/leaderboards"
          element={
            <ProtectedRoute>
              <AdminLeaderboards />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/activity"
          element={
            <ProtectedRoute roles={['SUPER_ADMIN']}>
              <AdminActivity />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute roles={['SUPER_ADMIN']}>
              <AdminSettings />
            </ProtectedRoute>
          }
        />

        {/* Manager */}
        <Route
          path="/team"
          element={
            <ProtectedRoute roles={['SUPER_ADMIN', 'TEAM_MANAGER']}>
              <TeamDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/review"
          element={
            <ProtectedRoute roles={['SUPER_ADMIN', 'TEAM_MANAGER']}>
              <ReviewQueue />
            </ProtectedRoute>
          }
        />

        {/* Employee + shared */}
        <Route path="/me" element={<MyDashboard />} />
        <Route path="/me/profile" element={<Profile />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/tasks/:id" element={<TaskDetail />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
