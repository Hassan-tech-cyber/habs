import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const DashboardLayout = ({ title, menuItems, activeTab, setActiveTab, children }) => {
    const { logout, user } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Dynamic styles based on sidebar state
    const sidebarWidth = sidebarOpen ? '250px' : '0px';

    return (
        <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', margin: 0, padding: 0, overflowX: 'hidden' }}>
            
            {/* Glassmorphism Sidebar */}
            <div style={{ 
                width: sidebarWidth, 
                height: '100vh',
                position: 'fixed',
                left: 0,
                top: 0,
                overflow: 'hidden', 
                transition: 'width 0.3s ease',
                backgroundColor: 'rgba(0, 49, 82, 0.6)', // Semi-transparent primary color
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                color: 'white',
                boxShadow: sidebarOpen ? '2px 0 10px rgba(0,0,0,0.3)' : 'none',
                zIndex: 1000,
                borderRight: sidebarOpen ? '1px solid rgba(255,255,255,0.1)' : 'none'
            }}>
               <div style={{ padding: '20px', width: '250px', boxSizing: 'border-box' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', marginTop: '10px' }}>
                        <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '600' }}>Menu</h2>
                        <button 
                            onClick={() => setSidebarOpen(false)} 
                            style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer', padding: '5px' }}
                        >
                            ✕
                        </button>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {menuItems.map(item => (
                            <button 
                                key={item.id}
                                onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                                style={{ 
                                    padding: '12px 15px', 
                                    cursor: 'pointer', 
                                    backgroundColor: activeTab === item.id ? 'rgba(255,255,255,0.2)' : 'transparent',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    borderRadius: '8px',
                                    color: 'white',
                                    textAlign: 'left',
                                    fontSize: '1rem',
                                    transition: 'background-color 0.2s',
                                    width: '100%'
                                }}
                                onMouseEnter={(e) => { if (activeTab !== item.id) e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'; }}
                                onMouseLeave={(e) => { if (activeTab !== item.id) e.target.style.backgroundColor = 'transparent'; }}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
               </div>
            </div>

            {/* Main Content Area */}
            <div style={{ 
                flex: 1, 
                marginLeft: sidebarWidth,
                transition: 'margin-left 0.3s ease', 
                width: `calc(100vw - ${sidebarWidth})`,
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Top Navbar */}
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '15px 30px', 
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(5px)',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                    position: 'sticky',
                    top: 0,
                    zIndex: 900
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <button 
                            onClick={() => setSidebarOpen(true)} 
                            style={{ 
                                background: 'none', 
                                border: 'none', 
                                cursor: 'pointer', 
                                padding: '5px',
                                display: 'flex',
                                alignItems: 'center',
                                color: 'var(--primary-color)'
                            }}
                        >
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
                        </button>
                        <h1 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--primary-color)' }}>{title}</h1>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        <span style={{ fontWeight: '500', color: 'var(--text-dark)' }}>{user?.name}</span>
                        <button 
                            onClick={logout} 
                            style={{ 
                                backgroundColor: 'var(--error-color)', 
                                padding: '8px 16px', 
                                fontSize: '0.9rem',
                                borderRadius: '20px'
                            }}
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {/* Page Content */}
                <div style={{ padding: '30px', flex: 1, overflowY: 'auto' }}>
                    <div className="container" style={{ margin: '0 auto', maxWidth: '1200px', width: '100%' }}>
                        {children}
                    </div>
                </div>
            </div>
            
            {/* Overlay for mobile when sidebar is open */}
            {sidebarOpen && (
                <div 
                    onClick={() => setSidebarOpen(false)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: 'rgba(0,0,0,0.2)',
                        zIndex: 999
                    }}
                />
            )}
        </div>
    );
};

export default DashboardLayout;
