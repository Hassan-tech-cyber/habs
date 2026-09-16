import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import WorkingHours from './WorkingHours';
import DoctorAppointments from './DoctorAppointments';

const DoctorDashboard = () => {
    const { logout, user } = useAuth();
    const [activeTab, setActiveTab] = useState('appointments');

    return (
        <div className="container">
            <div className="stack-mobile" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 style={{ margin: '0 0 10px 0' }}>Doctor Portal</h1>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <span>Dr. {user?.name}</span>
                    <button onClick={logout} style={{ backgroundColor: 'var(--error-color)' }}>Logout</button>
                </div>
            </div>
            
            <div className="stack-mobile" style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                <button 
                    onClick={() => setActiveTab('appointments')} 
                    style={{ backgroundColor: activeTab === 'appointments' ? 'var(--primary-hover)' : 'var(--primary-color)' }}
                >
                    My Schedule
                </button>
                <button 
                    onClick={() => setActiveTab('hours')}
                    style={{ backgroundColor: activeTab === 'hours' ? 'var(--primary-hover)' : 'var(--primary-color)' }}
                >
                    Configure Hours
                </button>
            </div>

            {activeTab === 'appointments' ? <DoctorAppointments /> : <WorkingHours />}
            
        </div>
    );
};

export default DoctorDashboard;
