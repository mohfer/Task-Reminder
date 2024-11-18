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

        const storedToken = localStorage.getItem('token');
        const storedEmail = localStorage.getItem('email');
        const isEmailVerified = localStorage.getItem('isEmailVerified');

        if (!storedToken || !storedEmail || isEmailVerified === 'true') {
            navigate('/dashboard');
        }

        verifyEmail();
    }, [id, hash, navigate, apiUrl]);

    useEffect(() => {
        document.title = 'Email Verified | Task Reminder';
    }, []);

    return (
        <>
            <div className="flex">
                <div className="w-full flex h-screen">
                    <div className="w-1/2">
                        <div className='h-screen flex justify-center items-center'>
                            <div className="w-2/3 mx-auto">
                                <h1 className="text-[2.25rem] font-bold">
                                    {loading ? 'Verifying...' : (message || 'Email Verified')}
                                </h1>
                                <p className="text-base text-gray-500">
                                    {loading ? '' : (description || 'Your email address has been successfully verified. You will be redirected shortly.')}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="w-1/2 bg-black p-8 flex items-center justify-center">
                        <div className="relative w-64 h-64">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-32 h-32 bg-blue-600 rounded-full opacity-80 animate-pulse"></div>
                                <div className="absolute w-48 h-48 border-4 border-orange-400 rounded-full transform rotate-45"></div>
                                <div className="absolute w-8 h-24 bg-white rounded-full transform rotate-45 -translate-x-24"></div>
                                <div className="absolute w-8 h-24 bg-white rounded-full transform rotate-45 translate-x-24"></div>
                                <div className="absolute w-8 h-24 bg-white rounded-full transform -rotate-45 -translate-y-24"></div>
                                <div className="absolute w-8 h-24 bg-white rounded-full transform -rotate-45 translate-y-24"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default VerifiedEmail;