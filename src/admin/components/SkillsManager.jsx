import { useState, useEffect } from 'react';

const SkillsManager = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('http://localhost:5001/api/content')
      .then(res => res.json())
      .then(res => {
        if (res.success && res.content.skills) {
          setSkills(res.content.skills);
        }
        setLoading(false);
      });
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
      const res = await fetch('http://localhost:5001/api/upload', { method: 'POST', body: formData });
      const result = await res.json();
      if (result.success) {
        handleChange(index, 'image', result.url);
      }
    } catch {
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
      const res = await fetch('http://localhost:5001/api/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: 'skills', data: skills })
      });
      const result = await res.json();
      if (result.success) {
        setMessage('Skills updated successfully!');
        setTimeout(() => setMessage(''), 5000);
      }
    } catch (error) {
      setMessage('Failed to update skills.');
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="admin-form">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {skills.map((skill, index) => (
          <div key={index} style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: 'white' }}>
            <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
               {/* Icon Preview */}
               <div style={{ width: '50px', height: '50px', border: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                 {skill.image ? (
                   <img src={skill.image} alt={skill.name} style={{ maxWidth: '80%', maxHeight: '80%' }} />
                 ) : (
                   <span style={{ fontSize: '0.8rem', color: '#ccc' }}>No Icon</span>
                 )}
               </div>
               {/* Upload */}
               <div style={{ flex: 1 }}>
                 <input type="file" onChange={(e) => handleImageUpload(index, e)} style={{ fontSize: '0.8rem', width: '100%' }} />
                 <input 
                   type="text" 
                   value={skill.image || ''} 
                   placeholder="Or Image URL"
                   onChange={(e) => handleChange(index, 'image', e.target.value)}
                   style={{ fontSize: '0.7rem', marginTop: '0.25rem', padding: '0.25rem', width: '100%' }}
                 />
               </div>
            </div>

            <div style={{ marginBottom: '0.5rem' }}>
              <label>Skill Name</label>
              <input 
                type="text" 
                value={skill.name} 
                onChange={(e) => handleChange(index, 'name', e.target.value)}
              />
            </div>

            <button 
              onClick={() => removeSkill(index)}
              style={{ padding: '0.3rem 0.5rem', backgroundColor: '#ff6b6b', color: 'white', border: 'none', borderRadius: '4px', width: '100%', marginTop: '0.5rem', cursor: 'pointer' }}
            >
              Remove
            </button>
          </div>
        ))}
        <button 
          onClick={addSkill}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', border: '2px dashed #ccc', borderRadius: '4px', background: 'none', cursor: 'pointer', minHeight: '150px' }}
        >
          + Add Skill
        </button>
      </div>

      <button 
        onClick={handleSave}
        disabled={saving}
        style={{ padding: '0.75rem 1.5rem', background: '#96bb7c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
      >
        {saving ? 'Saving...' : 'Save All Changes'}
      </button>
      {message && <p style={{ marginTop: '1rem', color: 'green' }}>{message}</p>}
    </div>
  );
};

export default SkillsManager;
