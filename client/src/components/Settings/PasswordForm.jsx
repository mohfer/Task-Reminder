import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/shared/FormField';
import { PasswordInput } from '@/components/shared/PasswordInput';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getFieldError, validateRequired } from '@/lib/formUtils';

export const PasswordForm = ({ onSubmit }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [oldPasswordError, setOldPasswordError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const clientErrors = validateRequired(
            { old_password: currentPassword, password: newPassword, password_confirmation: confirmPassword },
            [
                { name: 'old_password', label: 'Current Password' },
                { name: 'password', label: 'New Password' },
                { name: 'password_confirmation', label: 'Confirm Password' },
            ]
        );
        if (Object.keys(clientErrors).length > 0) {
            setErrors({ password: clientErrors.password, password_confirmation: clientErrors.password_confirmation });
            setOldPasswordError(clientErrors.old_password || '');
            return;
        }
        setIsSubmitting(true);
        try {
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
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Update Password</CardTitle>
                <CardDescription>Ensure your account uses a long and secure password.</CardDescription>
            </CardHeader>
            <CardContent>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <FormField label="Current Password" error={oldPasswordError}>
                        <PasswordInput
                            value={currentPassword}
                            onChange={setCurrentPassword}
                            placeholder="Enter your current password"
                            required
                        />
                    </FormField>

                    <FormField label="New Password" error={getFieldError(errors, 'password')}>
                        <PasswordInput
                            value={newPassword}
                            onChange={setNewPassword}
                            placeholder="Enter your new password"
                            required
                        />
                    </FormField>

                    <FormField label="Confirm Password" error={getFieldError(errors, 'password_confirmation')}>
                        <PasswordInput
                            value={confirmPassword}
                            onChange={setConfirmPassword}
                            placeholder="Confirm your new password"
                            required
                        />
                    </FormField>

                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Save'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};
