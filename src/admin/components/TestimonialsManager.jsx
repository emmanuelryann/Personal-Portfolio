import { useState, useEffect } from 'react';
import { API_ENDPOINTS, authenticatedFetch, getAuthHeaders, formatValidationErrors } from '../../config/api';
import '../styles/TestimonialsManager.css';

const TestimonialsManager = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.content);
        const res = await response.json();
        
        if (res.success && res.content.testimonials) {
          setItems(res.content.testimonials);
        }
        setLoading(false);
      } catch (err) {
        console.error('Failed to load testimonials:', err);
        setLoading(false);
      }
    };

    fetchTestimonials();
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
    setItems([...items, { 
      name: 'New Author', 
      title: 'Position', 
      text: 'Testimonial text...', 
      image: '' 
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
        body: JSON.stringify({ section: 'testimonials', data: items })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setMessage('Testimonials updated!');
        setTimeout(() => setMessage(''), 5000);
      } else {
        setMessage(formatValidationErrors(result) || 'Failed to save.');
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
    <div className="admin-form testimonials-manager">
      <div className="testimonials-manager__grid">
        {items.map((item, index) => (
          <div key={index} className="testimonials-manager__item-card">
            <div className="testimonials-manager__image-section">
              {item.image && (
                <img 
                  src={item.image} 
                  alt="Author" 
                  className="testimonials-manager__avatar"
                />
              )}
              <div className="testimonials-manager__upload-wrapper">
                <input 
                  type="file" 
                  onChange={(e) => handleImageUpload(index, e)} 
                  className="testimonials-manager__file-input"
                  accept="image/*"
                />
                <p className="testimonials-manager__image-url">{item.image}</p>
              </div>
            </div>

            <div className="testimonials-manager__form-group">
              <label>Name</label>
              <input
                type="text"
                value={item.name}
                onChange={(e) => handleChange(index, 'name', e.target.value)}
              />
            </div>

            <div className="testimonials-manager__form-group">
              <label>Title</label>
              <input
                type="text"
                value={item.title}
                onChange={(e) => handleChange(index, 'title', e.target.value)}
              />
            </div>

            <div className="testimonials-manager__form-group">
              <label>Quote</label>
              <textarea
                value={item.text}
                onChange={(e) => handleChange(index, 'text', e.target.value)}
                rows="3"
              />
            </div>

            <button 
              onClick={() => removeItem(index)} 
              className="testimonials-manager__remove-btn"
            >
              Remove
            </button>
          </div>
        ))}
        <button 
          onClick={addItem} 
          className="testimonials-manager__add-btn"
        >
          + Add Testimonial
        </button>
      </div>

      <button 
        onClick={handleSave} 
        disabled={saving} 
        className="testimonials-manager__save-btn"
      >
        {saving ? 'Saving...' : 'Save All Changes'}
      </button>
      
      {message && <p className="testimonials-manager__message">{message}</p>}
    </div>
  );
};

export default TestimonialsManager;