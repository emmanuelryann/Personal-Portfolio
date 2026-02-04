import { useState, useEffect } from 'react';

const ResumeManager = () => {
  const [experience, setExperience] = useState([]);
  const [education, setEducation] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('http://localhost:5001/api/content')
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          setExperience(res.content.experience || []);
          setEducation(res.content.education || []);
        }
        setLoading(false);
      });
  }, []);

  // Generic handler for both lists
  const handleChange = (list, setList, index, field, value) => {
    const newList = [...list];
    newList[index][field] = value;
    setList(newList);
  };

  const addItem = (list, setList) => {
    setList([...list, { date: '2023 - Present', title: 'Title', company: 'Organization', location: 'Location', type: 'FULLTIME', description: 'Description...' }]);
  };

  const removeItem = (list, setList, index) => {
    setList(list.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save Experience
      await fetch('http://localhost:5001/api/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: 'experience', data: experience })
      });
      // Save Education
      await fetch('http://localhost:5001/api/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: 'education', data: education })
      });
      setMessage('Resume updated!');
      setTimeout(() => setMessage(''), 5000);
    } catch {
      setMessage('Failed to save.');
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setSaving(false);
    }
  };

  const renderList = (title, list, setList, companyLabel) => (
    <div style={{ marginBottom: '2rem' }}>
      <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>{title}</h3>
      {list.map((item, index) => (
        <div key={index} style={{ padding: '1rem', border: '1px solid #ddd', marginBottom: '1rem', borderRadius: '4px', backgroundColor: 'white' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <input 
              placeholder="Date Range"
              value={item.date} 
              onChange={(e) => handleChange(list, setList, index, 'date', e.target.value)} 
              style={{ padding: '0.5rem' }} 
            />
            <input 
              placeholder="Job/Degree Title"
              value={item.title} 
              onChange={(e) => handleChange(list, setList, index, 'title', e.target.value)} 
              style={{ padding: '0.5rem' }} 
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <input
              placeholder={companyLabel}
              value={item.company || item.institution}
              onChange={(e) => handleChange(list, setList, index, item.company ? 'company' : 'institution', e.target.value)}
              style={{ width: '100%', marginBottom: '0.5rem', padding: '0.5rem' }}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <input
                placeholder="Type (e.g. FULLTIME)"
                value={item.type || ''}
                onChange={(e) => handleChange(list, setList, index, 'type', e.target.value)}
                style={{ padding: '0.5rem' }}
              />
              <input
                placeholder="Location"
                value={item.location || ''}
                onChange={(e) => handleChange(list, setList, index, 'location', e.target.value)}
                style={{ padding: '0.5rem' }}
              />
            </div>
          </div>
          <textarea
            placeholder="Description"
            value={item.description}
            onChange={(e) => handleChange(list, setList, index, 'description', e.target.value)}
            rows="2"
          />
          <button onClick={() => removeItem(list, setList, index)} style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}>Remove Item</button>
        </div>
      ))}
      <button onClick={() => addItem(list, setList)} style={{ padding: '0.5rem', background: '#eee', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>+ Add {title}</button>
    </div>
  );

  if (loading) return <p>Loading...</p>;

  return (
    <div className="admin-form">
      {renderList('Work Experience', experience, setExperience, 'Company')}
      {renderList('Education', education, setEducation, 'Institution')}
      
      <button onClick={handleSave} disabled={saving} style={{ padding: '0.75rem 1.5rem', background: '#96bb7c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '1rem' }}>
        {saving ? 'Saving...' : 'Save Resume'}
      </button>
      {message && <p style={{ marginTop: '1rem', color: 'green' }}>{message}</p>}
    </div>
  );
};

export default ResumeManager;
