import React, { useState } from 'react';
import Departments from './Departments';
import Doctors from './Doctors';
import DashboardLayout from '../../components/DashboardLayout';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('departments');

    const menuItems = [
        { id: 'departments', label: 'Manage Departments' },
        { id: 'doctors', label: 'Manage Doctors' }
    ];

    return (
        <DashboardLayout 
            title="Admin Portal" 
            menuItems={menuItems} 
            activeTab={activeTab} 
            setActiveTab={setActiveTab}
        >
            {activeTab === 'departments' ? <Departments /> : <Doctors />}
        </DashboardLayout>
    );
};

export default AdminDashboard;
