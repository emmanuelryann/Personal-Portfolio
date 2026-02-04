import { useState, useEffect } from 'react';
import { API_ENDPOINTS, authenticatedFetch, getAuthHeaders } from '../../config/api';
import '../styles/ServicesManager.css';

const ServicesManager = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Available icons matching frontend Icon component map
  const availableIcons = ['Code', 'Design', 'Shopping', 'Phone', 'Mail', 'Globe', 'Link'];

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.content);
        const res = await response.json();
        
        if (res.success && res.content.services) {
          setItems(res.content.services);
        }
        setLoading(false);
      } catch (err) {
        console.error('Failed to load services:', err);
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const handleChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { 
      icon: 'Code', 
      title: 'New Service', 
      description: 'Service description...' 
    }]);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      const response = await authenticatedFetch(API_ENDPOINTS.content, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ section: 'services', data: items })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setMessage('Services updated!');
        setTimeout(() => setMessage(''), 5000);
      } else {
        setMessage(result.message || 'Failed to save.');
        setTimeout(() => setMessage(''), 5000);
      }
    } catch (error) {
      console.error('Save failed:', error);
      setMessage('Failed to save.');
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="admin-form services-manager">
      <div className="services-manager__grid">
        {items.map((item, index) => (
          <div key={index} className="services-manager__item-card">
            <div className="services-manager__form-group">
              <label>Icon</label>
              <select 
                value={item.icon} 
                onChange={(e) => handleChange(index, 'icon', e.target.value)}
              >
                {availableIcons.map(icon => (
                  <option key={icon} value={icon}>{icon}</option>
                ))}
              </select>
            </div>

            <div className="services-manager__form-group">
              <label>Title</label>
              <input 
                type="text" 
                value={item.title} 
                onChange={(e) => handleChange(index, 'title', e.target.value)} 
                className="services-manager__input"
              />
            </div>

            <div className="services-manager__form-group">
              <label>Description</label>
              <textarea 
                value={item.description} 
                onChange={(e) => handleChange(index, 'description', e.target.value)} 
                rows="3"
                className="services-manager__textarea"
              />
            </div>

            <button 
              onClick={() => removeItem(index)} 
              className="services-manager__remove-btn"
            >
              Remove
            </button>
          </div>
        ))}
        <button 
          onClick={addItem} 
          className="services-manager__add-btn"
        >
          + Add Service
        </button>
      </div>

      <button 
        onClick={handleSave} 
        disabled={saving} 
        className="services-manager__save-btn"
      >
        {saving ? 'Saving...' : 'Save All Changes'}
      </button>
      
      {message && <p className="services-manager__message">{message}</p>}
    </div>
  );
};

export default ServicesManager;