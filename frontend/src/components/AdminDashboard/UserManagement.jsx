import React, { useState, useEffect } from 'react';
import { adminAPI, authAPI } from '../../services/api';
import '../../../src/styles/components.css';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [filterRole, setFilterRole] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '', // Added password for registration
    role: 'student',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getAllUsers();
      if (response.success) {
        setUsers(response.data || []);
      } else {
        setError(response.message || 'Failed to fetch users');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    (filterRole === 'All' || user.role.toLowerCase() === filterRole.toLowerCase()) &&
    (filterStatus === 'All' || (filterStatus === 'Active' ? user.isActive : !user.isActive))
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddUser = async () => {
    if (formData.name && formData.email && formData.password && formData.role) {
      try {
        const response = await authAPI.register(formData);
        if (response.success) {
          setFormData({
            name: '',
            email: '',
            password: '',
            role: 'student',
          });
          setShowForm(false);
          alert('User added successfully!');
          fetchUsers();
        } else {
          alert(response.message || 'Failed to add user');
        }
      } catch (err) {
        alert('Failed to connect to server');
      }
    } else {
      alert('Please fill all required fields');
    }
  };

  const toggleUserStatus = async (user) => {
    try {
      const newStatus = !user.isActive;
      const response = await adminAPI.updateUser(user._id, { isActive: newStatus });
      if (response.success) {
        setUsers(users.map(u => u._id === user._id ? { ...u, isActive: newStatus } : u));
      } else {
        alert(response.message || 'Failed to update status');
      }
    } catch (err) {
      alert('Failed to connect to server');
    }
  };

  const deleteUser = async (userId) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await adminAPI.deleteUser(userId);
        if (response.success) {
          setUsers(users.filter(u => u._id !== userId));
          alert('User deleted successfully!');
        } else {
          alert(response.message || 'Failed to delete user');
        }
      } catch (err) {
        alert('Failed to connect to server');
      }
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
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="form-field">
              <label>Password</label>
              <input 
                type="password" 
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter temporary password"
              />
            </div>
          </div>

          <button className="btn-save" onClick={handleAddUser}>Add User</button>
        </div>
      )}

      {loading ? (
        <div className="loading" style={{ padding: '40px', textAlign: 'center' }}>Loading users...</div>
      ) : error ? (
        <div className="error" style={{ padding: '20px', color: 'red', textAlign: 'center' }}>{error}</div>
      ) : (
        <>
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
                  <tr key={user._id}>
                    <td className="user-name">{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-badge role-${user.role.toLowerCase()}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge status-${user.isActive ? 'active' : 'inactive'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="action-cell">
                      <button 
                        className="btn-toggle"
                        onClick={() => toggleUserStatus(user)}
                      >
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button 
                        className="btn-delete"
                        onClick={() => deleteUser(user._id)}
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
        </>
      )}
    </div>
  );
}
