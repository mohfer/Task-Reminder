import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/shared/FormField';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { passwordApi } from '@/api/passwordApi';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState({});
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setLoading(true);
            await passwordApi.sendResetLink({ email });

            localStorage.setItem('email', email);
            localStorage.setItem('isPasswordReset', true);
            navigate('/auth/forgot-password/email-sent');
        } catch (error) {
            const errors = error.response?.data?.errors || {};
            setMessage(errors);
            toast.error(error.response?.data?.message || 'Failed to send reset email');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        document.title = 'Forgot Password - Task Reminder';
    }, []);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
            <img src='/logo.webp' className='mb-8 mt-4 w-32' alt='logo' />
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className='text-2xl'>Oh, You Lost Your Password?</CardTitle>
                    <CardDescription>No worries, we’ll send you reset instructions.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className='space-y-4'>
                        <FormField label='Email' error={message.email}>
                            <Input
                                type='email'
                                placeholder='Email'
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                autoComplete='email'
                            />
                        </FormField>

                        <Button type='submit' className='w-full'>
                            {loading ? 'Sending Email...' : 'Reset Password'}
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

export default ForgotPassword;
