import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import BookAppointment from './BookAppointment';
import MyHistory from './MyHistory';

const PatientDashboard = () => {
    const { logout, user } = useAuth();
    const [activeTab, setActiveTab] = useState('book');

    return (
        <div className="container">
            <div className="stack-mobile" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 style={{ margin: '0 0 10px 0' }}>Patient Portal</h1>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <span>Welcome, {user?.name}</span>
                    <button onClick={logout} style={{ backgroundColor: 'var(--error-color)' }}>Logout</button>
                </div>
            </div>
            
            <div className="stack-mobile" style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                <button 
                    onClick={() => setActiveTab('book')} 
                    style={{ backgroundColor: activeTab === 'book' ? 'var(--primary-hover)' : 'var(--primary-color)' }}
                >
                    Book Appointment
                </button>
                <button 
                    onClick={() => setActiveTab('history')}
                    style={{ backgroundColor: activeTab === 'history' ? 'var(--primary-hover)' : 'var(--primary-color)' }}
                >
                    My History
                </button>
            </div>

            {activeTab === 'book' ? <BookAppointment /> : <MyHistory />}
            
        </div>
    );
};

export default PatientDashboard;
