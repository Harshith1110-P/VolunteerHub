import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';

const BrowseEvents = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    fetchData();
  }, [categoryFilter]);

  const fetchData = async () => {
    try {
      const params = new URLSearchParams();
      if (categoryFilter) params.append('category', categoryFilter);
      params.append('status', 'upcoming');
      params.append('limit', 50);

      const [eventsRes, regRes] = await Promise.all([
        API.get(`/events?${params.toString()}`),
        API.get('/events/my-registrations')
      ]);
      setEvents(eventsRes.data.data || []);
      setMyRegistrations(regRes.data.data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const isRegistered = (eventId) => {
    return myRegistrations.some(r => r.event?._id === eventId);
  };

  const handleRegister = async (eventId) => {
    try {
      await API.post(`/events/${eventId}/register`);
      toast.success('Successfully registered for event!');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    }
  };

  const handleUnregister = async (eventId) => {
    try {
      await API.delete(`/events/${eventId}/unregister`);
      toast.success('Unregistered from event');
      fetchData();
    } catch (error) {
      toast.error('Failed to unregister');
    }
  };

  const getCategoryEmoji = (cat) => {
    const emojis = {
      'cleanup': '🧹', 'education': '📚', 'healthcare': '🏥',
      'food-drive': '🍲', 'animal-welfare': '🐾', 'elderly-care': '👴', 'other': '✨'
    };
    return emojis[cat] || '✨';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' 
    });
  };

  const categories = ['cleanup', 'education', 'healthcare', 'food-drive', 'animal-welfare', 'elderly-care', 'other'];

  if (loading) {
    return (
      <div className="page-loader">
        <div className="spinner"></div>
        <span className="loader-text">Loading events...</span>
      </div>
    );
  }

  return (
    <div className="page-content animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Browse Events</h1>
          <p className="page-subtitle">Find volunteer opportunities that match your interests</p>
        </div>
      </div>

      {/* Category Filters */}
      <div className="filter-bar" style={{ marginBottom: 'var(--space-xl)' }}>
        <button className={`filter-chip ${categoryFilter === '' ? 'active' : ''}`} onClick={() => setCategoryFilter('')}>
          All Events
        </button>
        {categories.map(cat => (
          <button key={cat} className={`filter-chip ${categoryFilter === cat ? 'active' : ''}`} onClick={() => setCategoryFilter(cat)}>
            {getCategoryEmoji(cat)} {cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')}
          </button>
        ))}
      </div>

      {events.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <div className="empty-title">No upcoming events</div>
            <div className="empty-description">Check back later for new volunteer opportunities.</div>
          </div>
        </div>
      ) : (
        <div className="grid-cards">
          {events.map((event) => {
            const registered = isRegistered(event._id);
            const isFull = event.currentVolunteers >= event.maxVolunteers;

            return (
              <div className="event-card" key={event._id}>
                <div className="event-image" style={{
                  background: event.category === 'cleanup' ? 'var(--gradient-success)' :
                    event.category === 'education' ? 'var(--gradient-primary)' :
                    event.category === 'healthcare' ? 'var(--gradient-secondary)' :
                    'var(--gradient-warm)',
                }}>
                  <span style={{ fontSize: '2.5rem' }}>{getCategoryEmoji(event.category)}</span>
                  {registered && (
                    <span className="badge badge-success" style={{
                      position: 'absolute', top: '12px', left: '12px'
                    }}>
                      ✓ Registered
                    </span>
                  )}
                  {isFull && !registered && (
                    <span className="badge badge-danger" style={{
                      position: 'absolute', top: '12px', right: '12px'
                    }}>
                      Full
                    </span>
                  )}
                </div>
                <div className="event-body">
                  <div className="event-title">{event.title}</div>
                  <div className="event-meta">
                    <div className="event-meta-item">📅 {formatDate(event.date)}</div>
                    <div className="event-meta-item">📍 {event.location}</div>
                  </div>
                  <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-md)', lineHeight: 1.5 }}>
                    {event.description?.substring(0, 120)}{event.description?.length > 120 ? '...' : ''}
                  </p>
                  <div style={{ marginBottom: 'var(--space-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>
                      <span>Spots filled</span>
                      <span>{event.currentVolunteers}/{event.maxVolunteers}</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ 
                        width: `${Math.min((event.currentVolunteers / event.maxVolunteers) * 100, 100)}%`,
                        background: isFull ? 'var(--color-danger)' : undefined
                      }}></div>
                    </div>
                  </div>
                  <div className="event-footer">
                    <span className={`badge badge-${event.category}`} style={{ textTransform: 'capitalize' }}>
                      {event.category?.replace('-', ' ')}
                    </span>
                    {registered ? (
                      <button className="btn btn-secondary btn-sm" onClick={() => handleUnregister(event._id)}>
                        Cancel Registration
                      </button>
                    ) : (
                      <button 
                        className="btn btn-primary btn-sm" 
                        onClick={() => handleRegister(event._id)}
                        disabled={isFull}
                      >
                        {isFull ? 'Event Full' : 'Register'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BrowseEvents;
