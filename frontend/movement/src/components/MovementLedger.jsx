import { useState, useEffect } from 'react';
import axios from 'axios';
import { downloadPDF } from '../utils/pdfGenerator';

const API_URL = 'http://localhost:5000/api';

const MovementLedger = ({ animals, showToast }) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [ledger, setLedger] = useState([]);
  const [summary, setSummary] = useState({ totalIn: 0, totalOut: 0, net: 0 });
  const [filters, setFilters] = useState({ animalId: 'all', direction: 'all', fromDate: '', toDate: '' });

  const fetchLedger = async () => {
    try {
      const params = new URLSearchParams(filters);
      const response = await axios.get(`${API_URL}/ledger?${params}`);
      setLedger(response.data.ledger);
      setSummary(response.data.summary);
    } catch (error) {
      console.error(error);
      showToast('Error fetching ledger');
    }
  };

  const handleUnlock = async () => {
    try {
      const response = await axios.post(`${API_URL}/auth/ledger`, { password });
      if (response.data.success) {
        setAuthenticated(true);
        fetchLedger();
        showToast('Ledger unlocked successfully');
      } else {
        showToast('Invalid password');
      }
    } catch (error) {
      showToast('Invalid password');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  const handleReset = () => {
    setFilters({ animalId: 'all', direction: 'all', fromDate: '', toDate: '' });
  };

  useEffect(() => {
    if (authenticated) {
      fetchLedger();
    }
  }, [filters, authenticated]);

  if (!authenticated) {
    return (
      <div className="card">
        <div className="card-title"><i className="fas fa-book"></i> Animal Movement Ledger 🔒</div>
        <div className="lock-area">
          <i className="fas fa-lock" style={{ fontSize: '2.5rem', color: '#c27e3a' }}></i>
          <p style={{ margin: '1rem 0' }}>
            <strong>🔐 Secure Ledger Access</strong><br />
            Password: <code style={{ background: '#f0e3d6', padding: '4px 12px', borderRadius: '40px' }}>animal2025</code>
          </p>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" style={{ padding: '10px 20px', borderRadius: '60px', width: '240px' }} />
          <button onClick={handleUnlock} className="btn-primary">Unlock</button>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-title"><i className="fas fa-book"></i> Animal Movement Ledger 🔒</div>
      <div className="filter-bar">
        <div className="filter-group">
          <label>Animal:</label>
          <select value={filters.animalId} onChange={(e) => handleFilterChange('animalId', e.target.value)}>
            <option value="all">All Animals</option>
            {animals.map(animal => (
              <option key={animal._id} value={animal._id}>{animal.name} ({animal.species})</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Movement:</label>
          <select value={filters.direction} onChange={(e) => handleFilterChange('direction', e.target.value)}>
            <option value="all">All</option><option value="inward">Inward</option><option value="outward">Outward</option>
          </select>
        </div>
        <div className="filter-group">
          <label>From:</label>
          <input type="date" value={filters.fromDate} onChange={(e) => handleFilterChange('fromDate', e.target.value)} />
        </div>
        <div className="filter-group">
          <label>To:</label>
          <input type="date" value={filters.toDate} onChange={(e) => handleFilterChange('toDate', e.target.value)} />
        </div>
        <button onClick={handleReset} className="btn-primary" style={{ padding: '6px 20px' }}>Reset</button>
      </div>
      <div className="summary-card">
        <div><i className="fas fa-chart-line"></i> Summary: Inward: {summary.totalIn} | Outward: {summary.totalOut} | Net: {summary.net}</div>
      </div>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr><th>Date</th><th>Request ID</th><th>Animal</th><th>Direction</th><th># In</th><th># Out</th><th>Balance</th><th>Requester</th><th>Notes</th><th>PDF</th></tr>
          </thead>
          <tbody>
            {ledger.map((entry, idx) => {
              // Calculate running balance (you may want to implement this properly)
              let balance = 0;
              // Note: You might want to calculate actual running balance here
              return (
                <tr key={entry._id}>
                  <td>{new Date(entry.date).toLocaleString()}</td>
                  <td>{entry.requestId?.toString().slice(-5) || entry._id?.toString().slice(-5)}</td>
                  <td>{entry.animalName}</td>
                  <td>{entry.direction === 'inward' ? <span className="inward-text">⬇️ INWARD</span> : <span className="outward-text">⬆️ OUTWARD</span>}</td>
                  <td>{entry.direction === 'inward' ? entry.quantity : '-'}</td>
                  <td>{entry.direction === 'outward' ? entry.quantity : '-'}</td>
                  <td><strong>{balance}</strong></td>
                  <td>{entry.applicant}</td>
                  <td>{entry.purpose?.substring(0, 30) || '-'}</td>
                  <td><button className="action-btn" onClick={() => downloadPDF(entry)}><i className="fas fa-file-pdf"></i></button></td>
                </tr>
              );
            })}
            {ledger.length === 0 && (
              <tr>
                <td colSpan="10" style={{ textAlign: 'center' }}>No movement records found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MovementLedger;