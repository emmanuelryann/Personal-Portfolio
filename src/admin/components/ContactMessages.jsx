import { useState, useEffect } from 'react';
import { API_ENDPOINTS, authenticatedFetch } from '../../config/api';
import '../styles/ContactMessages.css';

const ContactMessages = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        // This endpoint requires authentication
        const response = await authenticatedFetch(API_ENDPOINTS.submissions);
        const res = await response.json();
        
        if (res.success) {
          setSubmissions(res.submissions);
        }
        setLoading(false);
      } catch (error) {
        console.error('Failed to load submissions:', error);
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  if (loading) {
    return <p className="contact-messages__loading">Loading messages...</p>;
  }

  if (submissions.length === 0) {
    return <p className="contact-messages__empty">No messages yet.</p>;
  }

  return (
    <div className="contact-messages__container">
      {submissions.map((sub) => (
        <div key={sub.id} className="contact-messages__card">
          <div className="contact-messages__header">
            <span className="contact-messages__name">
              {sub.firstName} {sub.lastName}
            </span>
            <span className="contact-messages__date">
              {new Date(sub.date).toLocaleString()}
            </span>
          </div>

          <div className="contact-messages__email-row">
            <span className="contact-messages__label">Email:</span>
            <a 
              href={`mailto:${sub.email}`} 
              className="contact-messages__email-link"
            >
              {sub.email}
            </a>
          </div>

          <div className="contact-messages__subject-row">
            <span className="contact-messages__label">Subject:</span>
            <span className="contact-messages__subject">{sub.subject}</span>
          </div>

          <div className="contact-messages__message-box">
            {sub.message}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ContactMessages;