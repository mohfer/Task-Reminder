import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToaster, Message, Input, InputGroup, Button } from 'rsuite';
import VisibleIcon from '@rsuite/icons/Visible';
import EyeCloseIcon from '@rsuite/icons/EyeClose';
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
            <div className='min-h-screen flex flex-col justify-center items-center p-4'>
                <img src="/logo.webp" className='w-32 mb-8 mt-4' alt="logo" />
                <div className="xl:w-1/3 border p-4 rounded-lg shadow-lg">
                    <h1 className="text-[2.25rem] font-bold">Create a New Password</h1>
                    <p className="text-base text-gray-500">Enter your new password and don’t forget it</p>

                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4 mt-8">
                            <div>
                                <label htmlFor="password" className="text-base font-medium text-gray-700">Password</label>
                                <InputGroup inside className={`${message.password ? 'border border-red-500 rounded-md' : ''} my-2`}>
                                    <Input
                                        id='password'
                                        placeholder='Password'
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        autoComplete='new-password'
                                        onChange={value => setPassword(value)}
                                    />
                                    <InputGroup.Button onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                                        {showPassword ? <VisibleIcon /> : <EyeCloseIcon />}
                                    </InputGroup.Button>
                                </InputGroup>
                                {message.password && <p className="text-red-500 text-sm">{message.password}</p>}
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                                <InputGroup inside className={`${message.password_confirmation ? 'border border-red-500 rounded-md' : ''} my-2`}>
                                    <Input
                                        id='confirmPassword'
                                        placeholder='Confirm Password'
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        autoComplete='new-password'
                                        onChange={value => setConfirmPassword(value)}
                                    />
                                    <InputGroup.Button onClick={() => setShowConfirmPassword(!showConfirmPassword)} aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}>
                                        {showConfirmPassword ? <VisibleIcon /> : <EyeCloseIcon />}
                                    </InputGroup.Button>
                                </InputGroup>
                                {message.password_confirmation && <p className="text-red-500 text-sm">{message.password_confirmation}</p>}
                            </div>

                            <Button
                                appearance='primary'
                                type='submit'
                                loading={loading}
                                className='w-full !bg-blue-500 hover:!bg-hover-blue-500'
                                block
                            >
                                {loading ? 'Resetting Password...' : 'Reset Password'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

export default ResetPassword