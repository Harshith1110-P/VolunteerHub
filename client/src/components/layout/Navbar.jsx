import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HiOutlineMenu } from 'react-icons/hi';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';
  };

  return (
    <nav className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {user && (
          <button className="btn btn-ghost btn-icon" onClick={onToggleSidebar} style={{ display: 'none' }} id="sidebar-toggle">
            <HiOutlineMenu size={20} />
          </button>
        )}
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">🤝</span>
          <span>VolunteerHub</span>
        </Link>
      </div>

      <div className="navbar-links">
        {!user ? (
          <>
            <Link to="/" className={location.pathname === '/' ? 'nav-active' : ''}>Home</Link>
            <Link to="/login" className={location.pathname === '/login' ? 'nav-active' : ''}>Login</Link>
            <Link to="/register">
              <button className="btn btn-primary btn-sm">Get Started</button>
            </Link>
          </>
        ) : (
          <div className="nav-user">
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              {user.role === 'admin' ? '🛡️ Admin' : ''}
            </span>
            <div className="nav-avatar" title={user.name}>
              {getInitials(user.name)}
            </div>
            <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
