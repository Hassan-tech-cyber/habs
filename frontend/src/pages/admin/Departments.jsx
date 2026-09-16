import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../utils/api';
import Swal from 'sweetalert2';

const Departments = () => {
    const [departments, setDepartments] = useState([]);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchDepartments = async () => {
        try {
            const data = await apiFetch('/departments');
            setDepartments(data.departments);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await apiFetch('/departments', {
                method: 'POST',
                body: JSON.stringify({ name, description })
            });
            setName('');
            setDescription('');
            setDepartments(prev => [...prev, response.department]);
        } catch (err) {
            Swal.fire('Error', err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'You are about to delete this department.',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!'
        });
        if (!result.isConfirmed) return;

        try {
            await apiFetch(`/departments/${id}`, { method: 'DELETE' });
            setDepartments(prev => prev.filter(d => d.id !== id));
            Swal.fire('Deleted!', 'The department has been deleted.');
        } catch (err) {
            Swal.fire('Error', err.message);
        }
    };

    return (
        <div>
            <h2>Manage Departments</h2>
            
            <div className="card" style={{ marginBottom: '30px' }}>
                <h3>Add New Department</h3>
                {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
                <form onSubmit={handleCreate} className="grid-responsive">
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Department Name</label>
                        <input type="text" required value={name} onChange={e => setName(e.target.value)} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Description (Optional)</label>
                        <input type="text" value={description} onChange={e => setDescription(e.target.value)} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <button type="submit" disabled={loading} style={{ width: '100%' }}>{loading ? 'Adding...' : 'Add Department'}</button>
                    </div>
                </form>
            </div>

            <div className="card">
                <h3>Existing Departments</h3>
                {departments.length === 0 ? <p>No departments found.</p> : (
                    <div className="table-responsive">
                        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                                    <th style={{ padding: '10px' }}>Name</th>
                                    <th style={{ padding: '10px' }}>Description</th>
                                    <th style={{ padding: '10px' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {departments.map(d => (
                                    <tr key={d.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <td style={{ padding: '10px' }}><strong>{d.name}</strong></td>
                                        <td style={{ padding: '10px' }}>{d.description}</td>
                                        <td style={{ padding: '10px' }}>
                                            <button onClick={() => handleDelete(d.id)} style={{ backgroundColor: 'var(--error-color)', padding: '5px 10px', fontSize: '0.8rem' }}>Delete</button>
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

export default Departments;
