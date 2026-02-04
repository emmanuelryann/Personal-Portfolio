import { useState, useEffect } from 'react';
import { API_ENDPOINTS, authenticatedFetch, getAuthHeaders } from '../../config/api';
import '../styles/PortfolioManager.css';

const PortfolioManager = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.content);
        const res = await response.json();
        
        if (res.success && res.content.portfolio) {
          setItems(res.content.portfolio);
        }
        setLoading(false);
      } catch (err) {
        console.error('Failed to load portfolio:', err);
        setLoading(false);
      }
    };

    fetchPortfolio();
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
      const response = await authenticatedFetch(API_ENDPOINTS.uploadImage, {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (result.success) {
        handleChange(index, 'image', result.url);
      } else {
        alert(result.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed');
    }
  };

  const addItem = () => {
    setItems([...items, { id: Date.now(), title: 'New Project', image: '' }]);
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
        body: JSON.stringify({ section: 'portfolio', data: items })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setMessage('Portfolio updated successfully!');
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
    <div className="admin-form portfolio-manager">
      <div className="portfolio-manager__grid">
        {items.map((item, index) => (
          <div key={item.id} className="portfolio-manager__item-card">
            <div className="portfolio-manager__image-section">
              <label className="portfolio-manager__image-label">Project Image</label>
              {item.image && (
                <img 
                  src={item.image} 
                  alt="Preview" 
                  className="portfolio-manager__image-preview"
                />
              )}
              <div className="portfolio-manager__image-upload">
                <input 
                  type="file" 
                  onChange={(e) => handleImageUpload(index, e)} 
                  accept="image/*"
                />
                <p className="portfolio-manager__image-url">
                  URL: {item.image}
                </p>
              </div>
            </div>

            <div className="portfolio-manager__title-section">
              <label className="portfolio-manager__title-label">Title</label>
              <input 
                type="text" 
                value={item.title} 
                onChange={(e) => handleChange(index, 'title', e.target.value)} 
              />
            </div>

            <button 
              onClick={() => removeItem(index)} 
              className="portfolio-manager__delete-btn"
            >
              Delete Project
            </button>
          </div>
        ))}
        <button 
          onClick={addItem} 
          className="portfolio-manager__add-btn"
        >
          + Add Project
        </button>
      </div>
      
      <button 
        onClick={handleSave} 
        disabled={saving} 
        className="portfolio-manager__save-btn"
      >
        {saving ? 'Saving...' : 'Save All Changes'}
      </button>
      
      {message && <p className="portfolio-manager__message">{message}</p>}
    </div>
  );
};

export default PortfolioManager;