import { useState, useEffect } from 'react';
import './index.css';
import { API_ENDPOINTS, formatValidationErrors } from '../config/api.js';

// SVG Icons as components
const Icons = {
  Code: () => (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="16,18 22,12 16,6"></polyline>
      <polyline points="8,6 2,12 8,18"></polyline>
    </svg>
  ),
  Design: () => (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"></circle>
      <circle cx="12" cy="12" r="6"></circle>
      <circle cx="12" cy="12" r="2"></circle>
    </svg>
  ),
  Shopping: () => (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="21" r="1"></circle>
      <circle cx="20" cy="21" r="1"></circle>
      <path d="M1,1 L5,1 L8,16 L21,16 L23,6 L6,6"></path>
    </svg>
  ),
  Phone: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
    </svg>
  ),
  Mail: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
      <polyline points="22,6 12,13 2,6"></polyline>
    </svg>
  ),
  Globe: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="2" y1="12" x2="22" y2="12"></line>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
    </svg>
  ),
  Link: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
    </svg>
  ),
  Instagram: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
  ),
  Twitter: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
    </svg>
  ),
  Facebook: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
    </svg>
  ),
  Linkedin: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
      <rect x="2" y="9" width="4" height="12"></rect>
      <circle cx="4" cy="4" r="2"></circle>
    </svg>
  ),
  Pinterest: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0a12 12 0 0 0-4.37 23.17c-.1-.94-.19-2.37.04-3.4l1.66-7.05s-.42-.85-.42-2.1c0-1.97 1.14-3.44 2.56-3.44 1.2 0 1.79.9 1.79 2 0 1.21-.77 3.03-1.17 4.71-.34 1.41.71 2.56 2.1 2.56 2.52 0 4.46-2.66 4.46-6.5 0-3.4-2.44-5.77-5.93-5.77-4.04 0-6.41 3.03-6.41 6.16 0 1.22.47 2.53 1.06 3.24.11.14.13.26.1.4l-.4 1.61c-.06.26-.21.31-.48.19-1.77-.82-2.88-3.4-2.88-5.48 0-4.47 3.25-8.57 9.36-8.57 4.91 0 8.73 3.5 8.73 8.18 0 4.88-3.08 8.81-7.35 8.81-1.44 0-2.79-.75-3.25-1.63l-.88 3.37c-.32 1.23-1.19 2.77-1.77 3.71A12 12 0 1 0 12 0z"/>
    </svg>
  ),
  Dribbble: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M19.13 5.09C15.22 9.14 10 10.44 2.25 10.94"></path>
      <path d="M21.75 12.84c-6.62-1.41-12.14 1-16.38 6.32"></path>
      <path d="M8.56 2.75c4.37 6 6 9.42 8 17.72"></path>
    </svg>
  ),
  Palette: () => (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
      <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
      <path d="M2 2l7.586 7.586"></path>
      <circle cx="11" cy="11" r="2"></circle>
    </svg>
  ),
  Rocket: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" className="bi bi-rocket-takeoff" viewBox="0 0 16 16">
        <path d="M9.752 6.193c.599.6 1.73.437 2.528-.362s.96-1.932.362-2.531c-.599-.6-1.73-.438-2.528.361-.798.8-.96 1.933-.362 2.532"/>
        <path d="M15.811 3.312c-.363 1.534-1.334 3.626-3.64 6.218l-.24 2.408a2.56 2.56 0 0 1-.732 1.526L8.817 15.85a.51.51 0 0 1-.867-.434l.27-1.899c.04-.28-.013-.593-.131-.956a9 9 0 0 0-.249-.657l-.082-.202c-.815-.197-1.578-.662-2.191-1.277-.614-.615-1.079-1.379-1.275-2.195l-.203-.083a10 10 0 0 0-.655-.248c-.363-.119-.675-.172-.955-.132l-1.896.27A.51.51 0 0 1 .15 7.17l2.382-2.386c.41-.41.947-.67 1.524-.734h.006l2.4-.238C9.005 1.55 11.087.582 12.623.208c.89-.217 1.59-.232 2.08-.188.244.023.435.06.57.093q.1.026.16.045c.184.06.279.13.351.295l.029.073a3.5 3.5 0 0 1 .157.721c.055.485.051 1.178-.159 2.065m-4.828 7.475.04-.04-.107 1.081a1.54 1.54 0 0 1-.44.913l-1.298 1.3.054-.38c.072-.506-.034-.993-.172-1.418a9 9 0 0 0-.164-.45c.738-.065 1.462-.38 2.087-1.006M5.205 5c-.625.626-.94 1.351-1.004 2.09a9 9 0 0 0-.45-.164c-.424-.138-.91-.244-1.416-.172l-.38.054 1.3-1.3c.245-.246.566-.401.91-.44l1.08-.107zm9.406-3.961c-.38-.034-.967-.027-1.746.163-1.558.38-3.917 1.496-6.937 4.521-.62.62-.799 1.34-.687 2.051.107.676.483 1.362 1.048 1.928.564.565 1.25.941 1.924 1.049.71.112 1.429-.067 2.048-.688 3.079-3.083 4.192-5.444 4.556-6.987.183-.771.18-1.345.138-1.713a3 3 0 0 0-.045-.283 3 3 0 0 0-.3-.041Z"/>
        <path d="M7.009 12.139a7.6 7.6 0 0 1-1.804-1.352A7.6 7.6 0 0 1 3.794 8.86c-1.102.992-1.965 5.054-1.839 5.18.125.126 3.936-.896 5.054-1.902Z"/>
    </svg>
  ),
  Briefcase: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
    </svg>
  ),
  MapPin: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
      <circle cx="12" cy="10" r="3"></circle>
    </svg>
  ),
  Calendar: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  ),
  GraduationCap: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
      <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
    </svg>
  ),
  GitHub: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
    </svg>
  )
};

