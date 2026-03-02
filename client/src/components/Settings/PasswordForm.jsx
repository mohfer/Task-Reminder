import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/shared/FormField';
import { PasswordInput } from '@/components/shared/PasswordInput';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const getFieldError = (errors, key) => {
    const value = errors?.[key];
    return Array.isArray(value) ? value[0] : value;
};

export const PasswordForm = ({ isLoading, isMutating, onSubmit }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [oldPasswordError, setOldPasswordError] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        const result = await onSubmit({
            old_password: currentPassword,
            password: newPassword,
            password_confirmation: confirmPassword,
        });

        if (result.success) {
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setErrors({});
            setOldPasswordError('');
            return;
        }

        setErrors(result.errors || {});
        setOldPasswordError(result.oldPasswordError || '');
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Update Password</CardTitle>
                <CardDescription>Ensure your account uses a long and secure password.</CardDescription>
            </CardHeader>
            <CardContent>

                {isLoading ? (
                    <div className="space-y-3">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-24" />
                    </div>
                ) : (
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <FormField label="Current Password" error={oldPasswordError}>
                            <PasswordInput
                                value={currentPassword}
                                onChange={setCurrentPassword}
                                placeholder="Enter your current password"
                            />
                        </FormField>

                        <FormField label="New Password" error={getFieldError(errors, 'password')}>
                            <PasswordInput
                                value={newPassword}
                                onChange={setNewPassword}
                                placeholder="Enter your new password"
                            />
                        </FormField>

                        <FormField label="Confirm Password" error={getFieldError(errors, 'password_confirmation')}>
                            <PasswordInput
                                value={confirmPassword}
                                onChange={setConfirmPassword}
                                placeholder="Confirm your new password"
                            />
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
