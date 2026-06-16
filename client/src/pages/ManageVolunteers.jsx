import { useState, useEffect } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { HiOutlineSearch, HiOutlineCheck, HiOutlineX, HiOutlineTrash } from 'react-icons/hi';

const ManageVolunteers = () => {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  useEffect(() => {
    fetchVolunteers();
  }, [search, statusFilter, pagination.page]);

  const fetchVolunteers = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      params.append('page', pagination.page);
      params.append('limit', 15);

      const res = await API.get(`/volunteers?${params.toString()}`);
      setVolunteers(res.data.data || []);
      setPagination(prev => ({ ...prev, ...res.data.pagination }));
    } catch (error) {
      console.error('Error fetching volunteers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await API.patch(`/volunteers/${id}/status`, { status: newStatus });
      toast.success(`Volunteer ${newStatus === 'active' ? 'approved' : 'updated'} successfully`);
      fetchVolunteers();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove ${name}?`)) return;
    try {
      await API.delete(`/volunteers/${id}`);
      toast.success('Volunteer removed');
      fetchVolunteers();
    } catch (error) {
      toast.error('Failed to remove volunteer');
    }
  };

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="page-content animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Manage Volunteers</h1>
          <p className="page-subtitle">{pagination.total} total volunteers</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)', flexWrap: 'wrap' }}>
        <div className="search-bar" style={{ flex: 1, minWidth: '250px' }}>
          <HiOutlineSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-bar">
          <button 
            className={`filter-chip ${statusFilter === '' ? 'active' : ''}`}
            onClick={() => setStatusFilter('')}
          >All</button>
          <button 
            className={`filter-chip ${statusFilter === 'pending' ? 'active' : ''}`}
            onClick={() => setStatusFilter('pending')}
          >Pending</button>
          <button 
            className={`filter-chip ${statusFilter === 'active' ? 'active' : ''}`}
            onClick={() => setStatusFilter('active')}
          >Active</button>
          <button 
            className={`filter-chip ${statusFilter === 'inactive' ? 'active' : ''}`}
            onClick={() => setStatusFilter('inactive')}
          >Inactive</button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="page-loader"><div className="spinner"></div></div>
      ) : volunteers.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <div className="empty-title">No volunteers found</div>
            <div className="empty-description">Try adjusting your search or filter criteria.</div>
          </div>
        </div>
      ) : (
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Volunteer</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Skills</th>
                <th>Availability</th>
                <th>Hours</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {volunteers.map((vol) => (
                <tr key={vol._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                      <div className="nav-avatar" style={{ width: '32px', height: '32px', fontSize: '0.7rem' }}>
                        {getInitials(vol.name)}
                      </div>
                      <strong>{vol.name}</strong>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{vol.email}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{vol.phone || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {vol.skills?.slice(0, 2).map((skill, i) => (
                        <span key={i} className="badge badge-info" style={{ fontSize: '0.65rem' }}>{skill}</span>
                      ))}
                      {vol.skills?.length > 2 && (
                        <span className="badge" style={{ background: 'var(--bg-glass)', color: 'var(--text-muted)', fontSize: '0.65rem' }}>
                          +{vol.skills.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{vol.availability}</td>
                  <td><strong>{vol.hoursLogged || 0}</strong></td>
                  <td><span className={`badge badge-${vol.status}`}>{vol.status}</span></td>
                  <td style={{ color: 'var(--text-secondary)' }}>{formatDate(vol.createdAt)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {vol.status === 'pending' && (
                        <button 
                          className="btn btn-icon btn-sm" 
                          style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}
                          onClick={() => handleStatusChange(vol._id, 'active')}
                          title="Approve"
                        >
                          <HiOutlineCheck size={14} />
                        </button>
                      )}
                      {vol.status === 'active' && (
                        <button 
                          className="btn btn-icon btn-sm" 
                          style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}
                          onClick={() => handleStatusChange(vol._id, 'inactive')}
                          title="Deactivate"
                        >
                          <HiOutlineX size={14} />
                        </button>
                      )}
                      {vol.status === 'inactive' && (
                        <button 
                          className="btn btn-icon btn-sm" 
                          style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}
                          onClick={() => handleStatusChange(vol._id, 'active')}
                          title="Reactivate"
                        >
                          <HiOutlineCheck size={14} />
                        </button>
                      )}
                      <button 
                        className="btn btn-icon btn-sm" 
                        style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}
                        onClick={() => handleDelete(vol._id, vol.name)}
                        title="Remove"
                      >
                        <HiOutlineTrash size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-sm)', marginTop: 'var(--space-xl)' }}>
          <button 
            className="btn btn-secondary btn-sm"
            disabled={pagination.page <= 1}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
          >Previous</button>
          <span style={{ display: 'flex', alignItems: 'center', color: 'var(--text-secondary)', fontSize: 'var(--font-sm)' }}>
            Page {pagination.page} of {pagination.pages}
          </span>
          <button 
            className="btn btn-secondary btn-sm"
            disabled={pagination.page >= pagination.pages}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
          >Next</button>
        </div>
      )}
    </div>
  );
};

export default ManageVolunteers;