const navLinks = [
  { href: '#home', label: 'Home' },
  { href: '#about', label: 'About' },
  { href: '#portfolio', label: 'Portfolio' },
  { href: '#services', label: 'Services' },
  { href: '#resume', label: 'Resume' },
  { href: '#contact', label: 'Contact' }
];

function Portfolio() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });

  const [content, setContent] = useState({
    bio: { image: null, heading: '', paragraphs: [] },
    skills: [],
    portfolio: [],
    services: [],
    experience: [],
    education: [],
    testimonials: [],
    contactInfo: {}
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      const sections = navLinks.map(link => link.href.substring(1));
      
      let currentSection = '';
      
      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 150 && rect.bottom >= 150) {
              currentSection = sectionId;
          }
        }
      }
      
      if (currentSection) {
        setActiveSection(currentSection);
      } else if (window.scrollY < 50) {
        setActiveSection('home');
      }
    };

    const fetchContent = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.content);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
           throw new TypeError("Oops, we haven't got JSON!");
        }

        const data = await response.json();
        
        if (data.success) {
          setContent(data.content);
        }
      } catch (err) {
        console.error('Failed to load content', err);
      }
    };

    fetchContent();

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Intersection Observer for scroll reveal - re-run when content changes
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => observer.observe(el));

    return () => {
      revealElements.forEach(el => observer.unobserve(el));
    };
  }, [content]);

  // Centralized Mobile Menu Scroll Lock
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
  }, [isMobileMenuOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (submitStatus.message) {
      setSubmitStatus({ type: '', message: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: '', message: '' });

    try {
      const response = await fetch(API_ENDPOINTS.contact, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitStatus({ type: 'success', message: data.message });
        setFormData({ firstName: '', lastName: '', email: '', subject: '', message: '' });
        
        setTimeout(() => {
          setSubmitStatus({ type: '', message: '' });
        }, 5000);

        const contactSection = document.getElementById('contact');
        if (contactSection) {
          contactSection.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        setSubmitStatus({ 
          type: 'error', 
          message: formatValidationErrors(data) || 'Failed to send message. Please try again.' 
        });
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitStatus({ 
        type: 'error', 
        message: 'Unable to connect to server. Please try again later.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToSection = (e, href) => {
    e.preventDefault();
    const sectionId = href.substring(1);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
    }
    setIsMobileMenuOpen(false);
  };

  const getIcon = (iconName) => {
    const IconComponent = Icons[iconName];
    return IconComponent ? <IconComponent /> : null;
  };

  return (
    <div className="portfolio-app">
      {/* Mobile Overlay */}
      <div 
        className={`mobile-overlay ${isMobileMenuOpen ? 'active' : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
      ></div>

      {/* Header */}
      <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="container">
          <div><a href='#home' className="logo">ME</a></div>
          <nav className={`nav-menu ${isMobileMenuOpen ? 'active' : ''}`}>
            {navLinks.map(link => (
              <a 
                key={link.href}
                href={link.href} 
                className={`nav-link ${activeSection === link.href.substring(1) ? 'active' : ''}`}
                onClick={(e) => scrollToSection(e, link.href)}
              >
                {link.label}
              </a>
            ))}
          </nav>
          <button 
            className={`mobile-menu-btn ${isMobileMenuOpen ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="hero">
        <div className="hero-content reveal">
          <h1>I&apos;m Mgbeadichie Emmanuel</h1>
          <h2>A Full-stack Developer</h2>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="section">
        <div className="container">
          <div className="about-content">
            {content.bio.image && (
              <img 
                src={content.bio.image} 
                alt="Profile" 
                className="about-image reveal"
              />
            )}
            <div className="about-right reveal">
              <div className="about-text">
                <h3>{content.bio.heading}</h3>
                {content.bio.paragraphs && content.bio.paragraphs.map((text, idx) => (
                  <p key={idx}>{text}</p>
                ))}
              </div>
              <div className="about-buttons">
              <a href="#contact">
                <button className="btn-primary">Hire Me</button>
              </a>
              <a href={API_ENDPOINTS.downloadCV} target="_blank" rel="noopener noreferrer">
                <button className="btn-primary btn-cv">Download CV</button>
              </a>
            </div>
            </div>
          </div>
        </div>

        {/* Skills Section - Full Width */}
        <div className="skills-container reveal">
          <h2 className="section-title skills-section-title">My Skills</h2>
          <div className="skills-grid reveal">
            {content.skills.map((skill, index) => (
              <div key={index} className="skill-card">
                <div className="skill-icon">
                  {skill.image && <img src={skill.image} alt={skill.name} />}
                </div>
                <span className="skill-name">{skill.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section id="portfolio" className="section section-alt">
        <div className="container reveal">
          <h2 className="section-title">My Portfolio</h2>
          <div className="portfolio-grid">
            {content.portfolio.map(item => (
              <div key={item.id} className="portfolio-item">
                {item.image && <img src={item.image} alt={item.title} />}
                <div className="portfolio-overlay">
                  <h4 className="portfolio-hover-title">{item.title}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="section">
        <div className="container reveal">
          <h2 className="section-title">Services</h2>
          <div className="services-grid">
            {content.services.map((service, index) => (
              <div key={index} className="service-card">
                <div className="service-icon">
                  {getIcon(service.icon)}
                </div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Resume Section */}
      <section id="resume" className="section section-alt">
        <div className="container reveal">
          <h2 className="section-title">Resume</h2>
          <div className="resume-content">
            <div className="resume-column">
              <h3>Work Experience</h3>
              {content.experience.map((item, index) => (
                <div key={index} className="resume-item">
                  <div className="resume-header">
                    <h4>{item.title}</h4>
                    <span className="resume-badge">{item.type || 'FULLTIME'}</span>
                  </div>
                  <div className="resume-meta">
                    <div className="meta-item">
                      <Icons.Briefcase />
                      <span>{item.company}</span>
                    </div>
                    <div className="meta-item">
                      <Icons.MapPin />
                      <span>{item.location || 'San Francisco, CA'}</span>
                    </div>
                    <div className="meta-item">
                      <Icons.Calendar />
                      <span>{item.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="resume-column">
              <h3>Education</h3>
              {content.education.map((item, index) => (
                <div key={index} className="resume-item">
                  <div className="resume-header">
                    <h4>{item.title}</h4>
                  </div>
                  <div className="resume-meta">
                    <div className="meta-item">
                      <Icons.GraduationCap />
                      <span>{item.institution}</span>
                    </div>
                     <div className="meta-item">
                      <Icons.MapPin />
                      <span>{item.location || 'New York, NY'}</span>
                    </div>
                    <div className="meta-item">
                      <Icons.Calendar />
                      <span>{item.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      {content.testimonials && content.testimonials.length > 0 && (
        <section id="testimonials" className="section section-alt">
          <div className="container reveal">
            <h2 className="section-title">Happy Clients</h2>
            <div className="testimonials-grid">
              {content.testimonials.map((testimonial, index) => (
                <div key={index} className="testimonial-card">
                  <div className="testimonial-avatar-wrapper">
                    {testimonial.image && (
                      <img 
                        src={testimonial.image} 
                        alt={testimonial.name}
                        className="testimonial-image"
                      />
                    )}
                  </div>
                  <div className="testimonial-bubble">
                    <p className="testimonial-text">{testimonial.text}</p>
                    <div className="testimonial-author">
                      <span className="author-name">&mdash; {testimonial.name}</span>, <span className="author-title">{testimonial.title}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      <section id="contact" className="section section-alt">
        <div className="container reveal">
          <h2 className="section-title">Contact Me</h2>
          <div className="contact-content">
            <div className="contact-form">
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <input 
                      type="text" 
                      name="firstName"
                      placeholder="First Name"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <input 
                      type="text" 
                      name="lastName"
                      placeholder="Last Name"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <input 
                    type="email" 
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <input 
                    type="text" 
                    name="subject"
                    placeholder="Subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <textarea 
                    name="message"
                    placeholder="Message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                  ></textarea>
                </div>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
                {submitStatus.message && (
                  <p className={`submit-status ${submitStatus.type}`}>
                    {submitStatus.message}
                  </p>
                )}
              </form>
            </div>
            <div className="contact-info">
              <div className="contact-item">
                <div className="contact-icon">
                  <Icons.Phone />
                </div>
                <div className="contact-details">
                  <h4>Phone</h4>
                  <p>+233 5 379 148 90</p>
                  <p>+234 90 162 435 75</p>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon">
                  <Icons.Mail />
                </div>
                <div className="contact-details">
                  <h4>Email</h4>
                  <p>emmanuelryan4621@gmail.com</p>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon">
                  <Icons.MapPin />
                </div>
                <div className="contact-details">
                  <h4>Location</h4>
                  <p>Accra, Ghana</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-about">
              <h3>Behind the Interface</h3>
              <p>
                Interfaces are what users see. Systems are what make them work. The balance between both is where good web experiences live.
              </p>
            </div>
            <div className="footer-links-wrapper">
              <div className="footer-column">
                <h4>Navigation</h4>
                <ul>
                  <li><a href="#home">Home</a></li>
                  <li><a href="#about">About</a></li>
                  <li><a href="#portfolio">Portfolio</a></li>
                  <li><a href="#services">Services</a></li>
                  <li><a href="#resume">Resume</a></li>
                </ul>
              </div>
              <div className="footer-column">
                <h4>Contact</h4>  
                <ul>
                  <li><p>Accra, Ghana</p></li>
                  <li><a href="tel:+12345678900">+233 5 379 148 90</a></li>
                  <li><a href="tel:+12345678900">+234 90 162 435 75</a></li>
                  <li><a href="mailto:emmanuelryan4621@gmail.com">emmanuelryan4621@gmail.com</a></li>
                </ul>
              </div>
              <div className="footer-column">
                <h4>Connect</h4>
                <div className="social-links">
                  <a href="#" className="social-link" aria-label="Instagram"><Icons.Instagram /></a>
                  <a href="#" className="social-link" aria-label="Twitter"><Icons.Twitter /></a>
                  <a href="https://linkedin.com/in/emmanuelryan" className="social-link" aria-label="LinkedIn"><Icons.Linkedin /></a>
                  <a href="https://github.com/ryan4621" className="social-link" aria-label="GitHub"><Icons.GitHub /></a>
                </div>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} Mgbeadichie Emmanuel. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Portfolio;
