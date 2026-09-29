import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './api/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Apply from './pages/Apply';
import ApplicationDetail from './pages/ApplicationDetail';
import OfficerDashboard from './pages/OfficerDashboard';
import OfficerReviews from './pages/OfficerReviews';
import OfficerAudit from './pages/OfficerAudit';

function Protected({ role, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={user.role === 'officer' ? '/officer' : '/dashboard'} replace />;
  return children;
}

function Home() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'officer' ? '/officer' : '/dashboard'} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Protected role="citizen"><Dashboard /></Protected>} />
      <Route path="/apply" element={<Protected role="citizen"><Apply /></Protected>} />
      <Route path="/application/:id" element={<Protected><ApplicationDetail /></Protected>} />
      <Route path="/officer" element={<Protected role="officer"><OfficerDashboard /></Protected>} />
      <Route path="/officer/reviews" element={<Protected role="officer"><OfficerReviews /></Protected>} />
      <Route path="/officer/audit" element={<Protected role="officer"><OfficerAudit /></Protected>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
