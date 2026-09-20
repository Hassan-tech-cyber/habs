import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../utils/api';
import Swal from 'sweetalert2';
import { toast } from '../../utils/toast';

const Doctors = () => {
    const [doctors, setDoctors] = useState([]);
    const [departments, setDepartments] = useState([]);
    
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [departmentId, setDepartmentId] = useState('');
    const [specialty, setSpecialty] = useState('');
    const [consultationFee, setConsultationFee] = useState('');
    const [slotDurationMinutes, setSlotDurationMinutes] = useState(30);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [editingDoctorId, setEditingDoctorId] = useState(null);
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchData = async () => {
        try {
            const [docsRes, deptsRes] = await Promise.all([
                apiFetch('/doctors'),
                apiFetch('/departments')
            ]);
            setDoctors(docsRes.doctors);
            setDepartments(deptsRes.departments);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password) {
            if (password !== confirmPassword) {
                setError('Passwords do not match');
                toast.error('Passwords do not match');
                return;
            }
            const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+={}\[\]:;"'<>,.?/\\|`~]).*$/;
            if (!passwordRegex.test(password)) {
                const msg = 'Password must contain at least one letter, one number, and one special symbol.';
                setError(msg);
                toast.error(msg);
                return;
            }
        }

        setLoading(true);
        setError('');
        try {
            if (editingDoctorId) {
                // Update mode
                const updates = { name, email, phone, departmentId, specialty, consultationFee, slotDurationMinutes };
                if (password) {
                    updates.password = password; // Only send if changed, backend doesn't handle this right now but we'll leave it
                }
                await apiFetch(`/admin/users/doctor/${editingDoctorId}`, {
                    method: 'PUT',
                    body: JSON.stringify(updates)
                });
                setDoctors(prev => prev.map(d => d.uid === editingDoctorId ? { ...d, ...updates } : d));
                toast.success('Doctor updated successfully!');
            } else {
                
                await apiFetch('/admin/users/doctor', {
                    method: 'POST',
                    body: JSON.stringify({ name, email, phone, password, departmentId, specialty, consultationFee, slotDurationMinutes })
                });
                fetchData();
                toast.success('Doctor registered successfully and email sent!');
            }
            cancelEdit();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (doc) => {
        setEditingDoctorId(doc.uid);
        setName(doc.name);
        setEmail(doc.email);
        setPhone(doc.phone || '');
        setPassword(''); // Don't prefill password
        setDepartmentId(doc.departmentId || '');
        setSpecialty(doc.specialty || '');
        setConsultationFee(doc.consultationFee || '');
        setSlotDurationMinutes(doc.slotDurationMinutes || 30);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditingDoctorId(null);
        setName(''); setEmail(''); setPhone(''); setPassword(''); setConfirmPassword(''); setDepartmentId(''); setSpecialty(''); setConsultationFee(''); setSlotDurationMinutes(30);
    };

    const handleUpdateDoctor = async (uid, updates) => {
        try {
            await apiFetch(`/admin/users/doctor/${uid}`, {
                method: 'PUT',
                body: JSON.stringify(updates)
            });
            setDoctors(prev => prev.map(d => d.uid === uid ? { ...d, ...updates } : d));
            toast.success('Status updated successfully.');
        } catch (err) {
            toast.error(err.message);
        }
    };

    return (
        <div>
            <h2>Manage Doctors</h2>
            
            <div className="card" style={{ marginBottom: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0 }}>{editingDoctorId ? 'Edit Doctor Details' : 'Register New Doctor'}</h3>
                    {editingDoctorId && (
                        <button type="button" onClick={cancelEdit} style={{ padding: '5px 10px', fontSize: '0.9rem', backgroundColor: '#6c757d' }}>Cancel Edit</button>
                    )}
                </div>
                {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
                <form onSubmit={handleSubmit} className="grid-responsive">
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Full Name</label>
                        <input type="text" required value={name} onChange={e => setName(e.target.value)} />
                    </div>
                    
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Email Address</label>
                        <input type="email" required value={email} onChange={e => setEmail(e.target.value)} />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Phone Number</label>
                        <input type="text" required value={phone} onChange={e => setPhone(e.target.value)} />
                    </div>
                    
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Department</label>
                        <select required value={departmentId} onChange={e => setDepartmentId(e.target.value)}>
                            <option value="" disabled>-- Select Department --</option>
                            {departments.map(dept => <option key={dept.id} value={dept.id}>{dept.name}</option>)}
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Specialty</label>
                        <input type="text" placeholder="e.g., Cardiologist" required value={specialty} onChange={e => setSpecialty(e.target.value)} />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Consultation Fee (₦)</label>
                        <input type="number" min="0" required value={consultationFee} onChange={e => setConsultationFee(e.target.value)} />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Slot Duration (Minutes)</label>
                        <select required value={slotDurationMinutes} onChange={e => setSlotDurationMinutes(Number(e.target.value))}>
                            <option value={15}>15</option>
                            <option value={20}>20</option>
                            <option value={30}>30</option>
                            <option value={45}>45</option>
                            <option value={60}>60</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '5px' }}>{editingDoctorId ? 'New Password (Optional)' : 'Temporary Password'}</label>
                        <div style={{ position: 'relative' }}>
                            <input 
                                type={showPassword ? 'text' : 'password'} 
                                required={!editingDoctorId} 
                                value={password} 
                                onChange={e => setPassword(e.target.value)} 
                                style={{ width: '100%', paddingRight: '40px', marginBottom: 0 }}
                            />
                            <button 
                                type="button" 
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ 
                                    position: 'absolute', 
                                    right: '10px', 
                                    top: '50%', 
                                    transform: 'translateY(-50%)', 
                                    background: 'none', 
                                    border: 'none', 
                                    cursor: 'pointer',
                                    padding: '0',
                                    color: 'var(--text-dark)',
                                    opacity: 0.6
                                }}
                            >
                                {showPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Confirm Password {editingDoctorId && '(Optional)'}</label>
                        <div style={{ position: 'relative' }}>
                            <input 
                                type={showConfirmPassword ? 'text' : 'password'} 
                                required={!editingDoctorId && !!password} 
                                value={confirmPassword} 
                                onChange={e => setConfirmPassword(e.target.value)} 
                                style={{ width: '100%', paddingRight: '40px', marginBottom: 0 }}
                            />
                            <button 
                                type="button" 
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                style={{ 
                                    position: 'absolute', 
                                    right: '10px', 
                                    top: '50%', 
                                    transform: 'translateY(-50%)', 
                                    background: 'none', 
                                    border: 'none', 
                                    cursor: 'pointer',
                                    padding: '0',
                                    color: 'var(--text-dark)',
                                    opacity: 0.6
                                }}
                            >
                                {showConfirmPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                )}
                            </button>
                        </div>
                    </div>
                    
                    <div style={{ gridColumn: 'span 2', marginTop: '10px' }}>
                        <button type="submit" style={{ width: '100%' }} disabled={loading}>{loading ? 'Saving...' : (editingDoctorId ? 'Update Doctor' : 'Register Doctor')}</button>
                    </div>
                </form>
            </div>

            <div className="card">
                <h3>Doctor Directory</h3>
                {doctors.length === 0 ? <p>No doctors found.</p> : (
                    <div className="table-responsive">
                        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                                    <th style={{ padding: '10px' }}>Name</th>
                                    <th style={{ padding: '10px' }}>Email</th>
                                    <th style={{ padding: '10px' }}>Department</th>
                                    <th style={{ padding: '10px' }}>Status</th>
                                    <th style={{ padding: '10px' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {doctors.map(d => (
                                    <tr key={d.uid} style={{ borderBottom: '1px solid var(--border-color)', opacity: d.isActive ? 1 : 0.6 }}>
                                        <td style={{ padding: '10px' }}>{d.name}</td>
                                        <td style={{ padding: '10px' }}>{d.email}</td>
                                        <td style={{ padding: '10px' }}>
                                            <select 
                                                value={d.departmentId || ''} 
                                                onChange={(e) => handleUpdateDoctor(d.uid, { departmentId: e.target.value })}
                                                style={{ margin: 0, padding: '5px' }}
                                            >
                                                <option value="">-- Assign Dept --</option>
                                                {departments.map(dept => (
                                                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td style={{ padding: '10px' }}>{d.isActive ? 'Active' : 'Inactive'}</td>
                                        <td style={{ padding: '10px' }}>
                                            <div className="stack-mobile" style={{ display: 'flex', gap: '5px' }}>
                                                <button 
                                                    onClick={() => handleEditClick(d)}
                                                    style={{ backgroundColor: 'var(--primary-color)', padding: '5px 10px', fontSize: '0.8rem' }}
                                                >
                                                    Edit
                                                </button>
                                                <button 
                                                    onClick={() => handleUpdateDoctor(d.uid, { isActive: !d.isActive })}
                                                    style={{ backgroundColor: d.isActive ? 'var(--error-color)' : 'var(--accent-color)', padding: '5px 10px', fontSize: '0.8rem' }}
                                                >
                                                    {d.isActive ? 'Deactivate' : 'Activate'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Doctors;
