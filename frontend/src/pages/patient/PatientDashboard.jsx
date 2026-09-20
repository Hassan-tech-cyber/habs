import React, { useState } from 'react';
import BookAppointment from './BookAppointment';
import MyHistory from './MyHistory';
import DashboardLayout from '../../components/DashboardLayout';

const PatientDashboard = () => {
    const [activeTab, setActiveTab] = useState('book');

    const menuItems = [
        { id: 'book', label: 'Book Appointment' },
        { id: 'history', label: 'My History' }
    ];

    return (
        <DashboardLayout 
            title="Patient Portal" 
            menuItems={menuItems} 
            activeTab={activeTab} 
            setActiveTab={setActiveTab}
        >
            {activeTab === 'book' ? <BookAppointment /> : <MyHistory />}
        </DashboardLayout>
    );
};

export default PatientDashboard;
