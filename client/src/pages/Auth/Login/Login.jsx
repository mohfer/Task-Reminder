import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToaster, Message, Checkbox, Form, InputGroup, Input, Button } from 'rsuite';
import VisibleIcon from '@rsuite/icons/Visible';
import EyeCloseIcon from '@rsuite/icons/EyeClose';
import axios from 'axios';

const Login = () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [message, setMessage] = useState({});
    const [loading, setLoading] = useState(false);

    const toaster = useToaster();
    const navigate = useNavigate();

    const handleSubmit = async () => {
        // e.preventDefault();

        const loginData = {
            email,
            password,
            remember_me: rememberMe
        }

        try {
            setLoading(true);
            setMessage({});

            const response = await axios.post(`${apiUrl}/auth/login`, loginData, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            toaster.push(
                <Message showIcon type="success" closable >
                    {response?.data?.message}
                </Message>,
                { placement: 'topEnd', duration: 3000 }
            )

            localStorage.setItem('token', response.data.data.token);
            localStorage.setItem('email', response.data.data.user.email);
            localStorage.setItem('name', response.data.data.user.name);

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
        document.title = 'Login - Task Reminder';
    }, []);


    return (
        <>
            <div className='min-h-screen flex flex-col justify-center items-center p-4'>
                <img src="/logo.webp" className='w-32 mb-8 mt-4' alt="logo" />
                <div className="xl:w-1/3 border p-4 rounded-lg shadow-lg">
                    <h1 className="text-[2.25rem] font-bold">Get Started Now</h1>
                    <p className="text-base text-gray-500">Enter your credentials to access your account.</p>

                    <Form onSubmit={handleSubmit}>
                        <div className="space-y-4 mt-8">
                            <Form.Group>
                                <Form.ControlLabel>Email</Form.ControlLabel>
                                <Input
                                    placeholder='Enter your email'
                                    value={email}
                                    autoComplete='username'
                                    onChange={(value) => setEmail(value)}
                                    className={`${message.email ? 'border border-red-500' : ''}`}
                                />
                                {message.email && (
                                    <p className="text-red-500 text-sm">{message.email}</p>
                                )}
                            </Form.Group>
                            <Form.Group>
                                <Form.ControlLabel>Password</Form.ControlLabel>
                                <InputGroup inside style={{ width: '100%' }} className={`${message.password ? 'border border-red-500' : ''}`}>
                                    <Input
                                        placeholder='Enter your password'
                                        value={password}
                                        autoComplete='current-password'
                                        onChange={(value) => setPassword(value)}
                                        type={passwordVisible ? 'text' : 'password'}
                                    />
                                    <InputGroup.Button onClick={() => setPasswordVisible(!passwordVisible)} aria-label={passwordVisible ? 'Hide password' : 'Show password'}>
                                        {passwordVisible ? <VisibleIcon /> : <EyeCloseIcon />}
                                    </InputGroup.Button>
                                </InputGroup>
                                {message.password && (
                                    <p className="text-red-500 text-sm">{message.password}</p>
                                )}
                            </Form.Group>

                            <div className='flex justify-between items-center'>
                                <Checkbox
                                    checked={rememberMe}
                                    onChange={(_, checked) => setRememberMe(checked)}
                                >
                                    Remember me
                                </Checkbox>
                                <Link to={'/auth/forgot-password'} className="text-sm text-blue-500 hover:text-hover-blue-500 mr-2">
                                    Forgot password?
                                </Link>
                            </div>

                            <Button
                                appearance='primary'
                                type='submit'
                                loading={loading}
                                className='w-full !bg-blue-500 hover:!bg-hover-blue-500'
                                block
                            >
                                {loading ? 'Authenticating...' : 'Login'}
                            </Button>
                        </div>
                    </Form>

                    <p className="mt-6 text-sm">
                        Don’t have an account?{' '}
                        <Link to={'/auth/register'} className="text-blue-500">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div >
        </>
    );
};

export default Login;
