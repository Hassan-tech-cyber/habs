import React, { useState } from 'react';
import { apiFetch } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from '../../utils/toast';

const MyProfile = () => {
    const { user, updateUser } = useAuth();
    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        dob: user?.dob ? user.dob.split('T')[0] : '',
        gender: user?.gender || '',
        emergencyContactName: user?.emergencyContactName || '',
        emergencyContactPhone: user?.emergencyContactPhone || '',
        emergencyContactRelation: user?.emergencyContactRelation || '',
        allergies: user?.allergies || '',
        chronicConditions: user?.chronicConditions || '',
        currentMedications: user?.currentMedications || '',
        bloodGroup: user?.bloodGroup || '',
        genotype: user?.genotype || ''
    });
    const [saving, setSaving] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await apiFetch('/auth/profile', {
                method: 'PUT',
                body: JSON.stringify(formData)
            });
            updateUser(res.user);
            toast.success('Profile updated successfully');
        } catch (err) {
            toast.error(err.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="card">
            <h3>My Profile</h3>
            <form onSubmit={handleSave}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                    <div>
                        <label>Full Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                    </div>
                    <div>
                        <label>Phone Number</label>
                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
                    </div>
                    <div>
                        <label>Date of Birth</label>
                        <input type="date" name="dob" value={formData.dob} onChange={handleChange} required />
                    </div>
                    <div>
                        <label>Gender</label>
                        <select name="gender" value={formData.gender} onChange={handleChange} required>
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                </div>

                <h4>Emergency Contact</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                    <div>
                        <label>Contact Name</label>
                        <input type="text" name="emergencyContactName" value={formData.emergencyContactName} onChange={handleChange} />
                    </div>
                    <div>
                        <label>Phone Number</label>
                        <input type="text" name="emergencyContactPhone" value={formData.emergencyContactPhone} onChange={handleChange} />
                    </div>
                    <div>
                        <label>Relationship</label>
                        <input type="text" name="emergencyContactRelation" value={formData.emergencyContactRelation} onChange={handleChange} />
                    </div>
                </div>

                <h4>Medical Records</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                    <div>
                        <label>Blood Group</label>
                        <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange}>
                            <option value="">Select Blood Group</option>
                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
                        </select>
                    </div>
                    <div>
                        <label>Genotype</label>
                        <select name="genotype" value={formData.genotype} onChange={handleChange}>
                            <option value="">Select Genotype</option>
                            <option value="AA">AA</option>
                            <option value="AS">AS</option>
                            <option value="SS">SS</option>
                            <option value="AC">AC</option>
                            <option value="SC">SC</option>
                        </select>
                    </div>
                    <div>
                        <label>Allergies</label>
                        <textarea name="allergies" value={formData.allergies} onChange={handleChange} rows="2" style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: '4px', resize: 'vertical' }} />
                    </div>
                    <div>
                        <label>Chronic Conditions</label>
                        <textarea name="chronicConditions" value={formData.chronicConditions} onChange={handleChange} rows="2" style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: '4px', resize: 'vertical' }} />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <label>Current Medications</label>
                        <textarea name="currentMedications" value={formData.currentMedications} onChange={handleChange} rows="2" style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: '4px', resize: 'vertical' }} />
                    </div>
                </div>
                <button type="submit" disabled={saving}>
                    {saving ? 'Saving...' : 'Update Profile'}
                </button>
            </form>
        </div>
    );
};

export default MyProfile;
