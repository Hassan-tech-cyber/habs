import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/admin/AdminDashboard';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import PatientDashboard from './pages/patient/PatientDashboard';

const Unauthorized = () => <h2>Unauthorized Access</h2>;

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            <Route element={<ProtectedRoute allowedRoles={['patient']} />}>
                <Route path="/patient-dashboard" element={<PatientDashboard />} />
            </Route>
            
            <Route element={<ProtectedRoute allowedRoles={['doctor']} />}>
                <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
            </Route>
            
            <Route element={<ProtectedRoute allowedRoles={['admin', 'system_admin']} />}>
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
            </Route>
            
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
};

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <AppRoutes />
            </Router>
        </AuthProvider>
    );
};

export default App;
