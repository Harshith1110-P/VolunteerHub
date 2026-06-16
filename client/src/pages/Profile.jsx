import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    skills: user?.skills?.join(', ') || '',
    availability: user?.availability || 'flexible',
    bio: user?.bio || ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        skills: formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(Boolean) : []
      };

      const res = await API.put(`/volunteers/${user.id}`, submitData);
      updateUser({ ...user, ...res.data.data });
      toast.success('Profile updated successfully');
      setEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';
  };

  return (
    <div className="page-content animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Manage your account information</p>
        </div>
        {!editing && (
          <button className="btn btn-primary" onClick={() => setEditing(true)}>
            ✏️ Edit Profile
          </button>
        )}
      </div>

      <div className="card" style={{ maxWidth: '700px' }}>
        {/* Profile Header */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 'var(--space-xl)', 
          marginBottom: 'var(--space-2xl)',
          paddingBottom: 'var(--space-xl)',
          borderBottom: '1px solid var(--border-color)'
        }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: 'var(--radius-full)',
            background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 'var(--font-2xl)', fontWeight: 800, color: 'white'
          }}>
            {getInitials(user?.name)}
          </div>
          <div>
            <h2 style={{ fontSize: 'var(--font-2xl)', fontWeight: 700 }}>{user?.name}</h2>
            <p style={{ color: 'var(--text-secondary)' }}>{user?.email}</p>
            <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-sm)' }}>
              <span className={`badge badge-${user?.status}`}>{user?.status}</span>
              <span className="badge badge-info" style={{ textTransform: 'capitalize' }}>{user?.role}</span>
            </div>
          </div>
        </div>

        {editing ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" name="name" value={formData.name} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input className="form-input" name="phone" value={formData.phone} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label className="form-label">Skills</label>
              <input className="form-input" name="skills" value={formData.skills} onChange={handleChange} placeholder="Comma-separated" />
            </div>

            <div className="form-group">
              <label className="form-label">Availability</label>
              <select className="form-select" name="availability" value={formData.availability} onChange={handleChange}>
                <option value="flexible">Flexible</option>
                <option value="weekdays">Weekdays</option>
                <option value="weekends">Weekends</option>
                <option value="both">Both</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Bio</label>
              <textarea className="form-textarea" name="bio" value={formData.bio} onChange={handleChange} rows={3} />
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </form>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            <div>
              <div className="form-label">Phone</div>
              <div style={{ color: 'var(--text-primary)' }}>{user?.phone || 'Not provided'}</div>
            </div>
            <div>
              <div className="form-label">Skills</div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {user?.skills?.length > 0 ? user.skills.map((s, i) => (
                  <span key={i} className="badge badge-info">{s}</span>
                )) : <span style={{ color: 'var(--text-muted)' }}>No skills listed</span>}
              </div>
            </div>
            <div>
              <div className="form-label">Availability</div>
              <div style={{ color: 'var(--text-primary)', textTransform: 'capitalize' }}>{user?.availability || 'Flexible'}</div>
            </div>
            <div>
              <div className="form-label">Bio</div>
              <div style={{ color: 'var(--text-primary)' }}>{user?.bio || 'No bio provided'}</div>
            </div>
            <div>
              <div className="form-label">Hours Volunteered</div>
              <div style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, color: 'var(--accent-primary)' }}>{user?.hoursLogged || 0} hours</div>
            </div>
            <div>
              <div className="form-label">Member Since</div>
              <div style={{ color: 'var(--text-secondary)' }}>
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
