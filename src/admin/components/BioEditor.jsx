import { useState, useEffect } from 'react';

const BioEditor = () => {
  const [data, setData] = useState({ image: '', heading: '', paragraphs: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('http://localhost:5001/api/content')
      .then(res => res.json())
      .then(res => {
        if (res.success && res.content.bio) {
          setData(res.content.bio);
        }
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, []);

  const handleParagraphChange = (index, value) => {
    const newParagraphs = [...data.paragraphs];
    newParagraphs[index] = value;
    setData({ ...data, paragraphs: newParagraphs });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('http://localhost:5001/api/content', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ section: 'bio', data })
      });
      const result = await res.json();
      if (result.success) {
        setMessage('Bio updated successfully!');
        setTimeout(() => setMessage(''), 5000);
      }
    } catch (error) {
      console.error('Save failed', error);
      setMessage('Failed to save changes.');
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('http://localhost:5001/api/upload', { method: 'POST', body: formData });
      const result = await res.json();
      if (result.success) {
        setData({ ...data, image: result.url });
      }
    } catch (error) {
      console.error('Upload failed', error);
      alert('Image upload failed');
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="admin-form">
      <form onSubmit={handleSave}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Profile Image</label>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {data.image && (
              <img src={data.image} alt="Profile" style={{ width: '100px', height: '125px', objectFit: 'cover', borderRadius: '4px' }} />
            )}
            <input type="file" onChange={handleImageUpload} />
          </div>
          <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>Current URL: {data.image}</p>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label>Heading</label>
          <input 
            type="text" 
            value={data.heading} 
            onChange={(e) => setData({ ...data, heading: e.target.value })}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Bio Text (Paragraphs)</label>
          {data.paragraphs.map((para, idx) => (
            <textarea
              key={idx}
              value={para}
              onChange={(e) => handleParagraphChange(idx, e.target.value)}
              rows="4"
              style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          ))}
          <button 
            type="button" 
            onClick={() => setData({ ...data, paragraphs: [...data.paragraphs, ''] })}
            style={{ padding: '0.5rem', background: '#eee', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            + Add Paragraph
          </button>
        </div>

        <button 
          type="submit" 
          disabled={saving}
          style={{ padding: '0.75rem 1.5rem', background: '#96bb7c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
        
        {message && <p style={{ marginTop: '1rem', color: message.includes('Failed') ? 'red' : 'green' }}>{message}</p>}
      </form>
    </div>
  );
};

export default BioEditor;
