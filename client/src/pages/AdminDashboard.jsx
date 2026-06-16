import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { HiOutlineUsers, HiOutlineCalendar, HiOutlineClock, HiOutlineClipboardCheck, HiOutlineArrowRight } from 'react-icons/hi';

const CHART_COLORS = ['#7c3aed', '#06b6d4', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await API.get('/reports/summary');
      setData(res.data.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatMonthlyData = (monthlyData) => {
    if (!monthlyData || monthlyData.length === 0) return [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return monthlyData.map(item => ({
      name: months[item._id.month - 1],
      volunteers: item.count
    }));
  };

  const formatCategoryData = (categoryData) => {
    if (!categoryData || categoryData.length === 0) return [];
    const labels = {
      'cleanup': 'Cleanup', 'education': 'Education', 'healthcare': 'Healthcare',
      'food-drive': 'Food Drive', 'animal-welfare': 'Animal Welfare', 
      'elderly-care': 'Elderly Care', 'other': 'Other'
    };
    return categoryData.map(item => ({
      name: labels[item._id] || item._id,
      value: item.count
    }));
  };

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '8px 12px',
          fontSize: 'var(--font-sm)'
        }}>
          <p style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{label}</p>
          <p style={{ color: 'var(--accent-primary)' }}>{payload[0].value} volunteers</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="page-loader">
        <div className="spinner"></div>
        <span className="loader-text">Loading admin dashboard...</span>
      </div>
    );
  }

  const stats = data?.stats || {};

  return (
    <div className="page-content animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">Overview of your volunteer management system</p>
        </div>
        <Link to="/admin/reports">
          <button className="btn btn-primary btn-sm">📊 View Reports</button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid-stats stagger-children" style={{ marginBottom: 'var(--space-2xl)' }}>
        <div className="stat-card purple">
          <div className="stat-icon"><HiOutlineUsers size={24} /></div>
          <div className="stat-value">{stats.totalVolunteers || 0}</div>
          <div className="stat-label">Total Volunteers</div>
        </div>
        <div className="stat-card cyan">
          <div className="stat-icon"><HiOutlineCalendar size={24} /></div>
          <div className="stat-value">{stats.totalEvents || 0}</div>
          <div className="stat-label">Total Events</div>
        </div>
        <div className="stat-card pink">
          <div className="stat-icon"><HiOutlineClock size={24} /></div>
          <div className="stat-value">{stats.totalHours || 0}</div>
          <div className="stat-label">Total Hours</div>
        </div>
        <div className="stat-card warm">
          <div className="stat-icon"><HiOutlineClipboardCheck size={24} /></div>
          <div className="stat-value">{stats.pendingVolunteers || 0}</div>
          <div className="stat-label">Pending Approvals</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid-2" style={{ marginBottom: 'var(--space-2xl)' }}>
        {/* Bar Chart */}
        <div className="chart-container">
          <div className="chart-title">Volunteer Registrations</div>
          {formatMonthlyData(data?.monthlyRegistrations).length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={formatMonthlyData(data.monthlyRegistrations)}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="volunteers" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c3aed" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ padding: 'var(--space-2xl) 0' }}>
              <div className="empty-icon">📈</div>
              <div className="empty-description">No registration data yet</div>
            </div>
          )}
        </div>

        {/* Pie Chart */}
        <div className="chart-container">
          <div className="chart-title">Event Categories</div>
          {formatCategoryData(data?.categoryDistribution).length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={formatCategoryData(data.categoryDistribution)}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {formatCategoryData(data.categoryDistribution).map((entry, index) => (
                    <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--font-sm)'
                  }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ padding: 'var(--space-2xl) 0' }}>
              <div className="empty-icon">🥧</div>
              <div className="empty-description">No event data yet</div>
            </div>
          )}
        </div>
      </div>

      {/* Activity & Quick Stats Row */}
      <div className="grid-2">
        {/* Recent Volunteers */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Recent Volunteers</div>
            <Link to="/admin/volunteers" className="btn btn-ghost btn-sm">
              View All <HiOutlineArrowRight />
            </Link>
          </div>
          <div className="activity-feed">
            {data?.recentVolunteers?.length > 0 ? (
              data.recentVolunteers.map((vol) => (
                <div key={vol._id} className="activity-item">
                  <div className="activity-avatar">{getInitials(vol.name)}</div>
                  <div className="activity-content" style={{ flex: 1 }}>
                    <div className="activity-text"><strong>{vol.name}</strong></div>
                    <div className="activity-time">{vol.email}</div>
                  </div>
                  <span className={`badge badge-${vol.status}`}>{vol.status}</span>
                </div>
              ))
            ) : (
              <div className="empty-state" style={{ padding: 'var(--space-xl)' }}>
                <div className="empty-description">No volunteers yet</div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Registrations */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Recent Event Sign-ups</div>
            <Link to="/admin/events" className="btn btn-ghost btn-sm">
              View All <HiOutlineArrowRight />
            </Link>
          </div>
          <div className="activity-feed">
            {data?.recentRegistrations?.length > 0 ? (
              data.recentRegistrations.map((reg) => (
                <div key={reg._id} className="activity-item">
                  <div className="activity-avatar" style={{ background: 'var(--gradient-success)' }}>
                    {getInitials(reg.volunteer?.name)}
                  </div>
                  <div className="activity-content">
                    <div className="activity-text">
                      <strong>{reg.volunteer?.name}</strong> signed up for <strong>{reg.event?.title}</strong>
                    </div>
                    <div className="activity-time">{formatTimeAgo(reg.createdAt)}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state" style={{ padding: 'var(--space-xl)' }}>
                <div className="empty-description">No sign-ups yet</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
