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
import { getFieldError } from '@/lib/formUtils';
import { DiscardConfirmDialog } from '@/components/shared/DiscardConfirmDialog';

export const ScoreUpdateDialog = ({ open, onOpenChange, initialData, isLoading, onSubmit }) => {
    const [course, setCourse] = useState('');
    const [score, setScore] = useState('');
    const [errors, setErrors] = useState({});
    const [showDiscard, setShowDiscard] = useState(false);

    const isDirty = score !== String(initialData?.score || '');

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
        const trimmed = score.trim();

        // An empty score clears the stored value (the column is nullable).
        if (trimmed === '') {
            const result = await onSubmit(initialData?.id, null);
            if (result.success) {
                onOpenChange(false);
                return;
            }
            setErrors(result.errors || {});
            return;
        }

        const numeric = Number(trimmed.replace(',', '.'));
        if (!Number.isFinite(numeric) || numeric < 0 || numeric > 100) {
            setErrors({ score: 'Score must be a number between 0 and 100.' });
            return;
        }

        const result = await onSubmit(initialData?.id, numeric);
        if (result.success) {
            onOpenChange(false);
            return;
        }
        setErrors(result.errors || {});
    };

    const requestClose = () => {
        if (isDirty) {
            setShowDiscard(true);
            return;
        }

        onOpenChange(false);
    };

    const handleOpenChange = (nextOpen) => {
        if (!nextOpen && isDirty) {
            setShowDiscard(true);
            return;
        }

        onOpenChange(nextOpen);
    };

    return (
        <>
        <Dialog open={open} onOpenChange={handleOpenChange}>
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
                        <Input type="text" inputMode="decimal" value={score} onChange={(event) => setScore(event.target.value)} placeholder="Empty to clear the score" />
                    </FormField>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={requestClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Updating...' : 'Update'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
            <DiscardConfirmDialog
                open={showDiscard}
                onOpenChange={setShowDiscard}
                onConfirm={() => {
                    setShowDiscard(false);
                    onOpenChange(false);
                }}
            />
        </>
    );
};
