import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, Layers, Zap, Menu, X } from 'lucide-react';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="landing-container">
      <nav className="landing-nav">
        <div className="landing-nav-logo">LMS</div>
        <div className="landing-nav-links">
          <a href="#courses">Courses</a>
          <a href="#mentors">Mentors</a>
          <a href="#pricing">Pricing</a>
        </div>
        <div className="landing-nav-actions">
          <Link to="/login" className="btn btn-secondary">Login</Link>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn btn-primary"
            onClick={() => navigate('/register')}
          >
            Join Now
          </motion.button>
        </div>
        <button 
          className="mobile-menu-btn" 
          onClick={() => setIsSidebarOpen(true)}
        >
          <Menu size={28} />
        </button>
      </nav>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="sidebar-overlay"
              onClick={() => setIsSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="mobile-sidebar"
            >
              <button 
                className="sidebar-close"
                onClick={() => setIsSidebarOpen(false)}
              >
                <X size={28} />
              </button>
              
              <div className="mobile-nav-links">
                <a href="#courses" onClick={() => setIsSidebarOpen(false)}>Courses</a>
                <a href="#mentors" onClick={() => setIsSidebarOpen(false)}>Mentors</a>
                <a href="#pricing" onClick={() => setIsSidebarOpen(false)}>Pricing</a>
              </div>

              <div className="mobile-nav-actions">
                <Link to="/login" className="btn btn-secondary" onClick={() => setIsSidebarOpen(false)} style={{ justifyContent: 'center', width: '100%' }}>Login</Link>
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    setIsSidebarOpen(false);
                    navigate('/register');
                  }}
                  style={{ justifyContent: 'center', width: '100%' }}
                >
                  Join Now
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <section className="landing-hero">
        <div className="geometric-circle" />
        <div className="geometric-square" />
        
        <div className="hero-content">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="hero-badge">Launch Your Tech Career</span>
            <h1 className="hero-title">
              Master Your <br /><span>Future</span>
            </h1>
            <p className="hero-subtitle">
              Join the ultimate MERN stack learning platform and build real-world applications with expert guidance from industry leaders.
            </p>
            <div className="flex gap-4">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-primary btn-lg"
                onClick={() => navigate('/register')}
              >
                Get Started <ArrowRight size={20} />
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-secondary btn-lg"
              >
                View Curriculum
              </motion.button>
            </div>
          </motion.div>

          <motion.div 
            className="hero-image"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <img 
              src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
              alt="Coding Workspace" 
            />
          </motion.div>
        </div>
      </section>

      <section className="landing-section">
        <div className="section-header" style={{ margin: '0 auto', textAlign: 'center', marginBottom: '64px' }}>
          <h2 className="section-title">Why Choose LMS MERN Complete?</h2>
          <p className="section-subtitle">
            Designed for the modern developer who demands architectural precision and real-world skills.
          </p>
        </div>

        <div className="benefits-grid">
          <motion.div 
            className="benefit-card card-green"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <BookOpen size={48} className="mb-6" />
            <h3 className="benefit-card-title">Expert Mentorship</h3>
            <p className="benefit-card-text">
              Direct access to industry seniors who help you debug, architecture, and deploy complex applications.
            </p>
          </motion.div>

          <motion.div 
            className="benefit-card card-blue"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Layers size={48} className="mb-6" />
            <h3 className="benefit-card-title">Real-world Projects</h3>
            <p className="benefit-card-text">
              Build production-grade E-commerce, Social Media, and SaaS platforms to populate your portfolio.
            </p>
          </motion.div>

          <motion.div 
            className="benefit-card card-amber"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Zap size={48} className="mb-6" />
            <h3 className="benefit-card-title">Lifetime Access</h3>
            <p className="benefit-card-text">
              Pay once, learn forever. Get all future updates to the curriculum and new project modules free of charge.
            </p>
          </motion.div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-col" style={{ gridColumn: 'span 1' }}>
            <div className="landing-nav-logo" style={{ marginBottom: '16px' }}>LMS</div>
            <p style={{ color: '#9CA3AF', fontSize: '0.875rem', lineHeight: 1.6 }}>
              © 2024 LMS MERN Complete. Built for architectural precision and real-world results.
            </p>
          </div>
          <div className="footer-col">
            <h4>Curriculum</h4>
            <a href="#">Frontend Deep Dive</a>
            <a href="#">Node.js Mastery</a>
            <a href="#">MongoDB Architecture</a>
            <a href="#">Deployment</a>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <a href="#">Instructors</a>
            <a href="#">Enterprise</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
          <div className="footer-col">
            <h4>Support</h4>
            <a href="#">Help Center</a>
            <a href="#">Contact</a>
            <a href="#">Status</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
