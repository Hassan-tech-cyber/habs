import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiFetch } from '../utils/api';

const Register = () => {
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({ 
        name: '', 
        email: '', 
        phone: '', 
        password: '',
        dob: '',
        gender: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        emergencyContactRelation: '',
        allergies: '',
        chronicConditions: '',
        currentMedications: ''
    });
    const [step, setStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleNext = (e) => {
        e.preventDefault();
        setStep(step + 1);
    };

    const handleBack = () => {
        setStep(step - 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            await apiFetch('/auth/register', {
                method: 'POST',
                body: JSON.stringify(formData)
            });

            setSuccess('Registration successful! You can now log in.');
            setFormData({ name: '', email: '', phone: '', password: '' });
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
            <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Patient Registration</h2>
                
                {error && <div style={{ color: 'var(--error-color)', marginBottom: '15px', padding: '10px', backgroundColor: '#ffebee', borderRadius: '4px' }}>{error}</div>}
                {success && <div style={{ color: 'var(--accent-color)', marginBottom: '15px', padding: '10px', backgroundColor: '#e0f2f1', borderRadius: '4px' }}>{success}</div>}

                <form onSubmit={step < 3 ? handleNext : handleSubmit}>
                    {step === 1 && (
                        <>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Full Name</label>
                                <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                            </div>
                            
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Email Address</label>
                                <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                            </div>
                            
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Phone Number</label>
                                <input type="text" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Date of Birth</label>
                                <input type="date" required value={formData.dob} onChange={(e) => setFormData({...formData, dob: e.target.value})} />
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Gender</label>
                                <select required value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})}>
                                    <option value="" disabled>-- Select Gender --</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input 
                                        type={showPassword ? 'text' : 'password'} 
                                        required 
                                        value={formData.password} 
                                        onChange={(e) => setFormData({...formData, password: e.target.value})} 
                                        style={{ width: '100%', paddingRight: '40px' }}
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
                            
                            <button type="submit" style={{ width: '100%' }}>
                                Next
                            </button>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <h3 style={{ marginBottom: '15px' }}>Emergency Contact</h3>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Contact Name</label>
                                <input type="text" required value={formData.emergencyContactName} onChange={(e) => setFormData({...formData, emergencyContactName: e.target.value})} />
                            </div>
                            
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Contact Phone Number</label>
                                <input type="text" required value={formData.emergencyContactPhone} onChange={(e) => setFormData({...formData, emergencyContactPhone: e.target.value})} />
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Relationship</label>
                                <input type="text" required placeholder="e.g. Mother, Spouse" value={formData.emergencyContactRelation} onChange={(e) => setFormData({...formData, emergencyContactRelation: e.target.value})} />
                            </div>

                            <div className="stack-mobile" style={{ display: 'flex', gap: '10px' }}>
                                <button type="button" onClick={handleBack} style={{ flex: 1, backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-dark)' }}>
                                    Back
                                </button>
                                <button type="submit" style={{ flex: 1 }}>
                                    Next
                                </button>
                            </div>
                        </>
                    )}

                    {step === 3 && (
                        <>
                            <h3 style={{ marginBottom: '15px' }}>Medical Background</h3>
                            
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Known Allergies</label>
                                <textarea 
                                    placeholder="e.g. Penicillin, Peanuts (or None)"
                                    value={formData.allergies} 
                                    onChange={(e) => setFormData({...formData, allergies: e.target.value})}
                                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)', minHeight: '80px', resize: 'vertical' }}
                                />
                            </div>
                            
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Chronic Conditions</label>
                                <textarea 
                                    placeholder="e.g. Hypertension, Diabetes (or None)"
                                    value={formData.chronicConditions} 
                                    onChange={(e) => setFormData({...formData, chronicConditions: e.target.value})}
                                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)', minHeight: '80px', resize: 'vertical' }}
                                />
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Current Medications</label>
                                <textarea 
                                    placeholder="List any medications you currently take..."
                                    value={formData.currentMedications} 
                                    onChange={(e) => setFormData({...formData, currentMedications: e.target.value})}
                                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)', minHeight: '80px', resize: 'vertical' }}
                                />
                            </div>

                            <div className="stack-mobile" style={{ display: 'flex', gap: '10px' }}>
                                <button type="button" onClick={handleBack} style={{ flex: 1, backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-dark)' }}>
                                    Back
                                </button>
                                <button type="submit" style={{ flex: 1 }} disabled={loading}>
                                    {loading ? 'Registering...' : 'Complete Registration'}
                                </button>
                            </div>
                        </>
                    )}
                </form>

                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <p>Already have an account? <Link to="/login" style={{ color: 'var(--primary-color)' }}>Sign in here</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Register;
