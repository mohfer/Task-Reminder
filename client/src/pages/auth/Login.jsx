import { useEffect, useState } from 'react';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader, useToaster, Message } from 'rsuite'
import axios from 'axios';

const Login = () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const toaster = useToaster();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);

        try {
            setLoading(true);
            setError(false);
            setMessage({});

            const response = await axios.post(`${apiUrl}/auth/login`, formData);

            toaster.push(
                <Message showIcon type="success" closable >
                    {response?.data?.message}
                </Message>,
                { placement: 'topEnd', duration: 3000 }
            )

            localStorage.setItem('token', response.data.data.token);
            localStorage.setItem('email', response.data.data.user.email);

            const isEmailVerified = await axios.get(`${apiUrl}/auth/check/email`, {
                headers: {
                    'Authorization': `Bearer ${response.data.data.token}`,
                },
            });

            localStorage.setItem('isEmailVerified', isEmailVerified.data.status);

            navigate('/dashboard');
        } catch (error) {
            const errors = error.response?.data?.errors || {};
            setMessage(errors);

            toaster.push(
                <Message showIcon type="error" closable >
                    {error.response?.data?.message}
                </Message>,
                { placement: 'topEnd', duration: 3000 }
            )

            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const isEmailVerified = localStorage.getItem('isEmailVerified');

        if (storedToken && isEmailVerified == 'true') {
            navigate('/dashboard');
        }

    }, [navigate]);

    useEffect(() => {
        document.title = 'Login | Task Reminder';
    }, []);


    return (
        <>
            <div className="flex">
                <div className="w-full flex h-screen">
                    <div className="w-1/2">
                        <div className='h-screen flex justify-center items-center'>
                            <div className="w-2/3 mx-auto">
                                <h1 className="text-[2.25rem] font-bold">Get Started Now</h1>
                                <p className="text-base text-gray-500">Enter your credentials to access your account.</p>

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

                                        <div>
                                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                                Password
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    id="password"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    className={`mt-1 block w-full px-3 py-2 border ${message.password ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm my-2`}
                                                />
                                                <button
                                                    type="button"
                                                    className="absolute right-3 top-3"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    {showPassword ? (
                                                        <EyeOffIcon className="h-5 w-5 text-gray-400" />
                                                    ) : (
                                                        <EyeIcon className="h-5 w-5 text-gray-400" />
                                                    )}
                                                </button>
                                                {message.password && (
                                                    <p className="text-red-500 text-sm">{message.password}</p>
                                                )}

                                            </div>
                                        </div>

                                        <div className="text-end">
                                            <Link to={'/auth/forgot-password'} className="text-sm text-blue-600 hover:text-blue-500 mr-2">
                                                Forgot password?
                                            </Link>
                                        </div>

                                        <button
                                            disabled={loading}
                                            type="submit"
                                            className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-md shadow-sm hover:bg-blue-700 transition duration-200">
                                            {loading ? (
                                                <Loader content='Loading...' />
                                            ) : (
                                                'Login')}
                                        </button>
                                    </div>
                                </form>

                                <p className="mt-6 text-sm">
                                    Don't have an account?{' '}
                                    <Link to={'/auth/register'} className="text-blue-600 hover:text-blue-500">
                                        Sign up
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
        </>
    );
};

export default Login;
