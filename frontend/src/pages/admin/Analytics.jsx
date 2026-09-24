import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../utils/api';

const Analytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiFetch('/admin/analytics')
            .then(res => {
                setData(res);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) return <p>Loading analytics...</p>;
    if (!data) return <p>Failed to load analytics.</p>;

    return (
        <div>
            <h3>Dashboard Overview</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <div className="card" style={{ textAlign: 'center' }}>
                    <h2>{data.metrics.totalPatients}</h2>
                    <p>Total Patients</p>
                </div>
                <div className="card" style={{ textAlign: 'center' }}>
                    <h2>{data.metrics.totalDoctors}</h2>
                    <p>Total Doctors</p>
                </div>
                <div className="card" style={{ textAlign: 'center' }}>
                    <h2>{data.metrics.totalAppointments}</h2>
                    <p>Total Appointments</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <div className="card">
                    <h4>Appointments by Status</h4>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {data.appointmentsByStatus.map(s => (
                            <li key={s._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
                                <span style={{ textTransform: 'capitalize' }}>{s._id.replace('_', ' ')}</span>
                                <strong>{s.count}</strong>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="card">
                    <h4>Department Loads</h4>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {data.appointmentsByDepartment.map(d => (
                            <li key={d._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
                                <span>{d._id}</span>
                                <strong>{d.count}</strong>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="card">
                <h4>Recent Appointments</h4>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ backgroundColor: 'var(--bg-light)' }}>
                                <th style={{ padding: '10px' }}>Date</th>
                                <th style={{ padding: '10px' }}>Time</th>
                                <th style={{ padding: '10px' }}>Patient</th>
                                <th style={{ padding: '10px' }}>Doctor</th>
                                <th style={{ padding: '10px' }}>Department</th>
                                <th style={{ padding: '10px' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.recentAppointments.map(appt => (
                                <tr key={appt.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '10px' }}>{appt.date}</td>
                                    <td style={{ padding: '10px' }}>{appt.slotTime}</td>
                                    <td style={{ padding: '10px' }}>{appt.patientId?.name || 'Unknown'}</td>
                                    <td style={{ padding: '10px' }}>{appt.doctorId?.name || 'Unknown'}</td>
                                    <td style={{ padding: '10px' }}>{appt.departmentId?.name || 'Unknown'}</td>
                                    <td style={{ padding: '10px', textTransform: 'capitalize' }}>{appt.status.replace('_', ' ')}</td>
                                </tr>
                            ))}
                            {data.recentAppointments.length === 0 && (
                                <tr><td colSpan="6" style={{ padding: '10px', textAlign: 'center' }}>No recent appointments</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
