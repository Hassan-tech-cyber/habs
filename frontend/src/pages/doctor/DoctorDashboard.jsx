import React, { useState } from 'react';
import WorkingHours from './WorkingHours';
import DoctorAppointments from './DoctorAppointments';
import DashboardLayout from '../../components/DashboardLayout';

const DoctorDashboard = () => {
    const [activeTab, setActiveTab] = useState('appointments');

    const menuItems = [
        { id: 'appointments', label: 'My Schedule' },
        { id: 'hours', label: 'Configure Hours' }
    ];

    return (
        <DashboardLayout 
            title="Doctor Portal" 
            menuItems={menuItems} 
            activeTab={activeTab} 
            setActiveTab={setActiveTab}
        >
            {activeTab === 'appointments' ? <DoctorAppointments /> : <WorkingHours />}
        </DashboardLayout>
    );
};

export default DoctorDashboard;
