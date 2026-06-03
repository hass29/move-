import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const RequestMovement = ({ animals, refreshData, showToast }) => {
  const [formData, setFormData] = useState({
    reqName: '',
    reqPhone: '',
    reqEmail: '',
    animalId: '',
    animalCount: 1,
    gate: 'Main Gate',
    tripDateTime: new Date().toISOString().slice(0, 16),
    direction: 'inward',
    medicalNotes: ''
  });
  const [warning, setWarning] = useState('');
  const [submitMessage, setSubmitMessage] = useState('');

  useEffect(() => {
    const selectedAnimal = animals.find(a => a._id === formData.animalId);
    if (selectedAnimal && formData.direction === 'outward' && selectedAnimal.capacity <= 3) {
      setWarning(`Low capacity (${selectedAnimal.capacity} left). Outward movement may be limited.`);
    } else {
      setWarning('');
    }
  }, [formData.animalId, formData.direction, animals]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDirectionChange = (direction) => {
    setFormData({ ...formData, direction });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const selectedAnimal = animals.find(a => a._id === formData.animalId);
    if (!selectedAnimal) return;

    if (formData.direction === 'outward' && selectedAnimal.capacity < formData.animalCount) {
      setSubmitMessage(<div className="alert">❌ Insufficient capacity: Only {selectedAnimal.capacity} {selectedAnimal.unit} available.</div>);
      return;
    }

    try {
      await axios.post(`${API_URL}/requests`, {
        animalId: formData.animalId,
        animalName: selectedAnimal.name,
        quantity: parseInt(formData.animalCount),
        direction: formData.direction,
        applicant: formData.reqName,
        phone: formData.reqPhone,
        email: formData.reqEmail,
        gate: formData.gate,
        datetime: formData.tripDateTime,
        purpose: formData.medicalNotes
      });

      setSubmitMessage(<div className="alert" style={{ background: '#e3f1e6' }}>✅ Movement request submitted! Awaiting approval.</div>);
      setFormData({
        reqName: '', reqPhone: '', reqEmail: '', animalId: '', animalCount: 1,
        gate: 'Main Gate', tripDateTime: new Date().toISOString().slice(0, 16),
        direction: 'inward', medicalNotes: ''
      });
      refreshData();
      showToast('Movement request submitted successfully!');
      
      setTimeout(() => setSubmitMessage(''), 3000);
    } catch (error) {
      console.error(error);
      setSubmitMessage(<div className="alert">❌ Error submitting request.</div>);
    }
  };

  return (
    <div className="card">
      <div className="card-title"><i className="fas fa-exchange-alt"></i> Request Animal Movement or Care Service</div>
      {warning && <div className="alert">{warning}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="input-group">
            <label>Requester Name *</label>
            <input type="text" name="reqName" value={formData.reqName} onChange={handleChange} required placeholder="Full name / Organization" />
          </div>
          <div className="input-group">
            <label>Contact *</label>
            <input type="tel" name="reqPhone" value={formData.reqPhone} onChange={handleChange} required placeholder="+91 9876543210" />
          </div>
          <div className="input-group">
            <label>Email *</label>
            <input type="email" name="reqEmail" value={formData.reqEmail} onChange={handleChange} required />
          </div>
          <div className="input-group">
            <label>Select Animal *</label>
            <select name="animalId" value={formData.animalId} onChange={handleChange} required>
              <option value="">Select an animal</option>
              {animals.map(animal => (
                <option key={animal._id} value={animal._id} data-cap={animal.capacity}>
                  {animal.name} ({animal.species}) | Age: {animal.age} | Cap: {animal.capacity} {animal.unit}
                </option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <label>Number of Animals *</label>
            <input type="number" name="animalCount" value={formData.animalCount} onChange={handleChange} required min="1" />
          </div>
          <div className="input-group">
            <label>Pickup/Drop Gate</label>
            <select name="gate" value={formData.gate} onChange={handleChange}>
              <option>Main Gate</option><option>Vet Gate</option><option>Service Entrance</option><option>Quarantine Bay</option>
            </select>
          </div>
          <div className="input-group">
            <label>Scheduled Date & Time</label>
            <input type="datetime-local" name="tripDateTime" value={formData.tripDateTime} onChange={handleChange} />
          </div>
          <div className="input-group">
            <label>Movement Type</label>
            <div className="direction-group">
              <span>
                <input type="radio" name="direction" value="inward" checked={formData.direction === 'inward'} onChange={() => handleDirectionChange('inward')} />
                <label><i className="fas fa-arrow-down"></i> INWARD (Receiving)</label>
              </span>
              <span>
                <input type="radio" name="direction" value="outward" checked={formData.direction === 'outward'} onChange={() => handleDirectionChange('outward')} />
                <label><i className="fas fa-arrow-up"></i> OUTWARD (Sending)</label>
              </span>
            </div>
          </div>
          <div className="input-group">
            <label>Special Notes / Medical Needs</label>
            <textarea name="medicalNotes" rows="2" value={formData.medicalNotes} onChange={handleChange} placeholder="Vaccination, injury, special care instructions..."></textarea>
          </div>
        </div>
        <button type="submit" className="btn-primary"><i className="fas fa-paper-plane"></i> Submit Request</button>
      </form>
      <div id="applyMessage">{submitMessage}</div>
    </div>
  );
};

export default RequestMovement;