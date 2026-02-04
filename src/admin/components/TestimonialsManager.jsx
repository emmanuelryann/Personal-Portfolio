import { useState, useEffect } from 'react';

const TestimonialsManager = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('http://localhost:5001/api/content')
      .then(res => res.json())
      .then(res => {
        if (res.success && res.content.testimonials) setItems(res.content.testimonials);
        setLoading(false);
      });
  }, []);

  const handleChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleImageUpload = async (index, e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('http://localhost:5001/api/upload', { method: 'POST', body: formData });
      const result = await res.json();
      if (result.success) {
        handleChange(index, 'image', result.url);
      }
    } catch {
      alert('Upload failed');
    }
  };

  const addItem = () => setItems([...items, { name: 'New Author', title: 'Position', text: 'Testimonial text...', image: '' }]);
  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('http://localhost:5001/api/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: 'testimonials', data: items })
      });
      const result = await res.json();
      if (result.success) {
        setMessage('Testimonials updated!');
        setTimeout(() => setMessage(''), 5000);
      }
    } catch {
      setMessage('Failed to save.');
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="admin-form">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {items.map((item, index) => (
          <div key={index} style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: 'white' }}>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              {item.image && <img src={item.image} alt="Author" style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }} />}
              <div style={{ flex: 1 }}>
                <input type="file" onChange={(e) => handleImageUpload(index, e)} style={{ fontSize: '0.8rem' }} />
                <p style={{ fontSize: '0.7rem', color: '#666', marginTop: '0.2rem' }}>{item.image}</p>
              </div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label>Name</label>
              <input
                type="text"
                value={item.name}
                onChange={(e) => handleChange(index, 'name', e.target.value)}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label>Title</label>
              <input
                type="text"
                value={item.title}
                onChange={(e) => handleChange(index, 'title', e.target.value)}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label>Quote</label>
              <textarea
                value={item.text}
                onChange={(e) => handleChange(index, 'text', e.target.value)}
                rows="3"
              />
            </div>
            <button onClick={() => removeItem(index)} style={{ marginTop: '0.5rem', padding: '0.4rem', width: '100%', background: '#ff6b6b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Remove</button>
          </div>
        ))}
        <button onClick={addItem} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', border: '2px dashed #ccc', borderRadius: '4px', cursor: 'pointer' }}>+ Add Testimonial</button>
      </div>
      <button onClick={handleSave} disabled={saving} style={{ padding: '0.75rem 1.5rem', background: '#96bb7c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>{saving ? 'Saving...' : 'Save All Changes'}</button>
      {message && <p style={{ marginTop: '1rem', color: 'green' }}>{message}</p>}
    </div>
  );
};

export default TestimonialsManager;
