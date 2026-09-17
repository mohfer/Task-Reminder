import { useEffect, useState } from 'react';
import { Plug } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { PasswordInput } from '@/components/shared/PasswordInput';
import { validateRequired } from '@/lib/formUtils';

export const SiakangCredentialsForm = ({
    isLoading,
    isMutating,
    hasCredentials,
    onSave,
    onDelete,
    onTestConnection,
}) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (!showForm) {
            setEmail('');
            setPassword('');
            setErrors({});
        }
    }, [showForm]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const clientErrors = validateRequired(
            { siakang_email: email, siakang_password: password },
            [
                { name: 'siakang_email', label: 'Siakang Email' },
                { name: 'siakang_password', label: 'Siakang Password' },
            ]
        );
        if (Object.keys(clientErrors).length > 0) {
            setErrors(clientErrors);
            return;
        }
        const result = await onSave({ siakang_email: email, siakang_password: password });
        if (result.success) {
            setShowForm(false);
            return;
        }
        setErrors(result.errors || {});
    };

    const handleDelete = async () => {
        const result = await onDelete();
        if (result.success) {
            setShowForm(false);
        }
    };

    if (isLoading) {
        return (
            <Card className="my-4">
                <CardContent className="p-6">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="mt-3 h-4 w-72" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="my-4">
            <CardContent className="p-6">
                <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <p className="text-lg">Siakang Account</p>
                            <Badge variant={hasCredentials ? 'default' : 'secondary'}>
                                {hasCredentials ? 'Connected' : 'Not connected'}
                            </Badge>
                            {hasCredentials ? (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    aria-label="Test Siakang connection"
                                    title="Test Siakang connection"
                                    onClick={onTestConnection}
                                    disabled={isMutating}
                                >
                                    <Plug className="h-4 w-4" />
                                </Button>
                            ) : null}
                        </div>
                    </div>

                    <span className="text-muted-foreground">
                        Credentials used to sync your schedule and grades.
                    </span>

                    {hasCredentials ? (
                        <div className="flex flex-row gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1 sm:flex-none"
                                onClick={() => setShowForm((v) => !v)}
                                disabled={isMutating}
                            >
                                {showForm ? 'Cancel' : 'Update'}
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                className="flex-1 sm:flex-none"
                                onClick={handleDelete}
                                disabled={isMutating}
                            >
                                Remove
                            </Button>
                        </div>
                    ) : (
                        <div className="w-fit">
                            <Button type="button" onClick={() => setShowForm((v) => !v)} disabled={isMutating}>
                                {showForm ? 'Cancel' : 'Add Credentials'}
                            </Button>
                        </div>
                    )}

                    {showForm && (
                        <>
                            <Separator className="my-2" />
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="siakang-email">Siakang Email</Label>
                                    <Input
                                        id="siakang-email"
                                        type="email"
                                        placeholder="xxx@student.untirta.ac.id"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={isMutating}
                                        required
                                    />
                                    {errors.siakang_email && (
                                        <p className="text-sm text-destructive">{errors.siakang_email}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="siakang-password">Siakang Password</Label>
                                    <PasswordInput
                                        id="siakang-password"
                                        value={password}
                                        onChange={setPassword}
                                        placeholder="Enter your Siakang password"
                                        disabled={isMutating}
                                        required
                                    />
                                    {errors.siakang_password && (
                                        <p className="text-sm text-destructive">{errors.siakang_password}</p>
                                    )}
                                </div>

                                <Button type="submit" disabled={isMutating}>
                                    {isMutating ? 'Saving...' : 'Save Credentials'}
                                </Button>
                            </form>
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
