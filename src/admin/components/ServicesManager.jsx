import { useState, useEffect } from 'react';

const ServicesManager = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Available icons matching frontend Icon component map
  const availableIcons = ['Code', 'Design', 'Shopping', 'Phone', 'Mail', 'Globe', 'Link'];

  useEffect(() => {
    fetch('http://localhost:5001/api/content')
      .then(res => res.json())
      .then(res => {
        if (res.success && res.content.services) setItems(res.content.services);
        setLoading(false);
      });
  }, []);

  const handleChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const addItem = () => setItems([...items, { icon: 'Code', title: 'New Service', description: 'Service description...' }]);
  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('http://localhost:5001/api/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: 'services', data: items })
      });
      const result = await res.json();
      if (result.success) {
        setMessage('Services updated!');
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
            <div style={{ marginBottom: '0.5rem' }}>
              <label>Icon</label>
              <select 
                value={item.icon} 
                onChange={(e) => handleChange(index, 'icon', e.target.value)}
              >
                {availableIcons.map(icon => <option key={icon} value={icon}>{icon}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <label>Title</label>
              <input type="text" value={item.title} onChange={(e) => handleChange(index, 'title', e.target.value)} style={{ width: '100%', padding: '0.5rem' }} />
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <label>Description</label>
              <textarea value={item.description} onChange={(e) => handleChange(index, 'description', e.target.value)} rows="3" style={{ width: '100%', padding: '0.5rem' }} />
            </div>
            <button onClick={() => removeItem(index)} style={{ padding: '0.5rem', width: '100%', background: '#ff6b6b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Remove</button>
          </div>
        ))}
        <button onClick={addItem} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', border: '2px dashed #ccc', borderRadius: '4px', cursor: 'pointer' }}>+ Add Service</button>
      </div>
      <button onClick={handleSave} disabled={saving} style={{ padding: '0.75rem 1.5rem', background: '#96bb7c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>{saving ? 'Saving...' : 'Save All Changes'}</button>
      {message && <p style={{ marginTop: '1rem', color: 'green' }}>{message}</p>}
    </div>
  );
};

export default ServicesManager;
