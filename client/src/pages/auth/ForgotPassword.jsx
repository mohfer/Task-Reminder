import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader, useToaster, Message } from 'rsuite';
import axios from 'axios';

const ForgotPassword = () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState({});
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const toaster = useToaster();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();

        formData.append('email', email);

        try {
            setLoading(true);
            await axios.post(`${apiUrl}/password/email`, formData,);

            navigate('/auth/forgot-password/email-sent');

            localStorage.setItem('email', email);

            setLoading(false);
        } catch (error) {
            const errors = error.response?.data?.errors || {};
            setMessage(errors);

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
        document.title = 'Forgot Password | Task Reminder';
    }, []);

    return (
        <div className="flex">
            <div className="w-full flex h-screen">
                <div className="w-1/2">
                    <div className='h-screen flex justify-center items-center'>
                        <div className="w-2/3 mx-auto">
                            <h1 className="text-[2.25rem] font-bold">Oh, You Lost Your Password?</h1>
                            <p className="text-base text-gray-500">No worries, we’ll send you reset instructions.</p>

                            <form onSubmit={handleSubmit}>
                                <div className="space-y-2 mt-12">
                                    <div>
                                        <label htmlFor="email" className="text-base font-medium text-gray-700">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className={`mt-1 block w-full px-3 py-2 border ${message.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm my-2`}
                                        />
                                        {message.email && (
                                            <p className="text-red-500 text-sm">{message.email}</p>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-md shadow-sm hover:bg-blue-700 transition duration-200">
                                        {loading ? (
                                            <Loader content="Loading..." />
                                        ) : (
                                            'Reset Password'
                                        )}
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

export default ForgotPassword;
