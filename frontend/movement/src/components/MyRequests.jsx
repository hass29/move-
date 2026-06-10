import { useState } from 'react';
import axios from 'axios';
import { downloadPDF } from '../utils/pdfGenerator';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_URL = `${API_BASE_URL}/api`;


const MyRequests = ({ refreshData, showToast }) => {
  const [requests, setRequests] = useState([]);
  const [searched, setSearched] = useState(false);

  const fetchMyRequests = async () => {
    try {
      const response = await axios.get(`${API_URL}/requests`);
      setRequests(response.data);
      setSearched(true);
    } catch (error) {
      console.error(error);
      showToast('Error fetching requests');
    }
  };

  const handlePDF = (request) => {
    downloadPDF(request);
  };

  return (
    <div className="card">
      <div className="card-title"><i className="fas fa-ticket-alt"></i> All Movement Requests</div>
      <div className="filter-bar">
        <button className="btn-primary" onClick={fetchMyRequests}>View All Requests</button>
      </div>
      {searched && (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>ID</th><th>Requester</th><th>Phone</th><th>Animal</th><th>Type</th><th>Qty</th><th>Status</th><th>Date</th><th>PDF</th></tr>
            </thead>
            <tbody>
              {requests.map(req => {
                const cls = req.status === 'approved' ? 'status-approved' : (req.status === 'pending' ? 'status-pending' : 'status-declined');
                const dirLabel = req.direction === 'inward' ? '⬇️ Inward' : '⬆️ Outward';
                return (
                  <tr key={req._id}>
                    <td>#{req._id.toString().slice(-5)}</td>
                    <td>{req.applicant || '-'}</td>
                    <td>{req.phone || '-'}</td>
                    <td>{req.animalName}</td>
                    <td>{dirLabel}</td>
                    <td>{req.quantity}</td>
                    <td><span className={`status-badge ${cls}`}>{req.status}</span></td>
                    <td>{req.datetime ? new Date(req.datetime).toLocaleString() : '-'}</td>
                    <td>{req.status === 'approved' && (
                      <button className="action-btn" onClick={() => handlePDF(req)} style={{ color: '#c27e3a' }}>
                        <i className="fas fa-download"></i> PDF
                      </button>
                    )}</td>
                  </tr>
                );
              })}
              {requests.length === 0 && (
                <tr><td colSpan="9" style={{ textAlign: 'center' }}>No requests found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyRequests;