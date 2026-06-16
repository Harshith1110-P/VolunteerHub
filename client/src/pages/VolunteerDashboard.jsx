import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import { HiOutlineCalendar, HiOutlineClock, HiOutlineClipboardList, HiOutlineArrowRight } from 'react-icons/hi';

const VolunteerDashboard = () => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [regRes, eventsRes] = await Promise.all([
        API.get('/events/my-registrations'),
        API.get('/events?status=upcoming&limit=6')
      ]);
      setRegistrations(regRes.data.data || []);
      setEvents(eventsRes.data.data || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryEmoji = (category) => {
    const emojis = {
      'cleanup': '🧹', 'education': '📚', 'healthcare': '🏥',
      'food-drive': '🍲', 'animal-welfare': '🐾', 'elderly-care': '👴', 'other': '✨'
    };
    return emojis[category] || '✨';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="page-loader">
        <div className="spinner"></div>
        <span className="loader-text">Loading your dashboard...</span>
      </div>
    );
  }

  return (
    <div className="page-content animate-fade-in">
      {/* Welcome Card */}
      <div className="dashboard-welcome">
        <h2>Welcome back, {user?.name?.split(' ')[0]}! 👋</h2>
        <p>Here's what's happening with your volunteer activities.</p>
      </div>

      {/* Stats */}
      <div className="grid-stats" style={{ marginBottom: 'var(--space-2xl)' }}>
        <div className="stat-card purple">
          <div className="stat-icon">
            <HiOutlineClipboardList />
          </div>
          <div className="stat-value">{registrations.length}</div>
          <div className="stat-label">Events Joined</div>
        </div>
        <div className="stat-card cyan">
          <div className="stat-icon">
            <HiOutlineClock />
          </div>
          <div className="stat-value">{user?.hoursLogged || 0}</div>
          <div className="stat-label">Hours Volunteered</div>
        </div>
        <div className="stat-card pink">
          <div className="stat-icon">
            <HiOutlineCalendar />
          </div>
          <div className="stat-value">{events.length}</div>
          <div className="stat-label">Upcoming Events</div>
        </div>
      </div>

      {/* My Registered Events */}
      <div className="card" style={{ marginBottom: 'var(--space-2xl)' }}>
        <div className="card-header">
          <div>
            <div className="card-title">My Registered Events</div>
            <div className="card-subtitle">Events you've signed up for</div>
          </div>
          <Link to="/my-events" className="btn btn-ghost btn-sm">
            View All <HiOutlineArrowRight />
          </Link>
        </div>

        {registrations.length === 0 ? (
          <div className="empty-state" style={{ padding: 'var(--space-2xl)' }}>
            <div className="empty-icon">📋</div>
            <div className="empty-title">No events yet</div>
            <div className="empty-description">
              Browse upcoming events and sign up to start your volunteer journey!
            </div>
            <Link to="/events">
              <button className="btn btn-primary">Browse Events</button>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {registrations.slice(0, 5).map((reg) => (
              <div key={reg._id} className="activity-item">
                <div className="activity-avatar" style={{ 
                  background: 'var(--bg-tertiary)', 
                  fontSize: '1.2rem' 
                }}>
                  {getCategoryEmoji(reg.event?.category)}
                </div>
                <div className="activity-content" style={{ flex: 1 }}>
                  <div className="activity-text">
                    <strong>{reg.event?.title || 'Event'}</strong>
                  </div>
                  <div className="activity-time">
                    {reg.event?.date ? formatDate(reg.event.date) : 'Date TBD'} • {reg.event?.location || 'Location TBD'}
                  </div>
                </div>
                <span className={`badge badge-${reg.status}`}>{reg.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Events */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Upcoming Events</div>
            <div className="card-subtitle">Find your next volunteer opportunity</div>
          </div>
          <Link to="/events" className="btn btn-ghost btn-sm">
            View All <HiOutlineArrowRight />
          </Link>
        </div>

        <div className="grid-cards">
          {events.slice(0, 3).map((event) => (
            <div className="event-card" key={event._id}>
              <div className="event-image" style={{
                background: event.category === 'cleanup' ? 'var(--gradient-success)' :
                  event.category === 'education' ? 'var(--gradient-primary)' :
                  event.category === 'healthcare' ? 'var(--gradient-secondary)' :
                  'var(--gradient-warm)',
                height: '120px'
              }}>
                <span style={{ fontSize: '2rem' }}>{getCategoryEmoji(event.category)}</span>
                <span className={`badge badge-${event.status}`} style={{
                  position: 'absolute', top: '12px', right: '12px'
                }}>
                  {event.status}
                </span>
              </div>
              <div className="event-body">
                <div className="event-title">{event.title}</div>
                <div className="event-meta">
                  <div className="event-meta-item">📅 {formatDate(event.date)}</div>
                  <div className="event-meta-item">📍 {event.location}</div>
                </div>
                <div className="event-footer">
                  <div style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>
                    {event.currentVolunteers}/{event.maxVolunteers} volunteers
                  </div>
                  <div className="progress-bar" style={{ width: '80px' }}>
                    <div className="progress-fill" style={{ 
                      width: `${Math.min((event.currentVolunteers / event.maxVolunteers) * 100, 100)}%` 
                    }}></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VolunteerDashboard;
