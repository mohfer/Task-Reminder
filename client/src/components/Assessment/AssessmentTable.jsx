import { useMemo, useState } from 'react';
import { ArrowUpDown, Ellipsis } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { LoadingTable } from '@/components/shared/LoadingTable';
import { Card, CardContent } from '@/components/ui/card';

const getSortValue = (row, key) => {
    switch (key) {
        case 'course_content':
            return row.course_content || '';
        case 'scu':
            return Number(row.scu || 0);
        case 'score':
            return Number(row.score || 0);
        case 'grade':
            return row.grade || '';
        case 'quality_number':
            return Number(row.quality_number || 0);
        default:
            return '';
    }
};

const compareValues = (a, b) => {
    if (typeof a === 'number' && typeof b === 'number') {
        return a - b;
    }
    return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
};

export const AssessmentTable = ({ rows, isLoading, onEdit }) => {
    const [sortConfig, setSortConfig] = useState({ key: 'course_content', direction: 'asc' });

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
                            <TableHead className="text-center">
                                <Button variant="ghost" className="h-auto p-0 font-medium" onClick={() => handleSort('scu')}>
                                    SCU <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
                                </Button>
                            </TableHead>
                            <TableHead className="text-center">
                                <Button variant="ghost" className="h-auto p-0 font-medium" onClick={() => handleSort('score')}>
                                    Score <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
                                </Button>
                            </TableHead>
                            <TableHead className="text-center">
                                <Button variant="ghost" className="h-auto p-0 font-medium" onClick={() => handleSort('grade')}>
                                    Grade <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
                                </Button>
                            </TableHead>
                            <TableHead className="text-center">
                                <Button variant="ghost" className="h-auto p-0 font-medium" onClick={() => handleSort('quality_number')}>
                                    Quality Number <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
                                </Button>
                            </TableHead>
                            <TableHead className="text-center">Options</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? <LoadingTable rows={5} columns={7} /> : null}

                        {!isLoading && rows.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center">
                                    No course contents found
                                </TableCell>
                            </TableRow>
                        ) : null}

                        {!isLoading
                            ? sortedRows.map((content, index) => (
                                <TableRow key={content.id}>
                                    <TableCell className="text-center font-bold">{index + 1}</TableCell>
                                    <TableCell>{content.course_content}</TableCell>
                                    <TableCell className="text-center">{content.scu}</TableCell>
                                    <TableCell className="text-center">{content.score}</TableCell>
                                    <TableCell className="text-center">{content.grade}</TableCell>
                                    <TableCell className="text-center">{content.quality_number}</TableCell>
                                    <TableCell className="text-center">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <Ellipsis className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => onEdit(content)}>Edit</DropdownMenuItem>
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
