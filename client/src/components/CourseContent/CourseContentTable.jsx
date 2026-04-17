import { useMemo, useState } from 'react';
import { ArrowUpDown, Ellipsis } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { LoadingTable } from '@/components/shared/LoadingTable';
import { Card, CardContent } from '@/components/ui/card';
import { compareValues } from '@/lib/tableUtils';

const DAY_ORDER = {
    monday: 1,
    senin: 1,
    tuesday: 2,
    selasa: 2,
    wednesday: 3,
    rabu: 3,
    thursday: 4,
    kamis: 4,
    friday: 5,
    jumat: 5,
    saturday: 6,
    sabtu: 6,
    sunday: 7,
    minggu: 7,
};

const getDayOrder = (day) => {
    if (!day) {
        return Number.MAX_SAFE_INTEGER;
    }

    return DAY_ORDER[String(day).trim().toLowerCase()] ?? Number.MAX_SAFE_INTEGER;
};

const parseTimeToMinutes = (time) => {
    if (!time || typeof time !== 'string') {
        return Number.MAX_SAFE_INTEGER;
    }

    const [hour, minute] = time.split(':');
    const parsedHour = Number(hour);
    const parsedMinute = Number(minute ?? 0);

    if (Number.isNaN(parsedHour) || Number.isNaN(parsedMinute)) {
        return Number.MAX_SAFE_INTEGER;
    }

    return parsedHour * 60 + parsedMinute;
};

const getSortValue = (content, key) => {
    switch (key) {
        case 'code':
            return content.code || '';
        case 'course_content':
            return content.course_content || '';
        case 'lecturer':
            return content.lecturer || '';
        case 'credits':
            return Number(content.credits || 0);
        case 'day':
            return getDayOrder(content.day);
        case 'time':
            return parseTimeToMinutes(content.hour_start);
        default:
            return '';
    }
};

export const CourseContentTable = ({ rows, isLoading, onEdit, onDelete }) => {
    const [sortConfig, setSortConfig] = useState({ key: 'day', direction: 'asc' });

    const sortedRows = useMemo(() => {
        if (!sortConfig.key) {
            return rows;
        }

        const list = [...rows];
        list.sort((left, right) => {
            const leftValue = getSortValue(left, sortConfig.key);
            const rightValue = getSortValue(right, sortConfig.key);

            let result = compareValues(leftValue, rightValue);
            if (result === 0 && sortConfig.key === 'day') {
                result = compareValues(parseTimeToMinutes(left.hour_start), parseTimeToMinutes(right.hour_start));
            }

            return sortConfig.direction === 'asc' ? result : -result;
        });
        return list;
    }, [rows, sortConfig]);

    const handleSort = (key) => {
        setSortConfig((current) => {
            if (current.key === key) {
                if (current.direction === 'asc') {
                    return { key, direction: 'desc' };
                }

                if (key === 'day') {
                    return { key, direction: 'asc' };
                }

                return { key: null, direction: 'asc' };
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
                            <TableHead className="text-center">
                                <Button variant="ghost" className="h-auto p-0 font-medium" onClick={() => handleSort('code')}>
                                    Code <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
                                </Button>
                            </TableHead>
                            <TableHead>
                                <Button variant="ghost" className="h-auto p-0 font-medium" onClick={() => handleSort('course_content')}>
                                    Course Content <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
                                </Button>
                            </TableHead>
                            <TableHead>
                                <Button variant="ghost" className="h-auto p-0 font-medium" onClick={() => handleSort('lecturer')}>
                                    Lecturer <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
                                </Button>
                            </TableHead>
                            <TableHead className="text-center">
                                <Button variant="ghost" className="h-auto p-0 font-medium" onClick={() => handleSort('credits')}>
                                    Credits <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
                                </Button>
                            </TableHead>
                            <TableHead className="text-center">
                                <Button variant="ghost" className="h-auto p-0 font-medium" onClick={() => handleSort('day')}>
                                    Day <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
                                </Button>
                            </TableHead>
                            <TableHead className="text-center">
                                <Button variant="ghost" className="h-auto p-0 font-medium" onClick={() => handleSort('time')}>
                                    Time <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
                                </Button>
                            </TableHead>
                            <TableHead className="text-center">Options</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? <LoadingTable rows={5} columns={8} /> : null}

                        {!isLoading && rows.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center">
                                    No course contents found
                                </TableCell>
                            </TableRow>
                        ) : null}

                        {!isLoading
                            ? sortedRows.map((content, index) => (
                                <TableRow key={content.id}>
                                    <TableCell className="text-center font-bold">{index + 1}</TableCell>
                                    <TableCell className="text-center">{content.code}</TableCell>
                                    <TableCell>{content.course_content}</TableCell>
                                    <TableCell>{content.lecturer}</TableCell>
                                    <TableCell className="text-center">{content.credits}</TableCell>
                                    <TableCell className="text-center">{content.day}</TableCell>
                                    <TableCell className="text-center">
                                        {content.hour_start} - {content.hour_end}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <Ellipsis className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => onEdit(content)}>Edit</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => onDelete(content.id)}>Delete</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                            : null}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};
