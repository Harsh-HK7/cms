import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PatientRegistration from './pages/PatientRegistration';
import PatientList from './pages/PatientList';
import PatientHistory from './pages/PatientHistory';
import PendingVisits from './pages/PendingVisits';
import AddPrescription from './pages/AddPrescription';
import CompletedVisits from './pages/CompletedVisits';
import GenerateBill from './pages/GenerateBill';
import BillingSummary from './pages/BillingSummary';
import Layout from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, userRole, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// App Routes Component
const AppRoutes = () => {
  const { isAuthenticated, userRole } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
        } 
      />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        
        {/* Dashboard - Both roles */}
        <Route path="dashboard" element={<Dashboard />} />
        
        {/* Patient Routes - Both roles */}
        <Route path="patients" element={<PatientList />} />
        <Route path="patients/:patientId/history" element={<PatientHistory />} />
        
        {/* Receptionist Only Routes */}
        <Route 
          path="register-patient" 
          element={
            <ProtectedRoute allowedRoles={['receptionist']}>
              <PatientRegistration />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="completed-visits" 
          element={
            <ProtectedRoute allowedRoles={['receptionist']}>
              <CompletedVisits />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="generate-bill/:visitId" 
          element={
            <ProtectedRoute allowedRoles={['receptionist']}>
              <GenerateBill />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="billing-summary" 
          element={
            <ProtectedRoute allowedRoles={['receptionist']}>
              <BillingSummary />
            </ProtectedRoute>
          } 
        />
        
        {/* Doctor Only Routes */}
        <Route 
          path="pending-visits" 
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <PendingVisits />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="add-prescription/:visitId" 
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <AddPrescription />
            </ProtectedRoute>
          } 
        />
      </Route>

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

// Main App Component
const App = () => {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
};

export default App; 