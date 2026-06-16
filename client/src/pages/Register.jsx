import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    skills: '',
    availability: 'flexible',
    bio: ''
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        ...formData,
        skills: formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(Boolean) : []
      };
      delete submitData.confirmPassword;

      await register(submitData);
      toast.success('Account created successfully! Welcome to VolunteerHub!');
      navigate('/dashboard');
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: '520px' }}>
        <div className="auth-header">
          <div className="auth-logo">🤝</div>
          <h1 className="auth-title">Join VolunteerHub</h1>
          <p className="auth-subtitle">Create your account and start making a difference</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="register-name">Full Name *</label>
              <input
                id="register-name"
                type="text"
                name="name"
                className="form-input"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="register-email">Email *</label>
              <input
                id="register-email"
                type="email"
                name="email"
                className="form-input"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="register-password">Password *</label>
              <input
                id="register-password"
                type="password"
                name="password"
                className="form-input"
                placeholder="Min. 6 characters"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="register-confirm">Confirm Password *</label>
              <input
                id="register-confirm"
                type="password"
                name="confirmPassword"
                className="form-input"
                placeholder="Repeat password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="register-phone">Phone Number</label>
              <input
                id="register-phone"
                type="tel"
                name="phone"
                className="form-input"
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="register-availability">Availability</label>
              <select
                id="register-availability"
                name="availability"
                className="form-select"
                value={formData.availability}
                onChange={handleChange}
              >
                <option value="flexible">Flexible</option>
                <option value="weekdays">Weekdays</option>
                <option value="weekends">Weekends</option>
                <option value="both">Both</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-skills">Skills</label>
            <input
              id="register-skills"
              type="text"
              name="skills"
              className="form-input"
              placeholder="e.g., Teaching, First Aid, Cooking (comma-separated)"
              value={formData.skills}
              onChange={handleChange}
            />
            <span className="form-hint">Separate multiple skills with commas</span>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-bio">Short Bio</label>
            <textarea
              id="register-bio"
              name="bio"
              className="form-textarea"
              placeholder="Tell us a bit about yourself and why you want to volunteer..."
              value={formData.bio}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? (
              <><span className="spinner spinner-sm" style={{ borderTopColor: 'white' }}></span> Creating Account...</>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
