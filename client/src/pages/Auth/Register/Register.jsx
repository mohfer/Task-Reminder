import { useState, useEffect } from 'react';
import { Info } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Whisper, Tooltip, useToaster, Message, Input, InputGroup, Button } from 'rsuite';
import VisibleIcon from '@rsuite/icons/Visible';
import EyeCloseIcon from '@rsuite/icons/EyeClose';
import axios from 'axios';

const Register = () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({});

    const toaster = useToaster();
    const navigate = useNavigate();

    const emailTooltip = (
        <Tooltip>
            Email is used to send notification.
        </Tooltip>
    )

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();

        formData.append('name', name);
        formData.append('email', email);
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

        document.title = 'Register - Task Reminder';
    }, []);

    return (
        <>
            <div className='min-h-screen flex flex-col justify-center items-center p-4'>
                <img src="/logo.webp" className='w-32 mb-8 mt-4' alt="logo" />
                <div className="xl:w-1/3 border p-6 rounded-lg shadow-lg bg-white">
                    <h1 className="text-[2.25rem] font-bold">Let’s Sign Up</h1>
                    <p className="text-base text-gray-500">Enter your credentials to create your account.</p>

                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4 mt-8">
                            <div>
                                <label htmlFor="name" className="text-base font-medium text-gray-700">
                                    Name
                                </label>
                                <Input
                                    id='name'
                                    placeholder='John Doe'
                                    value={name}
                                    onChange={value => setName(value)}
                                    className={`${message.name ? 'border border-red-500' : ''} my-2`}
                                    autoComplete='name'
                                />
                                {message.name && <p className="text-red-500 text-sm">{message.name}</p>}
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
                                <Input
                                    id='email'
                                    type='email'
                                    placeholder='john.doe@gmail.com'
                                    value={email}
                                    onChange={value => setEmail(value)}
                                    className={`${message.email ? 'border border-red-500' : ''} my-2`}
                                    autoComplete='email'
                                />
                                {message.email && <p className="text-red-500 text-sm">{message.email}</p>}
                            </div>

                            <div>
                                <label htmlFor="password" className="text-base font-medium text-gray-700">
                                    Password
                                </label>
                                <InputGroup inside className={`${message.password ? 'border border-red-500 rounded-md' : ''} my-2`}>
                                    <Input
                                        id='password'
                                        placeholder='**********'
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
                                <label htmlFor="confirmPassword" className="text-base font-medium text-gray-700">
                                    Confirm Password
                                </label>
                                <InputGroup inside className={`${message.password_confirmation ? 'border border-red-500 rounded-md' : ''} my-2`}>
                                    <Input
                                        id='confirmPassword'
                                        placeholder='**********'
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
                                className='w-full !bg-blue-500 hover:!bg-blue-600'
                                block
                            >
                                {loading ? 'Registering...' : 'Register'}
                            </Button>
                        </div>
                    </form>

                    <p className="mt-6 text-sm text-center">
                        Already have an account?{' '}
                        <Link to={'/auth/login'} className="text-blue-500 hover:text-blue-600">
                            Login
                        </Link>
                    </p>
                </div>
            </div>
        </>
    );
};

export default Register;