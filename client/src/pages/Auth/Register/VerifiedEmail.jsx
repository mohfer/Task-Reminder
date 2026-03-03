import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { authApi } from '@/api/authApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const VerifiedEmail = () => {
    const navigate = useNavigate();
    const { id, hash } = useParams();
    const [searchParams] = useSearchParams();
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [description, setDescription] = useState('');

    const verifyEmail = useCallback(async () => {
        try {
            setLoading(true);

            const token = localStorage.getItem('token');

            if (!token) {
                throw new Error('Token not found. Please log in first.');
            }

            const expires = searchParams.get('expires') || '';
            const signature = searchParams.get('signature') || '';

            await authApi.verifyEmail(id, hash, {
                expires,
                signature,
            });

            localStorage.setItem('isEmailVerified', true);

            setTimeout(() => {
                navigate('/dashboard');
            }, 3000);
        } catch (error) {
            console.error(error);

            setMessage(error.response.data.message);
            setDescription('Email verification failed. Please try again.');

            localStorage.setItem('isEmailVerified', false);

            setTimeout(() => {
                navigate('/dashboard');
            }, 3000);

        } finally {
            setLoading(false);
        }
    }, [id, hash, navigate, searchParams]);

    useEffect(() => {
        localStorage.removeItem('isPasswordReset')

        const storedToken = localStorage.getItem('token');
        const storedEmail = localStorage.getItem('email');
        const isEmailVerified = localStorage.getItem('isEmailVerified');

        if (!storedToken || !storedEmail || isEmailVerified === 'true') {
            navigate('/dashboard');
        }

        verifyEmail();
    }, [navigate, verifyEmail]);

    useEffect(() => {
        document.title = 'Email Verified - Task Reminder';
    }, []);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
            <img src="/logo.webp" className='mb-8 mt-4 w-32' alt="logo" />
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl">
                        {loading ? 'Verifying...' : (message || 'Email Verified')}
                    </CardTitle>
                    <CardDescription>
                        {loading ? '' : (description || 'Your email address has been successfully verified. You will be redirected shortly.')}
                    </CardDescription>
                </CardHeader>
                <CardContent />
            </Card>
        </div>
    );
};

export default VerifiedEmail;