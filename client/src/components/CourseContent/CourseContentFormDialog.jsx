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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { FormField } from '@/components/shared/FormField';
import { SEMESTERS } from '@/lib/constants';
import { getFieldError } from '@/lib/formUtils';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const CourseContentFormDialog = ({
    open,
    onOpenChange,
    mode,
    initialData,
    isLoading,
    onSubmit,
}) => {
    const [semester, setSemester] = useState('');
    const [code, setCode] = useState('');
    const [courseContent, setCourseContent] = useState('');
    const [credits, setCredits] = useState('');
    const [lecturer, setLecturer] = useState('');
    const [day, setDay] = useState('');
    const [hourStart, setHourStart] = useState('');
    const [hourEnd, setHourEnd] = useState('');
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (!open) {
            return;
        }

        if (mode === 'edit' && initialData) {
            setSemester(initialData.semester || '');
            setCode(initialData.code || '');
            setCourseContent(initialData.course_content || '');
            setCredits(String(initialData.credits || ''));
            setLecturer(initialData.lecturer || '');
            setDay(initialData.day || '');
            setHourStart(initialData.hour_start || '');
            setHourEnd(initialData.hour_end || '');
            setErrors({});
            return;
        }

        setSemester('');
        setCode('');
        setCourseContent('');
        setCredits('');
        setLecturer('');
        setDay('');
        setHourStart('');
        setHourEnd('');
        setErrors({});
    }, [open, mode, initialData]);

    const handleSubmit = async (event) => {
        event.preventDefault();

        const payload = {
            semester,
            code,
            course_content: courseContent,
            credits: Number(credits),
            lecturer,
            day,
            hour_start: hourStart,
            hour_end: hourEnd,
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
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>{mode === 'create' ? 'Add New Course Content' : 'Update Course Content'}</DialogTitle>
                    <DialogDescription>
                        {mode === 'create'
                            ? 'Enter the details of the courses attended.'
                            : 'Update the details of the selected course content.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormField label="Semester" error={getFieldError(errors, 'semester')}>
                        <Select value={semester} onValueChange={setSemester}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select semester" />
                            </SelectTrigger>
                            <SelectContent>
                                {SEMESTERS.map((item) => (
                                    <SelectItem key={item} value={item}>
                                        {item}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FormField>

                    <FormField label="Code" error={getFieldError(errors, 'code')}>
                        <Input value={code} onChange={(event) => setCode(event.target.value)} placeholder="Enter code" />
                    </FormField>

                    <FormField label="Course Content" error={getFieldError(errors, 'course_content')}>
                        <Input
                            value={courseContent}
                            onChange={(event) => setCourseContent(event.target.value)}
                            placeholder="Enter course content"
                        />
                    </FormField>

                    <FormField label="Credits" error={getFieldError(errors, 'credits')}>
                        <Input
                            type="number"
                            min={1}
                            value={credits}
                            onChange={(event) => setCredits(event.target.value)}
                            placeholder="Enter credits"
                        />
                    </FormField>

                    <FormField label="Lecturer" error={getFieldError(errors, 'lecturer')}>
                        <Input
                            value={lecturer}
                            onChange={(event) => setLecturer(event.target.value)}
                            placeholder="Enter lecturer"
                        />
                    </FormField>

                    <FormField label="Day" error={getFieldError(errors, 'day')}>
                        <Select value={day} onValueChange={setDay}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select day" />
                            </SelectTrigger>
                            <SelectContent>
                                {DAYS.map((item) => (
                                    <SelectItem key={item} value={item}>
                                        {item}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FormField>

                    <FormField label="Hour Start" error={getFieldError(errors, 'hour_start')}>
                        <Input type="time" value={hourStart} onChange={(event) => setHourStart(event.target.value)} />
                    </FormField>

                    <FormField label="Hour End" error={getFieldError(errors, 'hour_end')}>
                        <Input type="time" value={hourEnd} onChange={(event) => setHourEnd(event.target.value)} />
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
