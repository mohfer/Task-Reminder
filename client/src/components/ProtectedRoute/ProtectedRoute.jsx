import { useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useToaster, Message } from 'rsuite';

const ProtectedRoute = ({ children }) => {
    const navigate = useNavigate();
    const toaster = useToaster();
    const apiUrl = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const token = localStorage.getItem('token');
        axios.get(`${apiUrl}/auth/check/token`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .catch(error => {
                if (error.response.status === 401) {
                    localStorage.clear();
                    sessionStorage.clear();

                    toaster.push(
                        <Message showIcon type="error" closable >
                            Session expired, please login again
                        </Message>,
                        { placement: 'topEnd', duration: 3000 }
                    );
                    navigate('/auth/login');
                }
                console.error(error);
            });
    }, [apiUrl, navigate, toaster]);

    return children;
};

export default ProtectedRoute;


