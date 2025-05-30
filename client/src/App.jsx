import 'rsuite/dist/rsuite.min.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import Login from './pages/Auth/Login/Login';
import Register from './pages/Auth/Register/Register';
import VerifyEmailSent from './pages/Auth/Register/VerifyEmailSent';
import VerifiedEmail from './pages/Auth/Register/VerifiedEmail';
import ForgotPassword from './pages/Auth/ResetPassword/ForgotPassword';
import PasswordEmailSent from './pages/Auth/ResetPassword/PasswordEmailSent';
import ResetPassword from './pages/Auth/ResetPassword/ResetPassword';
import Dashboard from './pages/Dashboard/Dashboard';
import CourseContent from './pages/CourseContent/CourseContent';
import Assessment from './pages/Assessment/Assessment';
import Settings from './pages/Settings/Settings';

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

      {/* Protected */}
      <Route
        path="/dashboard"
        element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
      />
      <Route
        path="/course-contents"
        element={<ProtectedRoute><CourseContent /></ProtectedRoute>}
      />
      <Route
        path="/assessments"
        element={<ProtectedRoute><Assessment /></ProtectedRoute>}
      />
      <Route
        path="/settings"
        element={<ProtectedRoute><Settings /></ProtectedRoute>}
      />
    </Routes>
  );
};

export default App;
