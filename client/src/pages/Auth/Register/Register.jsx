import { useEffect, useState } from 'react';
import { Info } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { FormField } from '@/components/shared/FormField';
import { PasswordInput } from '@/components/shared/PasswordInput';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { authApi } from '@/api/authApi';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({});

    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();

        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('password', password);
        formData.append('password_confirmation', confirmPassword);

        try {
            setLoading(true);
            const response = await authApi.register(formData);

            localStorage.setItem('token', response.data.data.token);
            localStorage.setItem('email', response.data.data.user.email);
            localStorage.setItem('name', response.data.data.user.name);
            localStorage.setItem('isEmailVerified', false);

            navigate('/auth/verify-email');
        } catch (error) {
            const errors = error.response?.data?.errors || {};
            setMessage(errors);
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        localStorage.removeItem('isPasswordReset');
        document.title = 'Register - Task Reminder';
    }, []);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
            <img src="/logo.webp" className="mb-8 mt-4 w-32" alt="logo" />
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl">Let’s Sign Up</CardTitle>
                    <CardDescription>Enter your credentials to create your account.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className='space-y-4'>
                        <FormField label='Name' error={message.name}>
                            <Input
                                placeholder='John Doe'
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                autoComplete='name'
                            />
                        </FormField>

                        <FormField
                            label={
                                <span className='flex items-center gap-2'>
                                    Email
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Info className='h-3 w-3' />
                                            </TooltipTrigger>
                                            <TooltipContent>Email is used to send notifications.</TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </span>
                            }
                            error={message.email}
                        >
                            <Input
                                type='email'
                                placeholder='john.doe@gmail.com'
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                autoComplete='email'
                            />
                        </FormField>

                        <FormField label='Password' error={message.password}>
                            <PasswordInput
                                placeholder='**********'
                                value={password}
                                onChange={setPassword}
                                autoComplete='new-password'
                            />
                        </FormField>

                        <FormField label='Confirm Password' error={message.password_confirmation}>
                            <PasswordInput
                                placeholder='**********'
                                value={confirmPassword}
                                onChange={setConfirmPassword}
                                autoComplete='new-password'
                            />
                        </FormField>

                        <Button type='submit' className='w-full'>
                            {loading ? 'Registering...' : 'Register'}
                        </Button>
                    </form>

                    <p className='mt-6 text-center text-sm'>
                        Already have an account?{' '}
                        <Link to='/auth/login' className='text-primary hover:text-primary/80'>
                            Login
                        </Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};

export default Register;
