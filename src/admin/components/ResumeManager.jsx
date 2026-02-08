import { useState, useEffect } from 'react';
import { API_ENDPOINTS, authenticatedFetch, getAuthHeaders, formatValidationErrors } from '../../config/api';
import '../styles/ResumeManager.css';

const ResumeManager = () => {
  const [experience, setExperience] = useState([]);
  const [education, setEducation] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchResumeData = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.content);
        const res = await response.json();
        
        if (res.success) {
          setExperience(res.content.experience || []);
          setEducation(res.content.education || []);
        }
        setLoading(false);
      } catch (err) {
        console.error('Failed to load resume data:', err);
        setLoading(false);
      }
    };

    fetchResumeData();
  }, []);

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
      const expResponse = await authenticatedFetch(API_ENDPOINTS.content, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ section: 'experience', data: experience })
      });
      const expData = await expResponse.json();

      if (!expData.success) {
        throw new Error(formatValidationErrors(expData));
      }
      
      // Save Education
      const eduResponse = await authenticatedFetch(API_ENDPOINTS.content, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ section: 'education', data: education })
      });
      const eduData = await eduResponse.json();

      if (!eduData.success) {
        throw new Error(formatValidationErrors(eduData));
      }
      
      setMessage('Resume updated!');
      setTimeout(() => setMessage(''), 5000);
    } catch (error) {
      console.error('Save failed:', error);
      setMessage(error.message || 'Failed to save.');
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
      {renderList('Work Experience', experience, setExperience, 'Company')}
      {renderList('Education', education, setEducation, 'Institution', true)}
      
      <button 
        onClick={handleSave} 
        disabled={saving} 
        className="resume-manager__save-btn"
      >
        {saving ? 'Saving...' : 'Save Resume'}
      </button>
      
      {message && <p className="resume-manager__message">{message}</p>}
    </div>
  );
};

export default ResumeManager;