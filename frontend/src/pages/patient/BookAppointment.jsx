import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { usePaystackPayment } from 'react-paystack';
import Swal from 'sweetalert2';

const BookAppointment = () => {
    const [doctors, setDoctors] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [selectedDept, setSelectedDept] = useState('');
    const [selectedDoc, setSelectedDoc] = useState('');
    
    // YYYY-MM-DD format for date input
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [slots, setSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    
    const { user } = useAuth();

    
    const [pendingAppt, setPendingAppt] = useState(null);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        apiFetch('/departments').then(res => setDepartments(res.departments));
        fetchDoctors();
    }, []);

    const fetchDoctors = (deptId = '') => {
        const url = deptId ? `/doctors?departmentId=${deptId}` : '/doctors';
        apiFetch(url).then(res => setDoctors(res.doctors));
    };

    const handleDeptChange = (e) => {
        const val = e.target.value;
        setSelectedDept(val);
        setSelectedDoc('');
        fetchDoctors(val);
        setSlots([]);
    };

    const fetchSlots = async () => {
        if (!selectedDoc || !selectedDate) return;
        setLoadingSlots(true);
        try {
            const res = await apiFetch(`/doctors/${selectedDoc}/slots?date=${selectedDate}`);
            setSlots(res.slots);
        } catch (err) {
            console.error(err);
            setSlots([]);
        } finally {
            setLoadingSlots(false);
        }
    };

    useEffect(() => {
        fetchSlots();
    }, [selectedDoc, selectedDate]);

    const handleBook = async (time) => {
        const result = await Swal.fire({
            title: 'Confirm Booking',
            text: `Book appointment for ${selectedDate} at ${time}?`,
            showCancelButton: true,
            confirmButtonText: 'Yes, book it!'
        });
        if (!result.isConfirmed) return;

        try {
            const res = await apiFetch('/appointments', {
                method: 'POST',
                body: JSON.stringify({ doctorId: selectedDoc, date: selectedDate, slotTime: time })
            });
            setPendingAppt(res.appointment);
        } catch (err) {
            Swal.fire('Error', err.message);
        }
    };

    
    const paystackConfig = {
        reference: (new Date()).getTime().toString(),
        email: user?.email || 'patient@example.com',
        amount: 10000, 
        publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
    };

    const initializePayment = usePaystackPayment(paystackConfig);

    const onPaystackSuccess = async (reference) => {
        console.log('Paystack success response:', reference);
        setProcessing(true);
        try {
            await apiFetch(`/appointments/${pendingAppt.id}/pay`, {
                method: 'POST',
                body: JSON.stringify({ paymentMethod: 'paystack', reference: reference.reference })
            });
            Swal.fire('Payment Successful!', 'Your appointment is now confirmed.');
            setPendingAppt(null);
            fetchSlots();
        } catch (err) {
            Swal.fire('Warning', 'Payment verified, but failed to confirm appointment: ' + err.message);
        } finally {
            setProcessing(false);
        }
    };

    const onPaystackClose = () => {
        Swal.fire('Cancelled', 'Payment was cancelled.');
    };

    const handleCancelPayment = async () => {
        const result = await Swal.fire({
            title: 'Cancel Booking?',
            text: 'Are you sure you want to cancel this booking? The slot will be freed.',
            showCancelButton: true,
            confirmButtonText: 'Yes, cancel it'
        });
        if (!result.isConfirmed) return;

        setProcessing(true);
        try {
            await apiFetch(`/appointments/${pendingAppt.id}/cancel`, { method: 'PUT' });
            setPendingAppt(null);
            fetchSlots();
            Swal.fire('Cancelled', 'Your booking has been cancelled and the slot is freed.');
        } catch (err) {
            Swal.fire('Error', err.message);
        } finally {
            setProcessing(false);
        }
    };

    if (pendingAppt) {
        return (
            <div className="card" style={{ textAlign: 'center' }}>
                <h3 style={{ color: 'var(--accent-color)' }}>Slot Reserved!</h3>
                <p>Please complete payment to confirm your appointment on {pendingAppt.date} at {pendingAppt.slotTime}.</p>
                
                <p style={{ marginBottom: '20px' }}>Your booking fee is <strong>₦100</strong>.</p>
                
                <div className="stack-mobile" style={{ display: 'flex', gap: '10px', justifyContent: 'center', width: '100%', maxWidth: '300px', margin: '0 auto' }}>
                    <button 
                        onClick={() => initializePayment({ onSuccess: onPaystackSuccess, onClose: onPaystackClose })} 
                        disabled={processing} 
                        style={{ flex: 1, backgroundColor: '#09a5db' }}
                    >
                        {processing ? 'Processing...' : 'Pay ₦100 with Paystack'}
                    </button>
                    <button onClick={handleCancelPayment} disabled={processing} style={{ flex: 1, backgroundColor: 'var(--error-color)' }}>
                        Cancel Booking
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="card">
            <h3>Book an Appointment</h3>
            
            <div className="stack-mobile" style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                <div style={{ flex: 1 }}>
                    <label>Filter by Department</label>
                    <select value={selectedDept} onChange={handleDeptChange}>
                        <option value="">All Departments</option>
                        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                </div>
                
                <div style={{ flex: 1 }}>
                    <label>Select Doctor</label>
                    <select value={selectedDoc} onChange={e => setSelectedDoc(e.target.value)}>
                        <option value="" disabled>-- Choose a Doctor --</option>
                        {doctors.map(d => <option key={d.uid} value={d.uid}>Dr. {d.name}{d.specialty ? ` (${d.specialty})` : ''}</option>)}
                    </select>
                </div>

                <div style={{ flex: 1 }}>
                    <label>Select Date</label>
                    <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
                </div>
            </div>

            {selectedDoc && (
                <div style={{ marginTop: '20px' }}>
                    <h4>Available Slots for {selectedDate}</h4>
                    {loadingSlots ? <p>Loading...</p> : (
                        slots.length === 0 ? <p>No slots available on this date.</p> : (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                {slots.map(s => (
                                    <button 
                                        key={s} 
                                        onClick={() => handleBook(s)}
                                        style={{ backgroundColor: 'var(--bg-light)', color: 'var(--primary-color)', border: '1px solid var(--primary-color)' }}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        )
                    )}
                </div>
            )}
        </div>
    );
};

export default BookAppointment;
