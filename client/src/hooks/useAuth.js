import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { authApi } from '@/api/authApi';

export const useAuth = () => {
    const navigate = useNavigate();

    const logout = async () => {
        try {
            const response = await authApi.logout();
            toast.success(response.data.message);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to logout.');
        } finally {
            localStorage.clear();
            sessionStorage.clear();
            navigate('/auth/login');
        }
    };

    const getToken = () => localStorage.getItem('token');
    const getName = () => localStorage.getItem('name');
    const isAuthenticated = () => !!localStorage.getItem('token');

    return { logout, getToken, getName, isAuthenticated };
};
