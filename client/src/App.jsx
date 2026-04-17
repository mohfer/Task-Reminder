import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';

const Login = lazy(() => import('./pages/Auth/Login/Login'));
const Register = lazy(() => import('./pages/Auth/Register/Register'));
const VerifyEmailSent = lazy(() => import('./pages/Auth/Register/VerifyEmailSent'));
const VerifiedEmail = lazy(() => import('./pages/Auth/Register/VerifiedEmail'));
const ForgotPassword = lazy(() => import('./pages/Auth/ResetPassword/ForgotPassword'));
const PasswordEmailSent = lazy(() => import('./pages/Auth/ResetPassword/PasswordEmailSent'));
const ResetPassword = lazy(() => import('./pages/Auth/ResetPassword/ResetPassword'));
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const CourseContent = lazy(() => import('./pages/CourseContent/CourseContent'));
const Schedule = lazy(() => import('./pages/Schedule/Schedule'));
const Assessment = lazy(() => import('./pages/Assessment/Assessment'));
const Settings = lazy(() => import('./pages/Settings/Settings'));

const App = () => {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
      <Routes>
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
          path="/schedule"
          element={<ProtectedRoute><Schedule /></ProtectedRoute>}
        />
        <Route
          path="/assessments"
          element={<ProtectedRoute><Assessment /></ProtectedRoute>}
        />
        <Route
          path="/settings"
          element={<ProtectedRoute><Settings /></ProtectedRoute>}
        />

        <Route
          path='*'
          element={<Navigate to="/dashboard" replace />}
        />
      </Routes>
    </Suspense>
  );
};

export default App;
