import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/shared/FormField';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const getFieldError = (errors, key) => {
    const value = errors?.[key];
    return Array.isArray(value) ? value[0] : value;
};

export const ProfileForm = ({ userData, isLoading, isMutating, onSubmit }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [errors, setErrors] = useState({});

    useEffect(() => {
        setName(userData?.name || '');
        setEmail(userData?.email || '');
    }, [userData]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const result = await onSubmit({ name, email });
        if (result.success) {
            setErrors({});
            return;
        }
        setErrors(result.errors || {});
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your account profile information and email address.</CardDescription>
            </CardHeader>
            <CardContent>

                {isLoading ? (
                    <div className="space-y-3">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-24" />
                    </div>
                ) : (
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <FormField label="Name" error={getFieldError(errors, 'name')}>
                            <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Enter your name" />
                        </FormField>

                        <FormField label="Email" error={getFieldError(errors, 'email')}>
                            <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Enter your email" />
                        </FormField>

                        <Button type="submit" disabled={isMutating}>
                            {isMutating ? 'Saving...' : 'Save'}
                        </Button>
                    </form>
                )}
            </CardContent>
        </Card>
    );
};
