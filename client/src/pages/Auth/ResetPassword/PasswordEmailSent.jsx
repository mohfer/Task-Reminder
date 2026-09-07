import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { passwordApi } from '@/api/passwordApi';

const PasswordEmailSent = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setLoading(true);
            const response = await passwordApi.sendResetLink({ email });
            toast.success(response?.data?.message || 'Reset email sent');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to resend email');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const storedEmail = localStorage.getItem('email');
        const isPasswordReset = localStorage.getItem('isPasswordReset');

        setEmail(storedEmail || '');

        if (!isPasswordReset) {
            navigate('/auth/login');
        }
    }, [navigate]);

    useEffect(() => {
        document.title = 'Forgot Password - Task Reminder';
    }, []);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
            <img src='/logo.webp' className='mb-8 mt-4 w-32' alt='logo' />
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className='text-2xl'>Email Sent</CardTitle>
                    <CardDescription>
                        We’ve sent a password reset email to <span className='font-semibold text-foreground'>{email}.</span> Please check your inbox and follow the instructions.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className='space-y-4'>
                        <Button type='submit' className='w-full'>
                            {loading ? 'Resending...' : 'Resend Email'}
                        </Button>
                    </form>

                    <p className='mt-6 text-sm text-center'>
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

export default PasswordEmailSent;
