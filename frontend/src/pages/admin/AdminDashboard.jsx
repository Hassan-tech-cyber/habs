import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Departments from './Departments';
import Doctors from './Doctors';

const AdminDashboard = () => {
    const { logout, user } = useAuth();
    const [activeTab, setActiveTab] = useState('departments');

    return (
        <div className="container">
            <div className="stack-mobile" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 style={{ margin: '0 0 10px 0' }}>HABS Admin Portal</h1>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <span>Welcome, {user?.name}</span>
                    <button onClick={logout} style={{ backgroundColor: 'var(--error-color)' }}>Logout</button>
                </div>
            </div>
            
            <div className="stack-mobile" style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                <button 
                    onClick={() => setActiveTab('departments')} 
                    style={{ backgroundColor: activeTab === 'departments' ? 'var(--primary-hover)' : 'var(--primary-color)' }}
                >
                    Manage Departments
                </button>
                <button 
                    onClick={() => setActiveTab('doctors')}
                    style={{ backgroundColor: activeTab === 'doctors' ? 'var(--primary-hover)' : 'var(--primary-color)' }}
                >
                    Manage Doctors
                </button>
            </div>

            {activeTab === 'departments' ? <Departments /> : <Doctors />}
            
        </div>
    );
};

export default AdminDashboard;
