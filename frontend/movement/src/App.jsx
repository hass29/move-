import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Header from './components/Header';
import AnimalRegistry from './components/AnimalRegistry';
import RequestMovement from './components/RequestMovement';
import MyRequests from './components/MyRequests';
import MovementLedger from './components/MovementLedger';
import AdminPanel from './components/AdminPanel';

// ✅ FIXED: Use environment variable with fallback
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_URL = `${API_BASE_URL}/api`;

function App() {
  const [activeTab, setActiveTab] = useState('inv');
  const [animals, setAnimals] = useState([]);
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({ totalAnimals: 0, totalCapacity: 0, pendingTrips: 0 });
  const [showToast, setShowToast] = useState(null);

  const showToastMessage = useCallback((msg) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 3000);
  }, []);

  const fetchAnimals = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/animals`);
      setAnimals(response.data);
    } catch (error) {
      console.error('Error fetching animals:', error);
    }
  }, []);

  const fetchRequests = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/requests`);
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  }, []);

  const fetchStats = useCallback(() => {
    const totalAnimals = animals.length;
    const totalCapacity = animals.reduce((sum, a) => sum + a.capacity, 0);
    const pendingTrips = requests.filter(r => r.status === 'pending').length;
    setStats({ totalAnimals, totalCapacity, pendingTrips });
  }, [animals, requests]);

  useEffect(() => {
    fetchAnimals();
    fetchRequests();
  }, [fetchAnimals, fetchRequests]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const refreshData = useCallback(() => {
    fetchAnimals();
    fetchRequests();
  }, [fetchAnimals, fetchRequests]);

  return (
    <div className="app-container">
      <Header stats={stats} />
      
      <div className="nav-tabs">
        <button className={`tab-btn ${activeTab === 'inv' ? 'active' : ''}`} onClick={() => setActiveTab('inv')}>
          <i className="fas fa-dog"></i> Animal Registry
        </button>
        <button className={`tab-btn ${activeTab === 'apply' ? 'active' : ''}`} onClick={() => setActiveTab('apply')}>
          <i className="fas fa-truck-moving"></i> Request Movement
        </button>
        <button className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`} onClick={() => setActiveTab('requests')}>
          <i className="fas fa-clipboard-list"></i> My Requests
        </button>
        <button className={`tab-btn ${activeTab === 'ledger' ? 'active' : ''}`} onClick={() => setActiveTab('ledger')}>
          <i className="fas fa-history"></i> Movement Ledger 🔒
        </button>
        <button className={`tab-btn ${activeTab === 'admin' ? 'active' : ''}`} onClick={() => setActiveTab('admin')}>
          <i className="fas fa-user-shield"></i> Admin Panel
        </button>
      </div>

      {activeTab === 'inv' && <AnimalRegistry animals={animals} refreshData={refreshData} showToast={showToastMessage} />}
      {activeTab === 'apply' && <RequestMovement animals={animals} refreshData={refreshData} showToast={showToastMessage} />}
      {activeTab === 'requests' && <MyRequests refreshData={refreshData} showToast={showToastMessage} />}
      {activeTab === 'ledger' && <MovementLedger animals={animals} showToast={showToastMessage} />}
      {activeTab === 'admin' && <AdminPanel refreshData={refreshData} showToast={showToastMessage} />}

      {showToast && <div className="toast-msg"><i className="fas fa-check-circle"></i> {showToast}</div>}
    </div>
  );
}

export default App;