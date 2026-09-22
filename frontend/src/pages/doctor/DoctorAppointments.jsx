import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { toast } from '../../utils/toast';
import { apiFetch } from '../../utils/api';

const DoctorAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiFetch('/appointments')
            .then(data => setAppointments(data.appointments))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const updateStatus = async (apt, newStatus) => {
        const res = await Swal.fire({
            title: 'Are you sure?',
            text: `Do you want to update status to ${newStatus}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'Cancel'
        });
        if (res.isConfirmed) {
            try {
                await apiFetch(`/doctor/appointments/${apt.id}/status`, {
                    method: 'PUT',
                    body: JSON.stringify({ status: newStatus })
                });
                setAppointments(prev => prev.map(a => a.id === apt.id ? { ...a, status: newStatus } : a));
                toast.success('Status updated successfully');
            } catch (err) {
                toast.error(err.message);
            }
        }
    };

    if (loading) return <p>Loading schedule...</p>;

    return (
        <div className="card">
            <h3>Upcoming Appointments</h3>
            {appointments.length === 0 ? <p>You have no appointments booked.</p> : (
                <div className="table-responsive">
                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                                <th style={{ padding: '10px' }}>Date</th>
                                <th style={{ padding: '10px' }}>Time</th>
                                <th style={{ padding: '10px' }}>Patient</th>
                                <th style={{ padding: '10px' }}>Reason</th>
                                <th style={{ padding: '10px' }}>Status</th>
                                <th style={{ padding: '10px' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appointments.map(a => (
                                <tr key={a.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '10px' }}>{a.date}</td>
                                    <td style={{ padding: '10px' }}>{a.slotTime}</td>
                                    <td style={{ padding: '10px' }}>{a.patientName}</td>
                                    <td style={{ padding: '10px', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.reason || 'N/A'}</td>
                                    <td style={{ padding: '10px' }}>
                                        <span style={{ 
                                            padding: '4px 8px', 
                                            borderRadius: '12px', 
                                            fontSize: '0.8rem',
                                            backgroundColor: a.status === 'confirmed' ? 'var(--accent-color)' : '#ffa000',
                                            color: '#fff'
                                        }}>
                                            {a.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '10px' }}>
                                        <button 
                                            onClick={() => {
                                                Swal.fire({
                                                    title: `Patient: ${a.patientName}`,
                                                    html: `
                                                        <div style="text-align: left;">
                                                            <p><strong>Phone:</strong> ${a.patientPhone}</p>
                                                            <hr style="margin: 10px 0; border: 1px solid #eee;" />
                                                            <h4 style="margin-bottom: 5px;">Appointment Details</h4>
                                                            <p><strong>Reason for Visit:</strong> ${a.reason || 'Not specified'}</p>
                                                            <hr style="margin: 10px 0; border: 1px solid #eee;" />
                                                            <h4 style="margin-bottom: 5px;">Medical Background</h4>
                                                            <p><strong>Allergies:</strong> ${a.allergies}</p>
                                                            <p><strong>Conditions:</strong> ${a.chronicConditions}</p>
                                                            <p><strong>Medications:</strong> ${a.currentMedications}</p>
                                                            <hr style="margin: 10px 0; border: 1px solid #eee;" />
                                                            <h4 style="margin-bottom: 5px;">Emergency Contact</h4>
                                                            <p><strong>Name:</strong> ${a.emergencyContactName}</p>
                                                            <p><strong>Relationship:</strong> ${a.emergencyContactRelation}</p>
                                                            <p><strong>Phone:</strong> ${a.emergencyContactPhone}</p>
                                                        </div>
                                                    `
                                                });
                                            }}
                                            style={{ backgroundColor: '#09a5db', padding: '4px 8px', fontSize: '0.8rem', marginRight: '5px' }}
                                        >
                                            Info
                                        </button>
                                        {a.status === 'pending' && (
                                            <>
                                                <button 
                                                    onClick={() => updateStatus(a, 'confirmed')}
                                                    style={{ backgroundColor: 'var(--accent-color)', padding: '4px 8px', fontSize: '0.8rem', marginRight: '5px' }}
                                                >
                                                    Confirm
                                                </button>
                                                <button 
                                                    onClick={() => updateStatus(a, 'cancelled')}
                                                    style={{ backgroundColor: '#e74c3c', padding: '4px 8px', fontSize: '0.8rem' }}
                                                >
                                                    Cancel
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default DoctorAppointments;
