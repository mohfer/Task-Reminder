import { useEffect, useState, useRef } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/shared/FormField';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const DEBOUNCE_MS = 500;

export const SyncDialog = ({ open, onOpenChange, monitoringUrl, isLoading, onSubmit }) => {
    const [url, setUrl] = useState('');
    const [tasks, setTasks] = useState([]);
    const [selectedTaskId, setSelectedTaskId] = useState('');
    const [isLoadingTasks, setIsLoadingTasks] = useState(false);
    const [fetchError, setFetchError] = useState('');
    const debounceRef = useRef(null);

    useEffect(() => {
        if (!open) return;
        setUrl(monitoringUrl || '');
        setSelectedTaskId('');
        setTasks([]);
        setFetchError('');
    }, [open, monitoringUrl]);

    // Fetch tasks with debounce on URL change
    useEffect(() => {
        if (!open || !url) {
            setTasks([]);
            setFetchError('');
            return;
        }

        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(() => {
            const trimmed = url.replace(/\/+$/, '');
            setIsLoadingTasks(true);
            setFetchError('');
            fetch(`${trimmed}/tasks`)
                .then((r) => {
                    if (!r.ok) throw new Error(`HTTP ${r.status}`);
                    return r.json();
                })
                .then((resp) => {
                    const data = resp.data ?? resp;
                    setTasks(Array.isArray(data) ? data : []);
                })
                .catch((e) => {
                    setFetchError(e.message);
                    setTasks([]);
                })
                .finally(() => setIsLoadingTasks(false));
        }, DEBOUNCE_MS);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [open, url]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!selectedTaskId) return;
        const result = await onSubmit(url, Number(selectedTaskId));
        if (result.success) {
            onOpenChange(false);
        }
    };

    const handleUrlChange = (value) => {
        setUrl(value);
        setSelectedTaskId('');
        setTasks([]);
        setFetchError('');
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
                    <FormField label="Monitoring URL">
                        <Input
                            type="url"
                            placeholder="http://192.168.1.180:3003/api"
                            value={url}
                            onChange={(e) => handleUrlChange(e.target.value)}
                        />
                    </FormField>

                    <FormField label="Task">
                        {isLoadingTasks ? (
                            <p className="text-sm text-muted-foreground">Loading tasks...</p>
                        ) : fetchError ? (
                            <p className="text-sm text-destructive">{fetchError}</p>
                        ) : tasks.length === 0 && url ? (
                            <p className="text-sm text-muted-foreground">No tasks found at this URL.</p>
                        ) : tasks.length > 0 ? (
                            <Select value={selectedTaskId} onValueChange={setSelectedTaskId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a monitoring task..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {tasks.map((t) => (
                                        <SelectItem key={t.id} value={String(t.id)}>
                                            {t.name} ({t.monitor_type === 'nilai' ? 'Nilai' : 'KRS'})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ) : null}
                    </FormField>

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
