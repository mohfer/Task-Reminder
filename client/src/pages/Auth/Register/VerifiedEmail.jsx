import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const VerifiedEmail = () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const navigate = useNavigate();
    const { id, hash } = useParams();
    const [searchParams] = useSearchParams();
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [description, setDescription] = useState('');

    const verifyEmail = async () => {
        try {
            setLoading(true);

            const token = localStorage.getItem('token');

            if (!token) {
                throw new Error('Token tidak ditemukan. Silakan login terlebih dahulu.');
            }

            const expires = searchParams.get('expires');
            const signature = searchParams.get('signature');

            const url = `${apiUrl}/email/verify/${id}/${hash}?expires=${expires}&signature=${signature}`;

            await axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            localStorage.setItem('isEmailVerified', true);

            setTimeout(() => {
                navigate('/dashboard');
            }, 3000);
        } catch (error) {
            console.error(error);

            setMessage(error.response.data.message);
            setDescription('Email verification failed. Please try again.');

            localStorage.setItem('isEmailVerified', false);

            setTimeout(() => {
                navigate('/dashboard');
            }, 3000);

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        localStorage.removeItem('isPasswordReset')

        const storedToken = localStorage.getItem('token');
        const storedEmail = localStorage.getItem('email');
        const isEmailVerified = localStorage.getItem('isEmailVerified');

        if (!storedToken || !storedEmail || isEmailVerified === 'true') {
            navigate('/dashboard');
        }

        verifyEmail();
    }, [id, hash, navigate, apiUrl]);

    useEffect(() => {
        document.title = 'Email Verified - Task Reminder';
    }, []);

    return (
        <>
            <div className='min-h-screen flex flex-col justify-center items-center p-4'>
                <img src="../../../../public/logo.png" className='w-32 mb-8 mt-4' alt="logo" />
                <div className="xl:w-1/3 border p-4 rounded-lg shadow-lg">
                    <h1 className="text-[2.25rem] font-bold">
                        {loading ? 'Verifying...' : (message || 'Email Verified')}
                    </h1>
                    <p className="text-base text-gray-500">
                        {loading ? '' : (description || 'Your email address has been successfully verified. You will be redirected shortly.')}
                    </p>
                </div>
            </div>
        </>
    );
};

export default VerifiedEmail;