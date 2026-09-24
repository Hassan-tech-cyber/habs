import React, { useState } from 'react';
import BookAppointment from './BookAppointment';
import MyHistory from './MyHistory';
import MyProfile from './MyProfile';
import DashboardLayout from '../../components/DashboardLayout';

const PatientDashboard = () => {
    const [activeTab, setActiveTab] = useState('book');

    const menuItems = [
        { id: 'book', label: 'Book Appointment' },
        { id: 'history', label: 'My History' },
        { id: 'profile', label: 'My Profile' }
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'book': return <BookAppointment />;
            case 'history': return <MyHistory />;
            case 'profile': return <MyProfile />;
            default: return <BookAppointment />;
        }
    };

    return (
        <DashboardLayout 
            title="Patient Portal" 
            menuItems={menuItems} 
            activeTab={activeTab} 
            setActiveTab={setActiveTab}
        >
            {renderContent()}
        </DashboardLayout>
    );
};

export default PatientDashboard;
