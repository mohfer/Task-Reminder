import { useEffect, useState } from 'react';
import { EyeOffIcon, EyeIcon } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader, useToaster, Message } from 'rsuite';
import axios from 'axios';

const ResetPassword = () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const [searchParams] = useSearchParams();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [message, setMessage] = useState({});
    const [loading, setLoading] = useState(false);

    const token = searchParams.get("token");
    const email = searchParams.get("email");

    const navigate = useNavigate();
    const toaster = useToaster();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();

        formData.append('token', token);
        formData.append('email', email);
        formData.append('password', password);
        formData.append('password_confirmation', confirmPassword);

        try {
            setLoading(true);
            const response = await axios.post(`${apiUrl}/password/reset`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            toaster.push(
                <Message showIcon type="success" closable >
                    {response?.data?.message}
                </Message>,
                { placement: 'topEnd', duration: 3000 }
            )

            localStorage.removeItem('isPasswordReset');
            navigate('/auth/login');

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
    }

    useEffect(() => {
        const isPasswordReset = localStorage.getItem('isPasswordReset');

        if (!isPasswordReset) {
            navigate('/auth/login');
        }

    }, [navigate])

    useEffect(() => {
        document.title = "Reset Password - Task Reminder";
    })

    return (
        <>
            <div className='h-screen flex justify-center items-center p-4'>
                <div className="xl:w-1/3 border p-4 rounded-lg shadow-lg">
                    <h1 className="text-[2.25rem] font-bold">Create a New Password</h1>
                    <p className="text-base text-gray-500">Enter your new password and don't forget it</p>

                    <form onSubmit={handleSubmit}>
                        <div className="space-y-2 mt-12">
                            <div>
                                <label htmlFor="password" className="text-base font-medium text-gray-700">
                                    Password
                                </label>
                                <div className="relative">

                                    <input
                                    placeholder='Password'
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
                                </div>
                                {message.password && (
                                    <p className="text-red-500 text-sm">{message.password}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <input
                                    placeholder='Confirm Password'
                                        type={showConfirmPassword ? "text" : "password"}
                                        id="confirmPassword"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className={`mt-1 block w-full px-3 py-2 border ${message.password_confirmation ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm my-2`}
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
                                    <Loader content='Resetting Password...' />
                                ) : (
                                    'Reset Password')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

export default ResetPassword