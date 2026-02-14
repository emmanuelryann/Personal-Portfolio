import { useState, useEffect } from 'react';
import { API_ENDPOINTS, authenticatedFetch, getAuthHeaders, formatValidationErrors } from '../../config/api';
import '../styles/ResumeManager.css';

const ResumeManager = () => {
  const [experience, setExperience] = useState([]);
  const [education, setEducation] = useState([]);
  const [cvUrl, setCvUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchResumeData = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.content);
        const res = await response.json();
        
        if (res.success) {
          setExperience(res.content.experience || []);
          setEducation(res.content.education || []);
          setCvUrl(res.content.cvUrl || '');
        }
        setLoading(false);
      } catch (err) {
        console.error('Failed to load resume data:', err);
        setLoading(false);
      }
    };

    fetchResumeData();
  }, []);

  const handleCvUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setMessage({ text: 'File too large (max 10MB)', type: 'error' });
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('cv', file);

    try {
      const response = await fetch(API_ENDPOINTS.uploadCV, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        setCvUrl(data.url);
        setMessage({ text: 'CV uploaded! Remember to Save.', type: 'success' });
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('CV Upload failed:', error);
      setMessage({ text: error.message || 'CV Upload failed', type: 'error' });
    } finally {
      setUploading(false);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const handleChange = (list, setList, index, field, value) => {
    const newList = [...list];
    newList[index][field] = value;
    setList(newList);
  };

  const addItem = (list, setList, isEducation = false) => {
    const newItem = { 
      date: '2023 - Present', 
      title: isEducation ? 'Degree Title' : 'Job Title', 
      location: 'Location', 
    };
    
    if (isEducation) {
      newItem.institution = 'Organization';
    } else {
      newItem.company = 'Organization';
      newItem.type = 'FULLTIME';
    }
    
    setList([...list, newItem]);
  };

  const removeItem = (list, setList, index) => {
    setList(list.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      // Save Experience
      await authenticatedFetch(API_ENDPOINTS.content, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ section: 'experience', data: experience })
      });
      
      // Save Education
      await authenticatedFetch(API_ENDPOINTS.content, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ section: 'education', data: education })
      });

      // Save CV URL
      await authenticatedFetch(API_ENDPOINTS.content, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ section: 'cvUrl', data: cvUrl })
      });
      
      setMessage({ text: 'Resume updated!', type: 'success' });
      setTimeout(() => setMessage(''), 5000);
    } catch (error) {
      console.error('Save failed:', error);
      setMessage({ text: error.message || 'Failed to save.', type: 'error' });
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setSaving(false);
    }
  };

  const renderList = (title, list, setList, companyLabel, isEducation = false) => (
    <div className="resume-manager__section">
      <h3 className="resume-manager__section-title">{title}</h3>
      {list.map((item, index) => (
        <div key={index} className="resume-manager__item-card">
          <div className="resume-manager__grid-row">
            <input 
              placeholder="Date Range"
              value={item.date} 
              onChange={(e) => handleChange(list, setList, index, 'date', e.target.value)} 
              className="resume-manager__input"
            />
            <input 
              placeholder={isEducation ? "Degree Title" : "Job Title"}
              value={item.title} 
              onChange={(e) => handleChange(list, setList, index, 'title', e.target.value)} 
            className="resume-manager__input"
          />
          </div>
          <div className="resume-manager__form-group">
            <input
              placeholder={companyLabel}
              value={item.company || item.institution}
              onChange={(e) => handleChange(list, setList, index, item.company ? 'company' : 'institution', e.target.value)}
              className="resume-manager__full-width"
            />
            <div className="resume-manager__grid-row">
              {!isEducation && (
                <input
                  placeholder="Type (e.g. FULLTIME)"
                  value={item.type || ''}
                  onChange={(e) => handleChange(list, setList, index, 'type', e.target.value)}
                  className="resume-manager__input"
                />
              )}
              <input
                placeholder="Location"
                value={item.location || ''}
                onChange={(e) => handleChange(list, setList, index, 'location', e.target.value)}
                className={isEducation ? "resume-manager__full-width" : "resume-manager__input"}
              />
            </div>
          </div>
          <button 
            onClick={() => removeItem(list, setList, index)} 
            className="resume-manager__remove-btn"
          >
            Remove Item
          </button>
        </div>
      ))}
      <button 
        onClick={() => addItem(list, setList, isEducation)} 
        className="resume-manager__add-btn"
      >
        + Add {title}
      </button>
    </div>
  );

  if (loading) return <p>Loading...</p>;

  return (
    <div className="admin-form resume-manager">
      <div className="resume-manager__section">
        <h3 className="resume-manager__section-title">Resume File (PDF)</h3>
        <div className="resume-manager__cv-upload">
          {cvUrl ? (
            <div className="resume-manager__cv-current">
              <p>Current CV: <a href={cvUrl} target="_blank" rel="noopener noreferrer">View Current PDF</a></p>
            </div>
          ) : (
            <p className="resume-manager__cv-none">No custom CV uploaded. Using default file.</p>
          )}
          
          <div className="resume-manager__upload-controls">
            <label className="resume-manager__file-label">
              {uploading ? 'Uploading...' : 'Upload New CV'}
              <input 
                type="file" 
                accept=".pdf" 
                onChange={handleCvUpload} 
                disabled={uploading}
                style={{ display: 'none' }}
              />
            </label>
            {cvUrl && (
              <button 
                onClick={() => setCvUrl('')} 
                className="resume-manager__reset-btn"
              >
                Reset to Default
              </button>
            )}
          </div>
        </div>
      </div>

      <hr className="resume-manager__divider" />

      {renderList('Work Experience', experience, setExperience, 'Company')}
      {renderList('Education', education, setEducation, 'Institution', true)}
      
      <button 
        onClick={handleSave} 
        disabled={saving || uploading} 
        className="resume-manager__save-btn"
      >
        {saving ? 'Saving...' : 'Save All Resume Data'}
      </button>
      
      {message && (
        <p className={`resume-manager__message resume-manager__message--${message.type}`}>
          {message.text}
        </p>
      )}
    </div>
  );
};

export default ResumeManager;