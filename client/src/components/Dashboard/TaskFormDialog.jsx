import { useEffect, useState } from 'react';
import { Info } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { FormField } from '@/components/shared/FormField';
import useSemesterStore from '@/store/useSemesterStore';
import { SEMESTERS } from '@/lib/constants';

export const TaskFormDialog = ({
    open,
    onOpenChange,
    mode = 'create',
    initialData,
    courseContents,
    onSemesterChange,
    onSubmit,
    isLoading,
}) => {
    const semesterLabel = useSemesterStore((state) => state.semesterLabel);
    const [semester, setSemester] = useState('');
    const [course, setCourse] = useState('');
    const [task, setTask] = useState('');
    const [description, setDescription] = useState('');
    const [deadline, setDeadline] = useState('');
    const [priority, setPriority] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (!open) {
            return;
        }

        if (mode === 'edit' && initialData) {
            setSemester(initialData.semester || '');
            setCourse(String(initialData.course_content_id || ''));
            setTask(initialData.task || '');
            setDescription(initialData.description || '');
            setDeadline(initialData.deadline || '');
            setPriority(Boolean(initialData.priority));
            if (initialData.semester) {
                onSemesterChange(initialData.semester);
            }
            return;
        }

        const defaultSemester = semesterLabel || 'Semester 1';
        setSemester(defaultSemester);
        setCourse('');
        setTask('');
        setDescription('');
        setDeadline('');
        setPriority(false);
        setErrors({});
        onSemesterChange(defaultSemester);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, mode, initialData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            course_content_id: course,
            task,
            description,
            deadline,
            priority,
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
                    <DialogTitle>{mode === 'create' ? 'Add New Task' : 'Edit Task'}</DialogTitle>
                    <DialogDescription>Enter the details of the task you want to do.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormField label="Semester" error={errors.semester}>
                        <Select
                            value={semester}
                            onValueChange={(value) => {
                                setSemester(value);
                                onSemesterChange(value);
                            }}
                        >
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

                    <FormField label="Course Content" error={errors.course_content}>
                        <Select value={course} onValueChange={setCourse}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select course" />
                            </SelectTrigger>
                            <SelectContent>
                                {courseContents.map((content) => (
                                    <SelectItem key={content.id} value={String(content.id)}>
                                        {content.course_content}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FormField>

                    <FormField label="Task" error={errors.task}>
                        <Input value={task} onChange={(e) => setTask(e.target.value)} placeholder="Enter task" />
                    </FormField>

                    <FormField label="Description" error={errors.description}>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Enter description"
                            rows={6}
                        />
                    </FormField>

                    <FormField label="Deadline" error={errors.deadline}>
                        <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
                    </FormField>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <label htmlFor="task-priority" className="cursor-pointer text-sm">
                                Priority
                            </label>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Info className="h-3 w-3" />
                                    </TooltipTrigger>
                                    <TooltipContent>This task will be notified every day.</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <Checkbox
                            id="task-priority"
                            checked={priority}
                            onCheckedChange={(checked) => setPriority(checked === true)}
                        />
                        {errors.priority ? <p className="text-sm text-red-500">{errors.priority}</p> : null}
                    </div>

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
