import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export const SiakangCredentialsForm = ({
    isLoading,
    isMutating,
    hasCredentials,
    onSave,
    onDelete,
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
                        </div>
                    </div>

                    <span className="text-muted-foreground">
                        Credentials used to sync your schedule and grades.
                    </span>

                    {hasCredentials ? (
                        <div className="flex flex-col gap-2 sm:flex-row">
                            <Button type="button" variant="outline" onClick={() => setShowForm((v) => !v)} disabled={isMutating}>
                                {showForm ? 'Cancel' : 'Update Credentials'}
                            </Button>
                            <Button type="button" variant="destructive" onClick={handleDelete} disabled={isMutating}>
                                Remove Credentials
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
                                    />
                                    {errors.siakang_email && (
                                        <p className="text-sm text-destructive">{errors.siakang_email}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="siakang-password">Siakang Password</Label>
                                    <Input
                                        id="siakang-password"
                                        type="password"
                                        placeholder="Enter your Siakang password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={isMutating}
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
