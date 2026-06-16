import { useState, useEffect } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { HiOutlineSearch, HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineX } from 'react-icons/hi';

const ManageEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '', description: '', date: '', endDate: '', location: '',
    category: 'other', maxVolunteers: 10, status: 'upcoming'
  });

  useEffect(() => {
    fetchEvents();
  }, [search, categoryFilter]);

  const fetchEvents = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (categoryFilter) params.append('category', categoryFilter);
      params.append('limit', 50);

      const res = await API.get(`/events?${params.toString()}`);
      setEvents(res.data.data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEvent) {
        await API.put(`/events/${editingEvent._id}`, formData);
        toast.success('Event updated successfully');
      } else {
        await API.post('/events', formData);
        toast.success('Event created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchEvents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date ? new Date(event.date).toISOString().slice(0, 16) : '',
      endDate: event.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : '',
      location: event.location,
      category: event.category,
      maxVolunteers: event.maxVolunteers,
      status: event.status
    });
    setShowModal(true);
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This will also remove all registrations.`)) return;
    try {
      await API.delete(`/events/${id}`);
      toast.success('Event deleted');
      fetchEvents();
    } catch (error) {
      toast.error('Failed to delete event');
    }
  };

  const resetForm = () => {
    setEditingEvent(null);
    setFormData({
      title: '', description: '', date: '', endDate: '', location: '',
      category: 'other', maxVolunteers: 10, status: 'upcoming'
    });
  };

  const getCategoryEmoji = (cat) => {
    const emojis = {
      'cleanup': '🧹', 'education': '📚', 'healthcare': '🏥',
      'food-drive': '🍲', 'animal-welfare': '🐾', 'elderly-care': '👴', 'other': '✨'
    };
    return emojis[cat] || '✨';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const categories = ['cleanup', 'education', 'healthcare', 'food-drive', 'animal-welfare', 'elderly-care', 'other'];

  return (
    <div className="page-content animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Manage Events</h1>
          <p className="page-subtitle">{events.length} events</p>
        </div>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
          <HiOutlinePlus /> Create Event
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)', flexWrap: 'wrap' }}>
        <div className="search-bar" style={{ flex: 1, minWidth: '250px' }}>
          <HiOutlineSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-bar">
          <button className={`filter-chip ${categoryFilter === '' ? 'active' : ''}`} onClick={() => setCategoryFilter('')}>All</button>
          {categories.map(cat => (
            <button key={cat} className={`filter-chip ${categoryFilter === cat ? 'active' : ''}`} onClick={() => setCategoryFilter(cat)}>
              {getCategoryEmoji(cat)} {cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Event Cards */}
      {loading ? (
        <div className="page-loader"><div className="spinner"></div></div>
      ) : events.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <div className="empty-title">No events found</div>
            <div className="empty-description">Create your first volunteer event to get started.</div>
            <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
              <HiOutlinePlus /> Create Event
            </button>
          </div>
        </div>
      ) : (
        <div className="grid-cards">
          {events.map((event) => (
            <div className="event-card" key={event._id}>
              <div className="event-image" style={{
                background: event.category === 'cleanup' ? 'var(--gradient-success)' :
                  event.category === 'education' ? 'var(--gradient-primary)' :
                  event.category === 'healthcare' ? 'var(--gradient-secondary)' :
                  'var(--gradient-warm)',
              }}>
                <span style={{ fontSize: '2.5rem' }}>{getCategoryEmoji(event.category)}</span>
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
                <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-md)', lineHeight: 1.5 }}>
                  {event.description?.substring(0, 100)}{event.description?.length > 100 ? '...' : ''}
                </p>
                <div style={{ marginBottom: 'var(--space-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>
                    <span>Volunteers</span>
                    <span>{event.currentVolunteers}/{event.maxVolunteers}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ 
                      width: `${Math.min((event.currentVolunteers / event.maxVolunteers) * 100, 100)}%` 
                    }}></div>
                  </div>
                </div>
                <div className="event-footer">
                  <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(event)}>
                    <HiOutlinePencil size={14} /> Edit
                  </button>
                  <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-danger)' }} onClick={() => handleDelete(event._id, event.title)}>
                    <HiOutlineTrash size={14} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <div className="modal-title">{editingEvent ? 'Edit Event' : 'Create New Event'}</div>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <HiOutlineX />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Event Title *</label>
                  <input
                    className="form-input"
                    placeholder="e.g., Beach Cleanup Drive"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description *</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Describe the event, what volunteers will do, what to bring..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    rows={4}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                  <div className="form-group">
                    <label className="form-label">Start Date & Time *</label>
                    <input
                      type="datetime-local"
                      className="form-input"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Date & Time</label>
                    <input
                      type="datetime-local"
                      className="form-input"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Location *</label>
                  <input
                    className="form-input"
                    placeholder="e.g., Central Park, New York"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-md)' }}>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      className="form-select"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Max Volunteers *</label>
                    <input
                      type="number"
                      className="form-input"
                      min="1"
                      value={formData.maxVolunteers}
                      onChange={(e) => setFormData({ ...formData, maxVolunteers: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                  {editingEvent && (
                    <div className="form-group">
                      <label className="form-label">Status</label>
                      <select
                        className="form-select"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      >
                        <option value="upcoming">Upcoming</option>
                        <option value="ongoing">Ongoing</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  {editingEvent ? 'Update Event' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageEvents;
