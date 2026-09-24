import React, { useState } from 'react';
import Departments from './Departments';
import Doctors from './Doctors';
import Analytics from './Analytics';
import DashboardLayout from '../../components/DashboardLayout';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('analytics');

    const menuItems = [
        { id: 'analytics', label: 'Dashboard Overview' },
        { id: 'departments', label: 'Manage Departments' },
        { id: 'doctors', label: 'Manage Doctors' }
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'analytics': return <Analytics />;
            case 'departments': return <Departments />;
            case 'doctors': return <Doctors />;
            default: return <Analytics />;
        }
    };

    return (
        <DashboardLayout 
            title="Admin Portal" 
            menuItems={menuItems} 
            activeTab={activeTab} 
            setActiveTab={setActiveTab}
        >
            {renderContent()}
        </DashboardLayout>
    );
};

export default AdminDashboard;
