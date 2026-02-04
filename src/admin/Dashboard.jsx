import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './admin.css'; // Import global admin styles

// Component imports (will be created next)
import BioEditor from './components/BioEditor';
import SkillsManager from './components/SkillsManager';
import PortfolioManager from './components/PortfolioManager';
import ServicesManager from './components/ServicesManager';
import ResumeManager from './components/ResumeManager';
import TestimonialsManager from './components/TestimonialsManager';
import ContactMessages from './components/ContactMessages';
import Settings from './components/Settings';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('bio');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Handle body scroll locking
  useEffect(() => {
    if (showLogoutModal || sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showLogoutModal, sidebarOpen]);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
    setSidebarOpen(false); // Close sidebar if open on mobile
  };

  const confirmLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const tabs = [
    { id: 'bio', label: 'Bio' },
    { id: 'skills', label: 'Skills' },
    { id: 'portfolio', label: 'Portfolio' },
    { id: 'services', label: 'Services' },
    { id: 'resume', label: 'Resume' },
    { id: 'testimonials', label: 'Testimonials' },
    { id: 'messages', label: 'Messages' },
    { id: 'settings', label: 'Settings' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'bio': return <BioEditor />;
      case 'skills': return <SkillsManager />;
      case 'portfolio': return <PortfolioManager />;
      case 'services': return <ServicesManager />;
      case 'resume': return <ResumeManager />;
      case 'testimonials': return <TestimonialsManager />;
      case 'messages': return <ContactMessages />;
      case 'settings': return <Settings />;
      default: return <BioEditor />;
    }
  };

  return (
    <div className="admin-dashboard">
      {/* Hamburger Menu (Mobile) */}
      <button 
        className={`admin-hamburger ${sidebarOpen ? 'active' : ''}`} 
        onClick={toggleSidebar}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Mobile Sidebar Overlay */}
      <div 
        className={`admin-sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
        onClick={() => setSidebarOpen(false)}
      ></div>

      {/* Sidebar */}
      <div className={`admin-sidebar ${sidebarOpen ? 'active' : ''}`}>
        <div className="admin-sidebar-header">
          Admin Panel
        </div>
        <nav className="admin-nav">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSidebarOpen(false); // Close sidebar on selection (mobile)
              }}
              className={`admin-nav-item ${activeTab === tab.id ? 'active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
        <div className="admin-logout">
          <button onClick={handleLogoutClick} className="logout-btn">
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-content">
        <h2 style={{ marginBottom: '2rem', borderBottom: '2px solid #ddd', paddingBottom: '0.5rem' }}>{tabs.find(t => t.id === activeTab)?.label} Manager</h2>
        {renderContent()}
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="logout-modal-overlay" onClick={cancelLogout}>
          <div className="logout-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to log out of the admin panel?</p>
            <div className="logout-actions">
              <button className="btn-cancel" onClick={cancelLogout}>Cancel</button>
              <button className="btn-confirm" onClick={confirmLogout}>Logout</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
