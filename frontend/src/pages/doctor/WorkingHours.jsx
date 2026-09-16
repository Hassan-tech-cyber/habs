import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../utils/api';

const defaultDay = { start: '09:00', end: '17:00', active: true };
const initialHours = {
    mon: { ...defaultDay },
    tue: { ...defaultDay },
    wed: { ...defaultDay },
    thu: { ...defaultDay },
    fri: { ...defaultDay },
    sat: { start: '10:00', end: '14:00', active: false },
    sun: { start: '10:00', end: '14:00', active: false }
};

const WorkingHours = () => {
    const [hours, setHours] = useState(initialHours);
    const [slotDuration, setSlotDuration] = useState(30);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        // Fetch current user details to pre-fill
        apiFetch('/auth/me').then(data => {
            if (data.user.workingHours && Object.keys(data.user.workingHours).length > 0) {
                setHours(data.user.workingHours);
                setIsEditing(false); 
            } else {
                setIsEditing(true); 
            }
            if (data.user.slotDurationMinutes) setSlotDuration(data.user.slotDurationMinutes);
        }).catch(err => console.error(err));
    }, []);

    const handleChange = (day, field, value) => {
        setHours(prev => ({
            ...prev,
            [day]: { ...prev[day], [field]: value }
        }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        try {
            await apiFetch('/doctors/working-hours', {
                method: 'PUT',
                body: JSON.stringify({ workingHours: hours, slotDurationMinutes: Number(slotDuration) })
            });
            setMessage('Working hours saved successfully.');
            setIsEditing(false); 
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

    return (
        <div className="card">
            <div className="stack-mobile" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 10px 0' }}>Configure Weekly Schedule</h3>
                {!isEditing && (
                    <button type="button" onClick={() => setIsEditing(true)} style={{ padding: '8px 16px', fontSize: '14px' }}>
                        Edit Schedule
                    </button>
                )}
            </div>

            {message && <div style={{ color: 'var(--accent-color)', marginBottom: '15px' }}>{message}</div>}
            {error && <div style={{ color: 'var(--error-color)', marginBottom: '15px' }}>{error}</div>}
            
            <form onSubmit={handleSave}>
                <div style={{ marginBottom: '20px' }}>
                    <label><strong>Slot Duration (Minutes)</strong></label>
                    {isEditing ? (
                        <select value={slotDuration} onChange={e => setSlotDuration(e.target.value)} style={{ width: '200px', display: 'block', marginTop: '10px' }}>
                            <option value={15}>15 mins</option>
                            <option value={20}>20 mins</option>
                            <option value={30}>30 mins</option>
                            <option value={45}>45 mins</option>
                            <option value={60}>60 mins</option>
                        </select>
                    ) : (
                        <div style={{ marginTop: '10px' }}>{slotDuration} mins</div>
                    )}
                </div>

                <div className="table-responsive">
                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', marginBottom: '20px' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                                <th style={{ padding: '10px' }}>Day</th>
                                <th style={{ padding: '10px' }}>Working?</th>
                                <th style={{ padding: '10px' }}>Start Time</th>
                                <th style={{ padding: '10px' }}>End Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {days.map(day => (
                                <tr key={day} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '10px', textTransform: 'capitalize' }}><strong>{day}</strong></td>
                                    <td style={{ padding: '10px' }}>
                                        {isEditing ? (
                                            <input 
                                                type="checkbox" 
                                                checked={hours[day].active} 
                                                onChange={e => handleChange(day, 'active', e.target.checked)}
                                                style={{ width: 'auto', marginBottom: 0 }}
                                            />
                                        ) : (
                                            <span style={{ color: hours[day].active ? 'var(--accent-color)' : 'var(--text-dark)', fontWeight: 'bold' }}>
                                                {hours[day].active ? 'Yes' : 'Off'}
                                            </span>
                                        )}
                                    </td>
                                    <td style={{ padding: '10px' }}>
                                        {isEditing ? (
                                            <input 
                                                type="time" 
                                                value={hours[day].start} 
                                                onChange={e => handleChange(day, 'start', e.target.value)}
                                                disabled={!hours[day].active}
                                                style={{ marginBottom: 0 }}
                                            />
                                        ) : (
                                            <span>{hours[day].active ? hours[day].start : '-'}</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '10px' }}>
                                        {isEditing ? (
                                            <input 
                                                type="time" 
                                                value={hours[day].end} 
                                                onChange={e => handleChange(day, 'end', e.target.value)}
                                                disabled={!hours[day].active}
                                                style={{ marginBottom: 0 }}
                                            />
                                        ) : (
                                            <span>{hours[day].active ? hours[day].end : '-'}</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                {isEditing && (
                    <div className="stack-mobile" style={{ display: 'flex', gap: '15px' }}>
                        <button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Schedule'}</button>
                        <button type="button" onClick={() => setIsEditing(false)} style={{ backgroundColor: '#6c757d' }}>Cancel</button>
                    </div>
                )}
            </form>
        </div>
    );
};

export default WorkingHours;
