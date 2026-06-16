const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-links">
        <a href="#">About</a>
        <a href="#">Privacy</a>
        <a href="#">Terms</a>
        <a href="#">Contact</a>
      </div>
      <p>© {new Date().getFullYear()} VolunteerHub. Making a difference together.</p>
    </footer>
  );
};

export default Footer;
