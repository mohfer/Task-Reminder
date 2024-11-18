import 'rsuite/dist/rsuite.min.css';
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import PasswordEmailSent from './pages/auth/PasswordEmailSent';
import VerifyEmailSent from './pages/auth/VerifyEmailSent';
import VerifiedEmail from './pages/auth/VerifiedEmail';
import Dashboard from './pages/dashboard/Dashboard';
import ResetPassword from './pages/auth/ResetPassword';

const App = () => {
  return (
    <Routes>
      <Route
        path='*'
        element={<Navigate to="/dashboard" replace />}
      />
      {/* Auth */}
      <Route
        path="/auth/login"
        element={<Login />}
      />
      <Route
        path="/auth/register"
        element={<Register />}
      />
      <Route
        path="/auth/forgot-password"
        element={<ForgotPassword />}
      />
      <Route
        path="/auth/forgot-password/email-sent"
        element={<PasswordEmailSent />}
      />
      <Route
        path="/auth/forgot-password/reset"
        element={<ResetPassword />}
      />
      <Route
        path="/auth/verify-email"
        element={<VerifyEmailSent />}
      />
      <Route
        path="/auth/email/verify/:id/:hash"
        element={<VerifiedEmail />}
      />
      <Route
        path="/dashboard"
        element={<Dashboard />}
      />
    </Routes>
  );
};

export default App;
