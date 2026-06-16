import { useState, useEffect } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { HiOutlineDownload, HiOutlineDocumentReport } from 'react-icons/hi';

const Reports = () => {
  const [reportType, setReportType] = useState('volunteers');
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchReport();
  }, [reportType]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const res = await API.get(`/reports/${reportType}?${params.toString()}`);
      setReportData(res.data.data || []);
    } catch (error) {
      console.error('Error fetching report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const params = new URLSearchParams();
      params.append('format', 'csv');
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const res = await API.get(`/reports/${reportType}?${params.toString()}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${reportType}_report.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Report downloaded successfully');
    } catch (error) {
      toast.error('Failed to export report');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
          <p style={{ color: 'var(--accent-primary)' }}>Value: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  const getChartData = () => {
    if (reportType === 'volunteers' && Array.isArray(reportData)) {
      const statusCounts = { active: 0, pending: 0, inactive: 0 };
      reportData.forEach(v => { if (statusCounts[v.status] !== undefined) statusCounts[v.status]++; });
      return Object.entries(statusCounts).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
    }
    if (reportType === 'events' && Array.isArray(reportData)) {
      const statusCounts = {};
      reportData.forEach(e => {
        const cat = e.category || 'other';
        statusCounts[cat] = (statusCounts[cat] || 0) + 1;
      });
      return Object.entries(statusCounts).map(([name, value]) => ({ 
        name: name.charAt(0).toUpperCase() + name.slice(1).replace('-', ' '), 
        value 
      }));
    }
    return [];
  };

  const reportTypes = [
    { key: 'volunteers', label: 'Volunteers Report', icon: '👥' },
    { key: 'events', label: 'Events Report', icon: '📅' },
    { key: 'hours', label: 'Hours Report', icon: '⏱️' }
  ];

  return (
    <div className="page-content animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">Generate and export detailed reports</p>
        </div>
        <button className="btn btn-primary" onClick={handleExportCSV}>
          <HiOutlineDownload /> Export CSV
        </button>
      </div>

      {/* Report Type Selector */}
      <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)', flexWrap: 'wrap' }}>
        {reportTypes.map(rt => (
          <button
            key={rt.key}
            className={`filter-chip ${reportType === rt.key ? 'active' : ''}`}
            onClick={() => setReportType(rt.key)}
            style={{ padding: '10px 20px', fontSize: 'var(--font-sm)' }}
          >
            {rt.icon} {rt.label}
          </button>
        ))}
      </div>

      {/* Date Filters (for hours report) */}
      {reportType === 'hours' && (
        <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Start Date</label>
            <input
              type="date"
              className="form-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">End Date</label>
            <input
              type="date"
              className="form-input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <button className="btn btn-secondary" onClick={fetchReport}>
            Apply Filter
          </button>
        </div>
      )}

      {/* Chart */}
      {getChartData().length > 0 && (
        <div className="chart-container" style={{ marginBottom: 'var(--space-2xl)' }}>
          <div className="chart-title">
            {reportType === 'volunteers' ? 'Volunteers by Status' : 'Events by Category'}
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getChartData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
              <YAxis stroke="var(--text-muted)" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="url(#reportGradient)" radius={[6, 6, 0, 0]} />
              <defs>
                <linearGradient id="reportGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Data Table */}
      {loading ? (
        <div className="page-loader"><div className="spinner"></div></div>
      ) : (
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                {reportType === 'volunteers' && (
                  <>
                    <th>Name</th><th>Email</th><th>Phone</th><th>Skills</th>
                    <th>Availability</th><th>Status</th><th>Hours</th><th>Joined</th>
                  </>
                )}
                {reportType === 'events' && (
                  <>
                    <th>Title</th><th>Date</th><th>Location</th><th>Category</th>
                    <th>Status</th><th>Volunteers</th><th>Created By</th>
                  </>
                )}
                {reportType === 'hours' && (
                  <>
                    <th>Volunteer</th><th>Event</th><th>Hours Worked</th>
                    <th>Status</th><th>Date</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {reportType === 'volunteers' && Array.isArray(reportData) && reportData.map((v) => (
                <tr key={v._id}>
                  <td><strong>{v.name}</strong></td>
                  <td style={{ color: 'var(--text-secondary)' }}>{v.email}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{v.phone || '—'}</td>
                  <td>{v.skills?.join(', ') || '—'}</td>
                  <td style={{ textTransform: 'capitalize' }}>{v.availability}</td>
                  <td><span className={`badge badge-${v.status}`}>{v.status}</span></td>
                  <td>{v.hoursLogged || 0}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{formatDate(v.createdAt)}</td>
                </tr>
              ))}
              {reportType === 'events' && Array.isArray(reportData) && reportData.map((e) => (
                <tr key={e._id}>
                  <td><strong>{e.title}</strong></td>
                  <td style={{ color: 'var(--text-secondary)' }}>{formatDate(e.date)}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{e.location}</td>
                  <td style={{ textTransform: 'capitalize' }}>{e.category?.replace('-', ' ')}</td>
                  <td><span className={`badge badge-${e.status}`}>{e.status}</span></td>
                  <td>{e.currentVolunteers}/{e.maxVolunteers}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{e.createdBy?.name || 'N/A'}</td>
                </tr>
              ))}
              {reportType === 'hours' && (
                reportData?.registrations?.length > 0 ? (
                  reportData.registrations.map((r) => (
                    <tr key={r._id}>
                      <td><strong>{r.volunteer?.name}</strong></td>
                      <td>{r.event?.title}</td>
                      <td>{r.hoursWorked}</td>
                      <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
                      <td style={{ color: 'var(--text-secondary)' }}>{formatDate(r.createdAt)}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: 'var(--space-2xl)', color: 'var(--text-muted)' }}>No hours data available</td></tr>
                )
              )}
              {((reportType !== 'hours' && Array.isArray(reportData) && reportData.length === 0) ||
                (reportType === 'hours' && !reportData?.registrations?.length)) && reportType !== 'hours' && (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 'var(--space-2xl)', color: 'var(--text-muted)' }}>No data available</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Reports;
