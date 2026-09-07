import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/shared/FormField';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getFieldError } from '@/lib/formUtils';

export const ProfileForm = ({ userData, isLoading, onSubmit }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setName(userData?.name || '');
        setEmail(userData?.email || '');
    }, [userData]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        try {
            const result = await onSubmit({ name, email });
            if (result.success) {
                setErrors({});
                return;
            }
            setErrors(result.errors || {});
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your account profile information and email address.</CardDescription>
            </CardHeader>
            <CardContent>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <FormField label="Name" error={getFieldError(errors, 'name')}>
                        {isLoading ? (
                            <Skeleton className="h-10 w-full" />
                        ) : (
                            <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Enter your name" />
                        )}
                    </FormField>

                    <FormField label="Email" error={getFieldError(errors, 'email')}>
                        {isLoading ? (
                            <Skeleton className="h-10 w-full" />
                        ) : (
                            <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Enter your email" />
                        )}
                    </FormField>

                    <Button type="submit" disabled={isSubmitting || isLoading}>
                        {isSubmitting ? 'Saving...' : 'Save'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};
