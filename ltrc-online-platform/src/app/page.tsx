import './home.css'

const Home = () => {
  return (
    <div className="home-container">
      {/* Hero Section */}
      <div className="hero-section">
        <h1 className="welcome-text">
          Welcome to
        </h1>
        <h2 className="main-heading">
          The Language Teaching and Research Centre
        </h2>
        <h3 className="sub-heading">
          Online Platform
        </h3>
        
        {/* Call to Action Buttons */}
        <div className="cta-container">
          <a 
            href="/signup" 
            className="primary-btn"
          >
            Get Started
          </a>
          <a 
            href="/login" 
            className="secondary-btn"
          >
            Login
          </a>
        </div>
      </div>
    </div>
  );
};

export default Home;