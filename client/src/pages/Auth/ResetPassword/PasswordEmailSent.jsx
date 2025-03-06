import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader, useToaster, Message } from 'rsuite';
import axios from 'axios';

const PasswordEmailSent = () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const navigate = useNavigate();
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
        const storedEmail = localStorage.getItem('email');
        const isPasswordReset = localStorage.getItem('isPasswordReset');

        setEmail(storedEmail);

        if (!isPasswordReset) {
            navigate('/auth/login');
        }
    }, [navigate]);

    useEffect(() => {
        document.title = 'Forgot Password - Task Reminder';
    }, []);

    return (
        <div className='h-screen flex justify-center items-center p-4'>
            <div className="xl:w-1/3 border p-4 rounded-lg shadow-lg">
                <h1 className="text-[2.25rem] font-bold">Email Sent</h1>
                <p className="text-base text-gray-500">We’ve sent a password reset email to <span className='font-bold'>{email}.</span> Please check your inbox and follow the instructions to reset your password. If you didn’t receive the email, check your spam folder or try resending the request.</p>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-2 mt-12">
                        <button
                            disabled={loading}
                            type="submit"
                            className="w-full py-2 px-4 bg-primary-color text-white font-medium rounded-md shadow-sm hover:bg-hover-primary-color transition duration-200">
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
    );
};

export default PasswordEmailSent;
