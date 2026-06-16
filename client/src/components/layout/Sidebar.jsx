import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  HiOutlineViewGrid, 
  HiOutlineUsers, 
  HiOutlineCalendar, 
  HiOutlineChartBar, 
  HiOutlineUser,
  HiOutlineClipboardList,
  HiOutlineCog
} from 'react-icons/hi';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const isActive = (path) => location.pathname === path;

  const adminLinks = [
    { to: '/admin', icon: <HiOutlineViewGrid />, label: 'Dashboard' },
    { to: '/admin/volunteers', icon: <HiOutlineUsers />, label: 'Volunteers' },
    { to: '/admin/events', icon: <HiOutlineCalendar />, label: 'Events' },
    { to: '/admin/reports', icon: <HiOutlineChartBar />, label: 'Reports' },
  ];

  const volunteerLinks = [
    { to: '/dashboard', icon: <HiOutlineViewGrid />, label: 'Dashboard' },
    { to: '/events', icon: <HiOutlineCalendar />, label: 'Browse Events' },
    { to: '/my-events', icon: <HiOutlineClipboardList />, label: 'My Events' },
  ];

  const links = user.role === 'admin' ? adminLinks : volunteerLinks;

  return (
    <aside className="sidebar">
      <div className="sidebar-nav">
        <div className="sidebar-section">
          <div className="sidebar-section-title">
            {user.role === 'admin' ? 'Administration' : 'Navigation'}
          </div>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={`sidebar-link ${isActive(link.to) ? 'active' : ''}`}
            >
              <span className="link-icon">{link.icon}</span>
              <span>{link.label}</span>
            </NavLink>
          ))}
        </div>

        <div className="sidebar-section">
          <div className="sidebar-section-title">Account</div>
          <NavLink
            to="/profile"
            className={`sidebar-link ${isActive('/profile') ? 'active' : ''}`}
          >
            <span className="link-icon"><HiOutlineUser /></span>
            <span>My Profile</span>
          </NavLink>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
