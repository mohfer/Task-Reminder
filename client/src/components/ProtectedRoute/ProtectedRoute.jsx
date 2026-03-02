import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { authApi } from '@/api/authApi';

const ProtectedRoute = ({ children }) => {
    const navigate = useNavigate();

    useEffect(() => {
        authApi.checkToken().catch((error) => {
            if (error.response?.status === 401) {
                localStorage.clear();
                sessionStorage.clear();
                toast.error('Session expired, please login again');
                navigate('/auth/login');
            }
        });
    }, [navigate]);

    return children;
};

export default ProtectedRoute;


