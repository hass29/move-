import { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const AnimalRegistry = ({ animals, refreshData, showToast }) => {
  const [editingAnimal, setEditingAnimal] = useState(null);

  const handleEdit = (animal) => {
    const newName = prompt("Edit Animal Name:", animal.name);
    if (newName?.trim()) animal.name = newName.trim();
    const newSpecies = prompt("Species:", animal.species);
    if (newSpecies?.trim()) animal.species = newSpecies.trim();
    const newUnit = prompt("Unit (individuals, heads, etc):", animal.unit);
    if (newUnit?.trim()) animal.unit = newUnit.trim();
    const newAge = prompt("Age (Years):", animal.age);
    if (newAge?.trim()) animal.age = newAge.trim();
    const newHealth = prompt("Health Status:", animal.health);
    if (newHealth?.trim()) animal.health = newHealth.trim();
    const newCap = prompt("Current Capacity (number):", animal.capacity);
    if (newCap !== null && !isNaN(parseInt(newCap))) animal.capacity = parseInt(newCap);

    axios.put(`${API_URL}/animals/${animal._id}`, animal)
      .then(() => {
        refreshData();
        showToast(`${animal.name} updated.`);
      })
      .catch(err => console.error(err));
  };

  const handleDelete = (animal) => {
    if (confirm(`Delete ${animal.name}? This will remove all associated data.`)) {
      axios.delete(`${API_URL}/animals/${animal._id}`)
        .then(() => {
          refreshData();
          showToast(`${animal.name} removed.`);
        })
        .catch(err => console.error(err));
    }
  };

  const handleAdd = () => {
    const name = prompt("Animal Name");
    if (name) {
      const species = prompt("Species");
      const unit = prompt("Unit", "individuals");
      const age = prompt("Age (Years)", "Unknown");
      const health = prompt("Health Status", "Good");
      const initCap = prompt("Initial Capacity", "10");
      
      axios.post(`${API_URL}/animals`, {
        name, species, unit, age, health, capacity: parseInt(initCap) || 0
      })
        .then(() => {
          refreshData();
          showToast(`New animal "${name}" registered.`);
        })
        .catch(err => console.error(err));
    }
  };

  return (
    <div className="card">
      <div className="card-title"><i className="fas fa-paw"></i> Animal Registry — Species & Health Status</div>
      <div className="table-wrapper">
        <table id="animalTable">
          <thead>
            <tr><th>ID</th><th>Animal Name</th><th>Species</th><th>Current Capacity</th><th>Unit</th><th>Age (Years)</th><th>Health</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {animals.map((animal, idx) => (
              <tr key={animal._id}>
                <td>{idx + 1}</td>
                <td><strong>{animal.name}</strong></td>
                <td>{animal.species}</td>
                <td>{animal.capacity} {animal.unit}</td>
                <td>{animal.unit}</td>
                <td>{animal.age}</td>
                <td><span className="health-badge">{animal.health}</span></td>
                <td>
                  <button className="action-btn" onClick={() => handleEdit(animal)} style={{ color: '#c27e3a' }}>
                    <i className="fas fa-edit"></i> Edit
                  </button>
                  <button className="action-btn" onClick={() => handleDelete(animal)} style={{ color: '#bc5a3c' }}>
                    <i className="fas fa-trash"></i> Del
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button onClick={handleAdd} className="btn-primary" style={{ background: '#a5642a', marginTop: '1rem' }}>
        <i className="fas fa-plus-circle"></i> Register New Animal
      </button>
    </div>
  );
};

export default AnimalRegistry;