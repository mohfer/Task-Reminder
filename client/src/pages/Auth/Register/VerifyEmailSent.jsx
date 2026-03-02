import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { authApi } from '@/api/authApi';

const VerifyEmailSent = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setLoading(true);
            const response = await authApi.resendVerificationEmail({ email });
            toast.success(response.data.message);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to resend email');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        localStorage.removeItem('isPasswordReset');

        const storedEmail = localStorage.getItem('email');
        const storedToken = localStorage.getItem('token');
        const isEmailVerified = localStorage.getItem('isEmailVerified');

        setEmail(storedEmail || '');

        if (!storedToken) {
            navigate('/auth/login');
        } else if (isEmailVerified === 'true') {
            navigate('/dashboard');
        }
    }, [navigate]);

    useEffect(() => {
        document.title = 'Email Sent - Task Reminder';
    }, []);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
            <img src='/logo.webp' className='mb-8 mt-4 w-32' alt='logo' />
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className='text-2xl'>Email Sent</CardTitle>
                    <CardDescription>
                        We’ve sent a confirmation email to <span className='font-semibold text-foreground'>{email}.</span> Please check your inbox and click the link to verify your email.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className='space-y-4'>
                        <Button type='submit' className='w-full'>
                            {loading ? 'Resending...' : 'Resend Email'}
                        </Button>
                    </form>
                    <p className='mt-6 text-center text-sm'>
                        <Link to='/auth/login' className='text-muted-foreground hover:text-foreground'>
                            <ArrowLeft className='w-3 inline-block align-middle mr-2' />
                            Back to login
                        </Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};

export default VerifyEmailSent;
