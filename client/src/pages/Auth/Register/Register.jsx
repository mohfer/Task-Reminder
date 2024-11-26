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
            localStorage.setItem('name', response.data.data.user.name);
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
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        localStorage.removeItem('isPasswordReset')

        document.title = 'Register | Task Reminder';
    }, []);

    return (
        <>
            <div className='h-screen flex justify-center items-center p-4'>
                <div className="xl:w-1/3 border p-4 rounded-lg shadow-lg">
                    <h1 className="text-[2.25rem] font-bold">Let’s Sign Up</h1>
                    <p className="text-base text-gray-500">Enter your credentials to create your account.</p>

                    <form onSubmit={handleSubmit}>
                        <div className="space-y-2 mt-12">
                            <div>
                                <label htmlFor="name" className="text-base font-medium text-gray-700">
                                    Name
                                </label>
                                <input
                                placeholder='John Doe'
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
                                placeholder='bRf0m@example.com'
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
                                    <div className='w-full'>
                                        <input
                                        placeholder='01234567890'
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
                                    placeholder='**********'
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
                                    placeholder='**********'
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
                                disabled={loading}
                                type="submit"
                                className="w-full py-2 px-4 bg-primary-color text-white font-medium rounded-md shadow-sm hover:bg-hover-primary-color transition duration-200">
                                {loading ? (
                                    <Loader content='Registering...' />
                                ) : (
                                    'Register'
                                )}
                            </button>
                        </div>
                    </form>

                    <p className="mt-6 text-sm">
                        Already have an account?{' '}
                        <Link to={'/auth/login'} className="text-primary-color hover:text-hover-primary-color">
                            Login
                        </Link>
                    </p>
                </div>
            </div>
        </>
    );
};

export default Register;