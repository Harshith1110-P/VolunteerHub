import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiOutlineHeart, HiOutlineGlobe, HiOutlineClock, HiOutlineUserGroup, HiOutlineShieldCheck, HiOutlineChartBar } from 'react-icons/hi';
import Footer from '../components/layout/Footer';

const Home = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: <HiOutlineUserGroup />,
      title: 'Easy Registration',
      description: 'Sign up in seconds and start making a difference in your community with just a few clicks.'
    },
    {
      icon: <HiOutlineCalendar />,
      title: 'Event Discovery',
      description: 'Browse upcoming volunteer opportunities, filter by category, and sign up for events that match your interests.'
    },
    {
      icon: <HiOutlineClock />,
      title: 'Hours Tracking',
      description: 'Automatically track your volunteer hours and build your impact profile over time.'
    },
    {
      icon: <HiOutlineShieldCheck />,
      title: 'Verified Impact',
      description: 'Get your volunteer hours verified and earn recognition for your community contributions.'
    },
    {
      icon: <HiOutlineChartBar />,
      title: 'Analytics Dashboard',
      description: 'Organizations get powerful dashboards to track volunteer engagement and measure community impact.'
    },
    {
      icon: <HiOutlineGlobe />,
      title: 'Community Building',
      description: 'Connect with like-minded volunteers and organizations making a real difference locally and globally.'
    }
  ];

  return (
    <div>
      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            <HiOutlineHeart /> Empowering Communities
          </div>
          <h1>
            Make an Impact.{' '}
            <span className="gradient-text">Volunteer Today.</span>
          </h1>
          <p>
            Join thousands of volunteers creating positive change. Find meaningful opportunities, 
            track your hours, and see the difference you make in your community.
          </p>
          <div className="hero-buttons">
            {!user ? (
              <>
                <Link to="/register">
                  <button className="btn btn-primary btn-lg">Start Volunteering</button>
                </Link>
                <Link to="/login">
                  <button className="btn btn-secondary btn-lg">Sign In</button>
                </Link>
              </>
            ) : (
              <Link to={user.role === 'admin' ? '/admin' : '/dashboard'}>
                <button className="btn btn-primary btn-lg">Go to Dashboard</button>
              </Link>
            )}
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="stat-number">2,500+</div>
              <div className="stat-text">Active Volunteers</div>
            </div>
            <div className="hero-stat">
              <div className="stat-number">180+</div>
              <div className="stat-text">Events Organized</div>
            </div>
            <div className="hero-stat">
              <div className="stat-number">15K+</div>
              <div className="stat-text">Hours Donated</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">
            Everything You Need to <span className="gradient-text">Make a Difference</span>
          </h2>
          <p className="section-subtitle">
            Our platform connects passionate volunteers with organizations that need them most.
          </p>
          <div className="grid-3 stagger-children">
            {features.map((feature, index) => (
              <div className="feature-card" key={index}>
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ 
        padding: 'var(--space-3xl) var(--space-xl)', 
        textAlign: 'center',
        background: 'var(--bg-primary)'
      }}>
        <div className="container">
          <h2 style={{ fontSize: 'var(--font-3xl)', fontWeight: 800, marginBottom: 'var(--space-md)' }}>
            Ready to Get Started?
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-lg)', marginBottom: 'var(--space-2xl)', maxWidth: '500px', margin: '0 auto var(--space-2xl)' }}>
            Join our growing community of volunteers and start making a positive impact today.
          </p>
          {!user && (
            <Link to="/register">
              <button className="btn btn-primary btn-lg">Create Free Account</button>
            </Link>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

const HiOutlineCalendar = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="24" height="24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
  </svg>
);

export default Home;
