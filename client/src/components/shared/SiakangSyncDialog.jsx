import { useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { assessmentApi } from '@/api/assessmentApi';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const SiakangSyncDialog = ({
    open,
    onOpenChange,
    isLoading,
    onSubmit,
    hasCredentials,
    title,
    description,
}) => {
    const [semesters, setSemesters] = useState([]);
    const [selectedSource, setSelectedSource] = useState('');
    const [isLoadingSemesters, setIsLoadingSemesters] = useState(false);
    const [fetchError, setFetchError] = useState('');

    useEffect(() => {
        if (!open) return;
        setSelectedSource('');
        setSemesters([]);
        setFetchError('');

        if (!hasCredentials) {
            setFetchError('Add your Siakang credentials in Settings first.');
            return;
        }

        setIsLoadingSemesters(true);
        assessmentApi.getSemesters()
            .then((resp) => {
                const data = resp.data.data;
                setSemesters(Array.isArray(data) ? data : []);
            })
            .catch((e) => {
                setFetchError(e.response?.data?.message || e.message);
                setSemesters([]);
            })
            .finally(() => setIsLoadingSemesters(false));
    }, [open, hasCredentials]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!selectedSource) return;
        const result = await onSubmit(selectedSource);
        if (result.success) {
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    {isLoadingSemesters ? (
                        <p className="text-sm text-muted-foreground">Loading semesters...</p>
                    ) : fetchError ? (
                        <p className="text-sm text-destructive">{fetchError}</p>
                    ) : semesters.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No semesters found on your Siakang account.</p>
                    ) : (
                        <Select value={selectedSource} onValueChange={setSelectedSource}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a Siakang semester..." />
                            </SelectTrigger>
                            <SelectContent>
                                {semesters.map((s) => (
                                    <SelectItem key={s.code} value={s.code}>
                                        {s.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading || !selectedSource}>
                            {isLoading ? 'Syncing...' : 'Sync'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
