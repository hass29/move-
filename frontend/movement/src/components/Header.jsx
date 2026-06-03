const Header = ({ stats }) => {
  return (
    <div className="header">
      <div>
        <h1><i className="fas fa-paw"></i> Animal Moves</h1>
        <p>🐾 Transport • Care • Movement Management</p>
      </div>
      <div className="stats">
        <div className="stat-card">
          <div className="number">{stats.totalAnimals}</div>
          <div className="label">Animals</div>
        </div>
        <div className="stat-card">
          <div className="number">{stats.totalCapacity}</div>
          <div className="label">Total Capacity</div>
        </div>
        <div className="stat-card">
          <div className="number">{stats.pendingTrips}</div>
          <div className="label">Pending</div>
        </div>
      </div>
    </div>
  );
};

export default Header;