import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader, useToaster, Message } from 'rsuite';
import axios from 'axios';

const VerifyEmailSent = () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState(null);

    const toaster = useToaster();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            if (!token) {
                throw new Error('Token not found');
            }

            const response = await axios.post(`${apiUrl}/email/resend`, { email }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            setLoading(false);

            toaster.push(
                <Message showIcon type="success" closable >
                    {response.data.message}
                </Message>,
                { placement: 'topEnd', duration: 3000 }
            )
        } catch (error) {
            toaster.push(
                <Message showIcon type="error" closable >
                    {!token ? 'Token not found' : error.response.data.message}
                </Message>,
                { placement: 'topEnd', duration: 3000 }
            )
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        localStorage.removeItem('isPasswordReset')

        const storedEmail = localStorage.getItem('email');
        const storedToken = localStorage.getItem('token');
        const isEmailVerified = localStorage.getItem('isEmailVerified');

        setEmail(storedEmail);
        setToken(storedToken);

        if (!storedToken) {
            navigate('/auth/login');
        } else if (storedToken && isEmailVerified == 'true') {
            navigate('/dashboard');
        }

    }, [navigate]);

    useEffect(() => {
        document.title = 'Email Sent - Task Reminder';
    }, []);

    return (
        <div className='min-h-screen flex flex-col justify-center items-center p-4'>
            <img src="../../../../public/logo.png" className='w-32 mb-8 mt-4' alt="logo" />
            <div className="xl:w-1/3 border p-4 rounded-lg shadow-lg">
                <h1 className="text-[2.25rem] font-bold">Email Sent</h1>
                <p className="text-base text-gray-500">We’ve sent a confirmation email to <span className='font-bold'>{email}.</span> Please check your inbox and click the link to verify your email address. If you didn’t receive the email, check your spam folder or try resending the request.</p>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-2 mt-12">
                        <button
                            disabled={loading}
                            type="submit"
                            className="w-full py-2 px-4 bg-blue-500 text-white font-medium rounded-md shadow-sm hover:bg-hover-blue-500 transition duration-200">
                            {loading ? <Loader content="Resending..." /> : 'Resend Email'}
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
    );
};

export default VerifyEmailSent;
