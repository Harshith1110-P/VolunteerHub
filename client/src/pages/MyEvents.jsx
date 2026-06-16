import { useState, useEffect } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';

const MyEvents = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const res = await API.get('/events/my-registrations');
      setRegistrations(res.data.data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnregister = async (eventId) => {
    try {
      await API.delete(`/events/${eventId}/unregister`);
      toast.success('Unregistered from event');
      fetchRegistrations();
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

  if (loading) {
    return <div className="page-loader"><div className="spinner"></div></div>;
  }

  return (
    <div className="page-content animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Events</h1>
          <p className="page-subtitle">{registrations.length} registered events</p>
        </div>
      </div>

      {registrations.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <div className="empty-title">No registered events</div>
            <div className="empty-description">Browse available events and sign up to get started!</div>
          </div>
        </div>
      ) : (
        <div className="grid-cards">
          {registrations.map((reg) => {
            const event = reg.event;
            if (!event) return null;
            return (
              <div className="event-card" key={reg._id}>
                <div className="event-image" style={{
                  background: event.category === 'cleanup' ? 'var(--gradient-success)' :
                    event.category === 'education' ? 'var(--gradient-primary)' :
                    event.category === 'healthcare' ? 'var(--gradient-secondary)' :
                    'var(--gradient-warm)',
                }}>
                  <span style={{ fontSize: '2.5rem' }}>{getCategoryEmoji(event.category)}</span>
                  <span className={`badge badge-${reg.status}`} style={{
                    position: 'absolute', top: '12px', right: '12px'
                  }}>
                    {reg.status}
                  </span>
                </div>
                <div className="event-body">
                  <div className="event-title">{event.title}</div>
                  <div className="event-meta">
                    <div className="event-meta-item">📅 {formatDate(event.date)}</div>
                    <div className="event-meta-item">📍 {event.location}</div>
                    <div className="event-meta-item">⏱️ {reg.hoursWorked || 0} hours logged</div>
                  </div>
                  <div className="event-footer">
                    <span className={`badge badge-${event.status}`}>{event.status}</span>
                    {reg.status === 'registered' && (
                      <button className="btn btn-secondary btn-sm" onClick={() => handleUnregister(event._id)}>
                        Cancel Registration
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

export default MyEvents;
