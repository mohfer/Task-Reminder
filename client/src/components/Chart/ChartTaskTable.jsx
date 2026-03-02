import { useMemo, useState } from 'react';
import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { compareValues, getDeadlineBadgeClass } from '@/lib/tableUtils';

const getSortValue = (item, key) => {
    switch (key) {
        case 'course_content':
            return item.course_content || '';
        case 'task':
            return item.task || '';
        case 'status':
            return Number(item.status || 0);
        case 'created_at':
            return item.created_at || '';
        case 'updated_at':
            return item.updated_at || '';
        case 'deadline':
            return item.deadline || '';
        case 'deadline_label':
            return item.deadline_label || '';
        default:
            return '';
    }
};

export const ChartTaskTable = ({ rows }) => {
    const [sortConfig, setSortConfig] = useState({ key: 'deadline', direction: 'asc' });

    const sortedRows = useMemo(() => {
        const list = [...rows];
        list.sort((left, right) => {
            const leftValue = getSortValue(left, sortConfig.key);
            const rightValue = getSortValue(right, sortConfig.key);
            const result = compareValues(leftValue, rightValue);
            return sortConfig.direction === 'asc' ? result : -result;
        });
        return list;
    }, [rows, sortConfig]);

    const handleSort = (key) => {
        setSortConfig((current) => {
            if (current.key === key) {
                return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' };
            }
            return { key, direction: 'asc' };
        });
    };

    return (
        <Card>
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
                                <Button variant="ghost" className="h-auto p-0 font-medium" onClick={() => handleSort('status')}>
                                    Status <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
                                </Button>
                            </TableHead>
                            <TableHead className="text-center">
                                <Button variant="ghost" className="h-auto p-0 font-medium" onClick={() => handleSort('created_at')}>
                                    Created At <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
                                </Button>
                            </TableHead>
                            <TableHead className="text-center">
                                <Button variant="ghost" className="h-auto p-0 font-medium" onClick={() => handleSort('updated_at')}>
                                    Updated At <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
                                </Button>
                            </TableHead>
                            <TableHead className="text-center">
                                <Button variant="ghost" className="h-auto p-0 font-medium" onClick={() => handleSort('deadline')}>
                                    Deadline <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
                                </Button>
                            </TableHead>
                            <TableHead className="text-center">
                                <Button variant="ghost" className="h-auto p-0 font-medium" onClick={() => handleSort('deadline_label')}>
                                    Deadline Label <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
                                </Button>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedRows.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center">
                                    No task data is available.
                                </TableCell>
                            </TableRow>
                        ) : (
                            sortedRows.map((item, index) => (
                                <TableRow key={item.id}>
                                    <TableCell className="text-center font-bold">{index + 1}</TableCell>
                                    <TableCell>{item.course_content}</TableCell>
                                    <TableCell>{item.task}</TableCell>
                                    <TableCell className="text-center">
                                        <Badge
                                            className={cn(
                                                item.status === 1
                                                    ? 'bg-success text-success-foreground hover:bg-success/80'
                                                    : 'bg-warning text-warning-foreground hover:bg-warning/80'
                                            )}
                                        >
                                            {item.status === 1 ? 'Completed' : 'Uncompleted'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">{item.created_at}</TableCell>
                                    <TableCell className="text-center">{item.updated_at}</TableCell>
                                    <TableCell className="text-center">{item.deadline}</TableCell>
                                    <TableCell className="text-center">
                                        <Badge className={cn(getDeadlineBadgeClass(item.deadline_label, item.status))}>
                                            {item.deadline_label}
                                        </Badge>
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
