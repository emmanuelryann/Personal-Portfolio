import { useState, useEffect } from 'react';
import { API_ENDPOINTS, authenticatedFetch, getAuthHeaders, formatValidationErrors } from '../../config/api';
import '../styles/BioEditor.css';

const BioEditor = () => {
  const [data, setData] = useState({ image: '', heading: '', paragraphs: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchBioData = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.content);
        const res = await response.json();
        
        if (res.success && res.content.bio) {
          setData(res.content.bio);
        }
        setLoading(false);
      } catch (err) {
        console.error('Failed to load bio data:', err);
        setLoading(false);
      }
    };

    fetchBioData();
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
      const response = await authenticatedFetch(API_ENDPOINTS.content, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ section: 'bio', data })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setMessage({ text: 'Bio updated successfully!', type: 'success' });
        setTimeout(() => setMessage(''), 5000);
      } else {
        setMessage({ text: formatValidationErrors(result) || 'Failed to save changes.', type: 'error' });
        setTimeout(() => setMessage(''), 5000);
      }
    } catch (error) {
      console.error('Save failed', error);
      const errorMsg = error.data ? formatValidationErrors(error.data) : 'Failed to save changes.';
      setMessage({ text: errorMsg, type: 'error' });
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
      const response = await authenticatedFetch(API_ENDPOINTS.uploadImage, {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (result.success) {
        setData({ ...data, image: result.url });
      } else {
        alert(result.message || 'Image upload failed');
      }
    } catch (error) {
      console.error('Upload failed', error);
      alert('Image upload failed');
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="admin-form bio-editor">
      <form onSubmit={handleSave}>
        <div className="bio-editor__image-section">
          <label className="bio-editor__image-label">Profile Image</label>
          <div className="bio-editor__image-preview-wrapper">
            {data.image && (
              <img 
                src={data.image} 
                alt="Profile" 
                className="bio-editor__image-preview"
              />
            )}
            <input type="file" onChange={handleImageUpload} accept="image/*" />
          </div>
          <p className="bio-editor__image-url">Current URL: {data.image}</p>
        </div>

        <div className="bio-editor__heading-section">
          <label>Heading</label>
          <input 
            type="text" 
            value={data.heading} 
            onChange={(e) => setData({ ...data, heading: e.target.value })}
          />
        </div>

        <div className="bio-editor__paragraphs-section">
          <label className="bio-editor__paragraphs-label">Bio Text (Paragraphs)</label>
          {data.paragraphs.map((para, idx) => (
            <textarea
              key={idx}
              value={para}
              onChange={(e) => handleParagraphChange(idx, e.target.value)}
              rows="4"
              className="bio-editor__paragraph-textarea"
            />
          ))}
          <button 
            type="button" 
            onClick={() => setData({ ...data, paragraphs: [...data.paragraphs, ''] })}
            className="bio-editor__add-paragraph-btn"
          >
            + Add Paragraph
          </button>
        </div>

        <button 
          type="submit" 
          disabled={saving}
          className="bio-editor__save-btn"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
        
        {message && (
          <p className={`bio-editor__message bio-editor__message--${message.type}`}>
            {message.text}
          </p>
        )}
      </form>
    </div>
  );
};

export default BioEditor;