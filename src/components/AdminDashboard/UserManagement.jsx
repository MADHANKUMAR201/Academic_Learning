import React, { useState } from 'react';
import '../../../src/styles/components.css';

export default function UserManagement() {
  const [users, setUsers] = useState([
    { id: 1, name: 'John Doe', email: 'john.doe@university.edu', role: 'Student', status: 'Active', enrollmentDate: '2024-01-15' },
    { id: 2, name: 'Dr. Smith', email: 'dr.smith@university.edu', role: 'Faculty', status: 'Active', joinDate: '2020-08-01' },
    { id: 3, name: 'Jane Brown', email: 'jane.brown@university.edu', role: 'Admin', status: 'Active', joinDate: '2015-06-15' },
    { id: 4, name: 'Alice Wilson', email: 'alice.wilson@university.edu', role: 'Student', status: 'Inactive', enrollmentDate: '2023-01-10' },
    { id: 5, name: 'Prof. Johnson', email: 'prof.johnson@university.edu', role: 'Faculty', status: 'Active', joinDate: '2018-09-01' },
  ]);

  const [filterRole, setFilterRole] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Student',
  });

  const filteredUsers = users.filter(user => 
    (filterRole === 'All' || user.role === filterRole) &&
    (filterStatus === 'All' || user.status === filterStatus)
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddUser = () => {
    if (formData.name && formData.email && formData.role) {
      setUsers([...users, {
        id: users.length + 1,
        ...formData,
        status: 'Active',
        enrollmentDate: new Date().toISOString().split('T')[0],
      }]);
      setFormData({
        name: '',
        email: '',
        role: 'Student',
      });
      setShowForm(false);
      alert('User added successfully!');
    }
  };

  const toggleUserStatus = (userId) => {
    setUsers(users.map(u =>
      u.id === userId
        ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' }
        : u
    ));
  };

  const deleteUser = (userId) => {
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(u => u.id !== userId));
      alert('User deleted successfully!');
    }
  };

  return (
    <div className="user-management-container">
      <div className="section-header">
        <h2>User Management</h2>
        <button className="btn-add-user" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Close' : '+ Add New User'}
        </button>
      </div>

      {showForm && (
        <div className="add-user-form">
          <h3>Add New User</h3>
          <div className="form-row">
            <div className="form-field">
              <label>Full Name</label>
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter full name"
              />
            </div>
            <div className="form-field">
              <label>Email</label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter email address"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Role</label>
              <select 
                name="role"
                value={formData.role}
                onChange={handleInputChange}
              >
                <option value="Student">Student</option>
                <option value="Faculty">Faculty</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
          </div>

          <button className="btn-save" onClick={handleAddUser}>Add User</button>
        </div>
      )}

      <div className="filters-section">
        <div className="filter-group">
          <label>Filter by Role:</label>
          <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
            <option value="All">All Roles</option>
            <option value="Student">Student</option>
            <option value="Faculty">Faculty</option>
            <option value="Admin">Admin</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Filter by Status:</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Member Since</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td className="user-name">{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`role-badge role-${user.role.toLowerCase()}`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <span className={`status-badge status-${user.status.toLowerCase()}`}>
                    {user.status}
                  </span>
                </td>
                <td>{user.enrollmentDate || user.joinDate}</td>
                <td className="action-cell">
                  <button 
                    className="btn-toggle"
                    onClick={() => toggleUserStatus(user.id)}
                  >
                    {user.status === 'Active' ? 'Deactivate' : 'Activate'}
                  </button>
                  <button 
                    className="btn-delete"
                    onClick={() => deleteUser(user.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="users-summary">
        <p>Showing {filteredUsers.length} of {users.length} users</p>
      </div>
    </div>
  );
}
