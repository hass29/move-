import { useState } from 'react';
import axios from 'axios';
import { downloadPDF } from '../utils/pdfGenerator';

const API_URL = 'http://localhost:5000/api';

const AdminPanel = ({ refreshData, showToast }) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [requests, setRequests] = useState([]);
  const [animals, setAnimals] = useState([]);

  const fetchData = async () => {
    try {
      const [requestsRes, animalsRes] = await Promise.all([
        axios.get(`${API_URL}/requests`),
        axios.get(`${API_URL}/animals`)
      ]);
      setRequests(requestsRes.data);
      setAnimals(animalsRes.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUnlock = async () => {
    try {
      const response = await axios.post(`${API_URL}/auth/admin`, { password });
      if (response.data.success) {
        setAuthenticated(true);
        fetchData();
        showToast('Admin access granted');
      } else {
        showToast('Invalid admin password');
      }
    } catch (error) {
      showToast('Invalid admin password');
    }
  };

  const handleApprove = async (requestId) => {
    try {
      await axios.put(`${API_URL}/requests/${requestId}/approve`);
      fetchData();
      refreshData();
      showToast('Request approved successfully');
    } catch (error) {
      showToast(error.response?.data?.message || 'Error approving request');
    }
  };

  const handleDecline = async (requestId) => {
    try {
      await axios.put(`${API_URL}/requests/${requestId}/decline`);
      fetchData();
      refreshData();
      showToast('Request declined');
    } catch (error) {
      showToast('Error declining request');
    }
  };

  const handleDelete = async (requestId) => {
    if (confirm('Delete this request? This action cannot be undone.')) {
      try {
        await axios.delete(`${API_URL}/requests/${requestId}`);
        fetchData();
        refreshData();
        showToast('Request deleted');
      } catch (error) {
        showToast('Error deleting request');
      }
    }
  };

  const lowCapacityAnimals = animals.filter(a => a.capacity <= 3);

  if (!authenticated) {
    return (
      <div className="card">
        <div className="card-title"><i className="fas fa-user-shield"></i> Admin Movement Coordinator</div>
        <div className="lock-area">
          <p><i className="fas fa-lock"></i> Admin code: <strong>admin2025</strong></p>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" style={{ padding: '10px 20px', borderRadius: '60px', marginRight: '10px' }} />
          <button onClick={handleUnlock} className="btn-primary">Unlock</button>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-title"><i className="fas fa-user-shield"></i> Admin Movement Coordinator</div>
      <div className="alert">
        {lowCapacityAnimals.length > 0 ? (
          <><i className="fas fa-heartbeat"></i> Low capacity alert: {lowCapacityAnimals.map(a => `${a.name} (${a.capacity})`).join(', ')}</>
        ) : (
          '✅ All capacities adequate'
        )}
      </div>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Requester</th>
              <th>Animal</th>
              <th>Direction</th>
              <th>Qty</th>
              <th>Status</th>
              <th>Actions</th>
              <th>PDF</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(req => (
              <tr key={req._id}>
                <td>{req._id.toString().slice(-5)}</td>
                <td>{req.applicant}<br /><small>{req.phone}</small></td>
                <td>{req.animalName}</td>
                <td>{req.direction.toUpperCase()}</td>
                <td>{req.quantity}</td>
                <td><span className={`status-badge status-${req.status}`}>{req.status}</span></td>
                <td>
                  {req.status === 'pending' && (
                    <>
                      <button className="action-btn" onClick={() => handleApprove(req._id)} style={{ color: '#2f6b47' }}>
                        <i className="fas fa-check"></i> App
                      </button>
                      <button className="action-btn" onClick={() => handleDecline(req._id)} style={{ color: '#bc5a3c' }}>
                        <i className="fas fa-times"></i> Decl
                      </button>
                    </>
                  )}
                  <button className="action-btn" onClick={() => handleDelete(req._id)} style={{ color: '#9e542d' }}>
                    <i className="fas fa-trash"></i> Del
                  </button>
                </td>
                <td>
                  {req.status === 'approved' && (
                    <button className="action-btn" onClick={() => downloadPDF(req)}>
                      <i className="fas fa-file-pdf"></i> PDF
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {requests.length === 0 && (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center' }}>No requests found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPanel;