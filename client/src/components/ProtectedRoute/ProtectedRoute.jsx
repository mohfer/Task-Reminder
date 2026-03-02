import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    const emailVerified = localStorage.getItem('isEmailVerified');

    if (!token) {
        return <Navigate to="/auth/login" replace />;
    }

    if (emailVerified === 'false') {
        return <Navigate to="/auth/verify-email" replace />;
    }

    return children;
};

export default ProtectedRoute;


