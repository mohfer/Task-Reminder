import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader, useToaster, Message } from 'rsuite';
import axios from 'axios';

const PasswordEmailSent = () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const navigate = useNavigate();
    const [message, setMessage] = useState({});
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');

    const toaster = useToaster();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            const response = await axios.post(`${apiUrl}/password/email`, { email });

            toaster.push(
                <Message showIcon type="success" closable >
                    {response?.data?.message}
                </Message>,
                { placement: 'topEnd', duration: 3000 }
            )

            setLoading(false);
        } catch (error) {
            toaster.push(
                <Message showIcon type="error" closable >
                    {error.response?.data?.message}
                </Message>,
                { placement: 'topEnd', duration: 3000 }
            )
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const email = localStorage.getItem('email');

        setEmail(email);
    }, []);

    useEffect(() => {
        document.title = 'Forgot Password | Task Reminder';
    }, []);

    return (
        <div className="flex">
            <div className="w-full flex h-screen">
                <div className="w-1/2">
                    <div className='h-screen flex justify-center items-center'>
                        <div className="w-2/3 mx-auto">
                            <h1 className="text-[2.25rem] font-bold">Email Sent</h1>
                            <p className="text-base text-gray-500">We’ve sent a password reset email to <span className='font-bold'>{email}.</span> Please check your inbox and follow the instructions to reset your password. If you didn’t receive the email, check your spam folder or try resending the request.</p>

                            <form onSubmit={handleSubmit}>
                                <div className="space-y-2 mt-12">
                                    <button
                                        type="submit"
                                        className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-md shadow-sm hover:bg-blue-700 transition duration-200">
                                        {loading ? <Loader content='Resending...' /> : 'Resend Email'}
                                    </button>
                                </div>
                            </form>
                            <p className="mt-6 text-sm text-center">
                                <Link to="/auth/login" className="text-gray-500 hover:text-gray-500">
                                    <ArrowLeft className="w-3 inline-block align-middle mr-2" />
                                    Back to login
                                </Link>
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
    );
};

export default PasswordEmailSent;
