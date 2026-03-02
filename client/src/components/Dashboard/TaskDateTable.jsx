import { useMemo, useState } from 'react';
import { ArrowUpDown, Ellipsis } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const getSortValue = (task, key) => {
    switch (key) {
        case 'course_content':
            return task.course_content || '';
        case 'task':
            return task.task || '';
        case 'deadline':
            return task.deadline || '';
        case 'status':
            return Number(task.status || 0);
        case 'priority':
            return Number(task.priority || 0);
        default:
            return '';
    }
};

const compareValues = (a, b) => {
    if (typeof a === 'number' && typeof b === 'number') {
        return a - b;
    }

    const aDate = new Date(a);
    const bDate = new Date(b);
    if (!Number.isNaN(aDate.getTime()) && !Number.isNaN(bDate.getTime())) {
        return aDate.getTime() - bDate.getTime();
    }

    return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
};

const getDeadlineBadgeClass = (label, status) => {
    const normalized = String(label || '').toLowerCase();
    if (Number(status) === 1 || normalized.includes('completed')) {
        return 'bg-success text-success-foreground hover:bg-success/80';
    }
    if (
        normalized.includes('overdue') ||
        normalized.includes('today') ||
        normalized.includes('0 day') ||
        normalized.includes('1 day')
    ) {
        return 'bg-destructive text-destructive-foreground hover:bg-destructive/80';
    }
    if (/(2|3|4|5)\s*day/.test(normalized)) {
        return 'bg-warning text-warning-foreground hover:bg-warning/80';
    }
    return 'bg-secondary text-secondary-foreground hover:bg-secondary/80';
};

export const TaskDateTable = ({ tasks, onStatusChange, onEdit, onDelete, isMutating }) => {
    const [sortConfig, setSortConfig] = useState({ key: 'deadline', direction: 'asc' });

    const sortedTasks = useMemo(() => {
        const list = [...tasks];
        list.sort((left, right) => {
            const leftValue = getSortValue(left, sortConfig.key);
            const rightValue = getSortValue(right, sortConfig.key);
            const result = compareValues(leftValue, rightValue);
            return sortConfig.direction === 'asc' ? result : -result;
        });
        return list;
    }, [tasks, sortConfig]);

    const handleSort = (key) => {
        setSortConfig((current) => {
            if (current.key === key) {
                return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' };
            }
            return { key, direction: 'asc' };
        });
    };

    return (
        <Card className="my-4">
            <CardContent className="overflow-x-auto p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-center">No</TableHead>
                            <TableHead>
                                <Button variant="ghost" className="h-auto p-0 font-medium" onClick={() => handleSort('course_content')}>
                                    Course Content <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
                                </Button>
                            </TableHead>
                            <TableHead>
                                <Button variant="ghost" className="h-auto p-0 font-medium" onClick={() => handleSort('task')}>
                                    Task <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
                                </Button>
                            </TableHead>
                            <TableHead className="text-center">
                                <Button variant="ghost" className="h-auto p-0 font-medium" onClick={() => handleSort('deadline')}>
                                    Deadline <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
                                </Button>
                            </TableHead>
                            <TableHead className="text-center">
                                <Button variant="ghost" className="h-auto p-0 font-medium" onClick={() => handleSort('status')}>
                                    Status <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
                                </Button>
                            </TableHead>
                            <TableHead className="text-center">Options</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedTasks.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center">
                                    No tasks for this date
                                </TableCell>
                            </TableRow>
                        ) : (
                            sortedTasks.map((task, index) => (
                                <TableRow key={task.id}>
                                    <TableCell className="text-center font-bold">{index + 1}</TableCell>
                                    <TableCell>{task.course_content}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <span>{task.task}</span>
                                            {task.priority ? (
                                                <Badge className="bg-destructive text-destructive-foreground hover:bg-destructive/80">
                                                    Priority
                                                </Badge>
                                            ) : null}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge className={cn(getDeadlineBadgeClass(task.deadline_label, task.status))}>
                                            {task.deadline_label}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex justify-center">
                                            <Checkbox
                                                checked={task.status === 1}
                                                disabled={isMutating}
                                                onCheckedChange={(checked) => onStatusChange(task.id, checked === true)}
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <Ellipsis className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => onEdit(task)}>Edit</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => onDelete(task.id)}>Delete</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};
