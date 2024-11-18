import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToaster, Message } from 'rsuite';
import axios from 'axios';

const Dashboard = () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const navigate = useNavigate();
    const toaster = useToaster();

    const handleClick = () => {
        toaster.push(
            <Message showIcon type="success" closable >
                User logged out successfully
            </Message>,
            { placement: 'topEnd', duration: 3000 }
        )

        localStorage.removeItem('token');
        localStorage.removeItem('email');
        localStorage.removeItem('isEmailVerified');

        navigate('/auth/login');
    }

    useEffect(() => {

        const storedToken = localStorage.getItem('token');
        const emailVerified = localStorage.getItem('isEmailVerified');

        if (!storedToken) {
            navigate('/auth/login');
        } else if (emailVerified === 'false') {
            navigate('/auth/verify-email');
        }

    }, [navigate]);

    useEffect(() => {
        document.title = 'Dashboard | Task Reminder';
    }, []);

    return (
        <>
            <div>Hello world</div>
            <button onClick={handleClick}>Logout</button>
        </>
    )
}

export default Dashboard