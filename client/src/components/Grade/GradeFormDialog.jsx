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
import { getFieldError, validateRequired } from '@/lib/formUtils';

export const GradeFormDialog = ({
    open,
    onOpenChange,
    mode,
    initialData,
    isLoading,
    onSubmit,
}) => {
    const [grade, setGrade] = useState('');
    const [gradePoints, setGradePoints] = useState('');
    const [minimalScore, setMinimalScore] = useState('');
    const [maximalScore, setMaximalScore] = useState('');
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (!open) {
            return;
        }

        if (mode === 'edit' && initialData) {
            setGrade(initialData.grade || '');
            setGradePoints(String(initialData.grade_point || ''));
            setMinimalScore(String(initialData.minimal_score || ''));
            setMaximalScore(String(initialData.maximal_score || ''));
            setErrors({});
            return;
        }

        setGrade('');
        setGradePoints('');
        setMinimalScore('');
        setMaximalScore('');
        setErrors({});
    }, [open, mode, initialData]);

    const handleSubmit = async (event) => {
        event.preventDefault();

        const clientErrors = validateRequired(
            { grade, grade_point: gradePoints, minimal_score: minimalScore, maximal_score: maximalScore },
            [
                { name: 'grade', label: 'Grade' },
                { name: 'grade_point', label: 'Grade Points' },
                { name: 'minimal_score', label: 'Minimal Score' },
                { name: 'maximal_score', label: 'Maximal Score' },
            ]
        );
        if (Object.keys(clientErrors).length > 0) {
            setErrors(clientErrors);
            return;
        }

        const payload = {
            grade,
            grade_point: Number(gradePoints),
            minimal_score: Number(minimalScore),
            maximal_score: Number(maximalScore),
        };

        const result = await onSubmit(payload, initialData?.id);
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
                    <DialogTitle>{mode === 'create' ? 'Add New Grade' : 'Edit Grade'}</DialogTitle>
                    <DialogDescription>Enter the details of the grade.</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormField label="Grade" error={getFieldError(errors, 'grade')}>
                        <Input value={grade} onChange={(event) => setGrade(event.target.value)} placeholder="Enter grade" required />
                    </FormField>

                    <FormField label="Grade Points" error={getFieldError(errors, 'grade_point')}>
                        <Input
                            type="number"
                            min={0}
                            value={gradePoints}
                            onChange={(event) => setGradePoints(event.target.value)}
                            placeholder="Enter grade points"
                            required
                        />
                    </FormField>

                    <FormField label="Minimal Score" error={getFieldError(errors, 'minimal_score')}>
                        <Input
                            type="number"
                            min={0}
                            value={minimalScore}
                            onChange={(event) => setMinimalScore(event.target.value)}
                            placeholder="Enter minimal score"
                            required
                        />
                    </FormField>

                    <FormField label="Maximal Score" error={getFieldError(errors, 'maximal_score')}>
                        <Input
                            type="number"
                            min={0}
                            value={maximalScore}
                            onChange={(event) => setMaximalScore(event.target.value)}
                            placeholder="Enter maximal score"
                            required
                        />
                    </FormField>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? (mode === 'create' ? 'Adding...' : 'Updating...') : mode === 'create' ? 'Add' : 'Update'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
