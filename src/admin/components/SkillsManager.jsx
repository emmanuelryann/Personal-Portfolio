import { useState, useEffect } from 'react';
import { API_ENDPOINTS, authenticatedFetch, getAuthHeaders, formatValidationErrors } from '../../config/api';
import '../styles/SkillsManager.css';

const SkillsManager = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.content);
        const res = await response.json();
        
        if (res.success && res.content.skills) {
          setSkills(res.content.skills);
        }
        setLoading(false);
      } catch (err) {
        console.error('Failed to load skills:', err);
        setLoading(false);
      }
    };

    fetchSkills();
  }, []);

  const handleChange = (index, field, value) => {
    const newSkills = [...skills];
    newSkills[index][field] = value;
    setSkills(newSkills);
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

  const addSkill = () => {
    setSkills([...skills, { name: 'New Skill', image: '' }]);
  };

  const removeSkill = (index) => {
    const newSkills = skills.filter((_, i) => i !== index);
    setSkills(newSkills);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const response = await authenticatedFetch(API_ENDPOINTS.content, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ section: 'skills', data: skills })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setMessage({ text: 'Skills updated successfully!', type: 'success' });
        setTimeout(() => setMessage(''), 5000);
      } else {
        setMessage({ text: formatValidationErrors(result) || 'Failed to update skills.', type: 'error' });
        setTimeout(() => setMessage(''), 5000);
      }
    } catch (error) {
      console.error('Save failed:', error);
      const errorMsg = error.data ? formatValidationErrors(error.data) : 'Failed to update skills.';
      setMessage({ text: errorMsg, type: 'error' });
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="admin-form skills-manager">
      <div className="skills-manager__grid">
        {skills.map((skill, index) => (
          <div key={index} className="skills-manager__item-card">
            <div className="skills-manager__icon-section">
              <div className="skills-manager__icon-preview">
                {skill.image ? (
                  <img src={skill.image} alt={skill.name} />
                ) : (
                  <span className="skills-manager__no-icon">No Icon</span>
                )}
              </div>
              <div className="skills-manager__upload-wrapper">
                <input 
                  type="file" 
                  onChange={(e) => handleImageUpload(index, e)} 
                  className="skills-manager__file-input"
                  accept="image/*"
                />
                <input 
                  type="text" 
                  value={skill.image || ''} 
                  placeholder="Or Image URL"
                  onChange={(e) => handleChange(index, 'image', e.target.value)}
                  className="skills-manager__url-input"
                />
              </div>
            </div>

            <div className="skills-manager__name-section">
              <label>Skill Name</label>
              <input 
                type="text" 
                value={skill.name} 
                onChange={(e) => handleChange(index, 'name', e.target.value)}
              />
            </div>

            <button 
              onClick={() => removeSkill(index)}
              className="skills-manager__remove-btn"
            >
              Remove
            </button>
          </div>
        ))}
        <button 
          onClick={addSkill}
          className="skills-manager__add-btn"
        >
          + Add Skill
        </button>
      </div>

      <button 
        onClick={handleSave}
        disabled={saving}
        className="skills-manager__save-btn"
      >
        {saving ? 'Saving...' : 'Save All Changes'}
      </button>
      
      {message && (
        <p className={`skills-manager__message skills-manager__message--${message.type}`}>
          {message.text}
        </p>
      )}
    </div>
  );
};

export default SkillsManager;