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

export const SyncDialog = ({ open, onOpenChange, isLoading, onSubmit }) => {
    const [tasks, setTasks] = useState([]);
    const [selectedTaskId, setSelectedTaskId] = useState('');
    const [isLoadingTasks, setIsLoadingTasks] = useState(false);
    const [fetchError, setFetchError] = useState('');

    useEffect(() => {
        if (!open) return;
        setSelectedTaskId('');
        setTasks([]);
        setFetchError('');
        setIsLoadingTasks(true);

        assessmentApi.getMonitoringTasks()
            .then((resp) => {
                const data = resp.data.data;
                setTasks(Array.isArray(data) ? data : []);
            })
            .catch((e) => {
                setFetchError(e.response?.data?.message || e.message);
                setTasks([]);
            })
            .finally(() => setIsLoadingTasks(false));
    }, [open]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!selectedTaskId) return;
        const result = await onSubmit(Number(selectedTaskId));
        if (result.success) {
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Sync from Monitoring</DialogTitle>
                    <DialogDescription>
                        Fetch scores from monitoring-akademik-siakang and update matching courses.
                    </DialogDescription>
                </DialogHeader>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    {isLoadingTasks ? (
                        <p className="text-sm text-muted-foreground">Loading tasks...</p>
                    ) : fetchError ? (
                        <p className="text-sm text-destructive">{fetchError}</p>
                    ) : tasks.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No tasks available from monitoring.</p>
                    ) : (
                        <Select value={selectedTaskId} onValueChange={setSelectedTaskId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a monitoring task..." />
                            </SelectTrigger>
                            <SelectContent>
                                {tasks.map((t) => (
                                    <SelectItem key={t.id} value={String(t.id)}>
                                        {t.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading || !selectedTaskId}>
                            {isLoading ? 'Syncing...' : 'Sync'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
