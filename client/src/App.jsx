import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VolunteerDashboard from './pages/VolunteerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ManageVolunteers from './pages/ManageVolunteers';
import ManageEvents from './pages/ManageEvents';
import BrowseEvents from './pages/BrowseEvents';
import MyEvents from './pages/MyEvents';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import './index.css';

// Protected Route wrapper
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="page-loader">
        <div className="spinner"></div>
        <span className="loader-text">Loading...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }

  return children;
};

// Public-only route (redirect if logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="page-loader">
        <div className="spinner"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }

  return children;
};

// Layout with sidebar for authenticated pages
const AuthenticatedLayout = ({ children }) => {
  const { user } = useAuth();

  return (
    <div className="app-layout">
      {user && <Sidebar />}
      <div className={`main-content ${!user ? 'no-sidebar' : ''}`}>
        {children}
      </div>
    </div>
  );
};

function AppContent() {
  const { user } = useAuth();

  return (
    <>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

        {/* Volunteer Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute requiredRole="volunteer">
            <AuthenticatedLayout><VolunteerDashboard /></AuthenticatedLayout>
          </ProtectedRoute>
        } />
        <Route path="/events" element={
          <ProtectedRoute>
            <AuthenticatedLayout><BrowseEvents /></AuthenticatedLayout>
          </ProtectedRoute>
        } />
        <Route path="/my-events" element={
          <ProtectedRoute>
            <AuthenticatedLayout><MyEvents /></AuthenticatedLayout>
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <AuthenticatedLayout><Profile /></AuthenticatedLayout>
          </ProtectedRoute>
        } />

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute requiredRole="admin">
            <AuthenticatedLayout><AdminDashboard /></AuthenticatedLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/volunteers" element={
          <ProtectedRoute requiredRole="admin">
            <AuthenticatedLayout><ManageVolunteers /></AuthenticatedLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/events" element={
          <ProtectedRoute requiredRole="admin">
            <AuthenticatedLayout><ManageEvents /></AuthenticatedLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/reports" element={
          <ProtectedRoute requiredRole="admin">
            <AuthenticatedLayout><Reports /></AuthenticatedLayout>
          </ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1a1a2e',
              color: '#f0f0f5',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '10px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.875rem'
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: '#1a1a2e' }
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#1a1a2e' }
            }
          }}
        />
      </AuthProvider>
    </Router>
  );
}

export default App;
