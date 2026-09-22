import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../utils/api';
import Swal from 'sweetalert2';
import { toast } from '../../utils/toast';

const MyHistory = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchHistory = () => {
        setLoading(true);
        apiFetch('/appointments')
            .then(data => setAppointments(data.appointments))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const handleCancel = async (id) => {
        const result = await Swal.fire({
            title: 'Cancel Appointment?',
            text: 'Are you sure you want to cancel this appointment?',
            showCancelButton: true,
            confirmButtonText: 'Yes, cancel it'
        });
        if (!result.isConfirmed) return;

        try {
            await apiFetch(`/appointments/${id}/cancel`, { method: 'PUT' });
            fetchHistory();
            toast.success('Your appointment has been cancelled.');
        } catch (err) {
            toast.error(err.message);
        }
    };

    if (loading) return <p>Loading history...</p>;

    return (
        <div className="card">
            <h3>My Appointments</h3>
            {appointments.length === 0 ? <p>You have no appointments yet.</p> : (
                <div className="table-responsive">
                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                                <th style={{ padding: '10px' }}>Date</th>
                                <th style={{ padding: '10px' }}>Time</th>
                                <th style={{ padding: '10px' }}>Doctor ID</th>
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
                                    <td style={{ padding: '10px', fontFamily: 'monospace' }}>{a.doctorId.substring(0,8)}...</td>
                                    <td style={{ padding: '10px', maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.reason || 'N/A'}</td>
                                    <td style={{ padding: '10px' }}>
                                        <span style={{ 
                                            padding: '4px 8px', 
                                            borderRadius: '12px', 
                                            fontSize: '0.8rem',
                                            backgroundColor: a.status === 'confirmed' ? 'var(--accent-color)' : (a.status === 'cancelled' ? 'var(--error-color)' : '#ffa000'),
                                            color: '#fff'
                                        }}>
                                            {a.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '10px' }}>
                                        {a.status !== 'cancelled' && (
                                            <button 
                                                onClick={() => handleCancel(a.id)}
                                                style={{ backgroundColor: 'var(--error-color)', padding: '4px 8px', fontSize: '0.8rem' }}
                                            >
                                                Cancel
                                            </button>
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

export default MyHistory;
