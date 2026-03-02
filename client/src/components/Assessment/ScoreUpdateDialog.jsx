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
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/shared/FormField';

const getFieldError = (errors, key) => {
    const value = errors?.[key];
    return Array.isArray(value) ? value[0] : value;
};

export const ScoreUpdateDialog = ({ open, onOpenChange, initialData, isLoading, onSubmit }) => {
    const [course, setCourse] = useState('');
    const [score, setScore] = useState('');
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (!open) {
            return;
        }

        setCourse(initialData?.course_content || '');
        setScore(String(initialData?.score || ''));
        setErrors({});
    }, [open, initialData]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const result = await onSubmit(initialData?.id, Number(score));
        if (result.success) {
            onOpenChange(false);
            return;
        }
        setErrors(result.errors || {});
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Update Score</DialogTitle>
                    <DialogDescription>Update the score of the selected course content.</DialogDescription>
                </DialogHeader>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <FormField label="Course Content">
                        <Input value={course} disabled />
                    </FormField>

                    <FormField label="Score" error={getFieldError(errors, 'score')}>
                        <Input type="number" min={0} value={score} onChange={(event) => setScore(event.target.value)} />
                    </FormField>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Updating...' : 'Update'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
