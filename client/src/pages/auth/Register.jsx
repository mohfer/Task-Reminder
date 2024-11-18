import { useState, useEffect } from 'react';
import { EyeIcon, EyeOffIcon, Info } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Whisper, Tooltip, useToaster, Message, Loader } from 'rsuite';
import axios from 'axios';

const Register = () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [message, setMessage] = useState({});

    const toaster = useToaster();
    const navigate = useNavigate();

    const phoneTooltip = (
        <Tooltip>
            Phone number is used to send notifications.
        </Tooltip>
    )

    const emailTooltip = (
        <Tooltip>
            Email is used to send verification.
        </Tooltip>
    )

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();

        formData.append('name', name);
        formData.append('email', email);
        formData.append('phone', phone);
        formData.append('password', password);
        formData.append('password_confirmation', confirmPassword);

        try {
            setLoading(true);
            const response = await axios.post(`${apiUrl}/auth/register`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            localStorage.setItem('token', response.data.data.token);
            localStorage.setItem('email', response.data.data.user.email);
            localStorage.setItem('isEmailVerified', false);

            navigate('/auth/verify-email')

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
        document.title = 'Register | Task Reminder';
    }, []);

    return (
        <div className="flex">
            <div className="w-full flex h-screen">
                <div className="w-1/2">
                    <div className='h-screen flex justify-center items-center'>
                        <div className="w-2/3 mx-auto">
                            <h1 className="text-[2.25rem] font-bold">Let’s Sign Up</h1>
                            <p className="text-base text-gray-500">Enter your credentials to create your account.</p>

                            <form onSubmit={handleSubmit}>
                                <div className="space-y-2 mt-12">
                                    <div>
                                        <label htmlFor="name" className="text-base font-medium text-gray-700">
                                            Name
                                        </label>
                                        <input
                                            type="name"
                                            id="name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className={`mt-1 block w-full px-3 py-2 border ${message.name ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm my-2`}
                                        />
                                        {message.name && (
                                            <p className="text-red-500 text-sm">{message.name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <div className='flex'>
                                            <label htmlFor="email" className="text-base font-medium text-gray-700">
                                                Email
                                            </label>
                                            <Whisper placement="top" controlId="control-id-hover" trigger="hover" speaker={emailTooltip}>
                                                <Info className='w-3 ml-2' />
                                            </Whisper>
                                        </div>
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
                                        <div className='flex'>
                                            <label htmlFor="phone" className="text-base font-medium text-gray-700">
                                                Phone
                                            </label>
                                            <Whisper placement="top" controlId="control-id-hover" trigger="hover" speaker={phoneTooltip}>
                                                <Info className='w-3 ml-2' />
                                            </Whisper>
                                        </div>
                                        <div className='flex items-center gap-2'>
                                            <div className='w-1/6'>
                                                <input
                                                    value="+62"
                                                    className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm my-2'
                                                    disabled
                                                />
                                            </div>
                                            <div className='w-full'>
                                                <input
                                                    type="phone"
                                                    id="phone"
                                                    value={phone}
                                                    onChange={(e) => setPhone(e.target.value)}
                                                    className={`mt-1 block w-full px-3 py-2 border ${message.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm my-2`}
                                                />
                                            </div>
                                        </div>
                                        {message.phone && (
                                            <p className="text-red-500 text-sm">{message.phone}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="password" className="text-base font-medium text-gray-700">
                                            Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                id="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className={`mt-1 block w-full px-3 py-2 border ${message.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm my-2`}
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

                                    <div>
                                        <label htmlFor="confirmPassword" className="text-base font-medium text-gray-700">
                                            Confirm Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                id="confirmPassword"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className={`mt-1 block w-full px-3 py-2 border ${message.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm my-2`}
                                            />
                                            <button
                                                type="button"
                                                className="absolute right-3 top-3"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            >
                                                {showConfirmPassword ? (
                                                    <EyeOffIcon className="h-5 w-5 text-gray-400" />
                                                ) : (
                                                    <EyeIcon className="h-5 w-5 text-gray-400" />
                                                )}
                                            </button>
                                            {message.password_confirmation && (
                                                <p className="text-red-500 text-sm">{message.password_confirmation}</p>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-md shadow-sm hover:bg-blue-700 transition duration-200">
                                        {loading ? (
                                            <Loader content='Loading...' />
                                        ) : (
                                            'Register'
                                        )}
                                    </button>
                                </div>
                            </form>

                            <p className="mt-6 text-sm">
                                Already have an account?{' '}
                                <Link to={'/auth/login'} className="text-blue-600 hover:text-blue-500">
                                    Login
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="w-1/2 bg-black p-8 flex items-center justify-center h-screen">
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

export default Register;