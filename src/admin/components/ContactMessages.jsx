import { useState, useEffect } from 'react';

const ContactMessages = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Since we store submissions in the same data.json structure, we can fetch via content API
  // NOTE: In a real app, this should be a separate secured route.
  // We'll update the GET /api/content to return submissions ONLY if authenticated? 
  // OR for simplicity now, we just fetch everything but only admin handles it.
  
  // Actually, standard GET /api/content (public) usually EXCLUDES submissions for security.
  // We need a specific endpoint or update logic.
  // Let's assume for this simple implementation, our content API returns everything OR we add a fetch for it.
  // Wait, I designed the GET /api/content to return `data.content` only.
  // So I am missing a route to GET submissions.
  // I will add a fetch to `http://localhost:5001/api/content/submissions` (which I need to create)
  // OR I can lazily rely on reading the raw JSON if I expose it.
  
  // Let's update `server/routes/content.js` to include a secure route for submissions later.
  // For now I'll create the component assuming the endpoint exists.
  
  useEffect(() => {
    // I'll need to add this endpoint to content.js soon
    fetch('http://localhost:5001/api/content/submissions') 
      .then(res => res.json())
      .then(res => {
        if (res.success) setSubmissions(res.submissions);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading messages...</p>;

  if (submissions.length === 0) return <p>No messages yet.</p>;

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {submissions.map((sub) => (
          <div key={sub.id} style={{ padding: '1.5rem', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid #f0f0f0', paddingBottom: '0.5rem' }}>
              <span style={{ fontWeight: 'bold', color: '#2c3e50' }}>{sub.firstName} {sub.lastName}</span>
              <span style={{ color: '#888', fontSize: '0.9rem' }}>{new Date(sub.date).toLocaleString()}</span>
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <span style={{ color: '#666', fontSize: '0.9rem', marginRight: '0.5rem' }}>Email:</span>
              <a href={`mailto:${sub.email}`} style={{ color: '#96bb7c' }}>{sub.email}</a>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <span style={{ color: '#666', fontSize: '0.9rem', marginRight: '0.5rem' }}>Subject:</span>
              <span style={{ fontWeight: '500' }}>{sub.subject}</span>
            </div>
            <div style={{ padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '4px', whiteSpace: 'pre-wrap' }}>
              {sub.message}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContactMessages;
