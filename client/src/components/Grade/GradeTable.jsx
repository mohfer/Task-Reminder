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
import { compareValues } from '@/lib/tableUtils';

const getSortValue = (grade, key) => {
    switch (key) {
        case 'grade':
            return grade.grade || '';
        case 'grade_point':
            return Number(grade.grade_point || 0);
        case 'minimal_score':
            return Number(grade.minimal_score || 0);
        case 'maximal_score':
            return Number(grade.maximal_score || 0);
        default:
            return '';
    }
};

export const GradeTable = ({ rows, isLoading, onEdit, onDelete }) => {
    const [sortConfig, setSortConfig] = useState({ key: 'grade', direction: 'asc' });

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
                            <TableHead className="text-center">
                                <Button variant="ghost" className="h-auto p-0 font-medium" onClick={() => handleSort('grade')}>
                                    Grade <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
                                </Button>
                            </TableHead>
                            <TableHead className="text-center">
                                <Button variant="ghost" className="h-auto p-0 font-medium" onClick={() => handleSort('grade_point')}>
                                    Grade Points <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
                                </Button>
                            </TableHead>
                            <TableHead className="text-center">
                                <Button variant="ghost" className="h-auto p-0 font-medium" onClick={() => handleSort('minimal_score')}>
                                    Score <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
                                </Button>
                            </TableHead>
                            <TableHead className="text-center">Options</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? <LoadingTable rows={5} columns={5} /> : null}

                        {!isLoading && rows.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center">
                                    No grade found
                                </TableCell>
                            </TableRow>
                        ) : null}

                        {!isLoading
                            ? sortedRows.map((grade, index) => (
                                <TableRow key={grade.id}>
                                    <TableCell className="text-center font-bold">{index + 1}</TableCell>
                                    <TableCell className="text-center">{grade.grade}</TableCell>
                                    <TableCell className="text-center">{grade.grade_point}</TableCell>
                                    <TableCell className="text-center">
                                        {grade.minimal_score} - {grade.maximal_score}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <Ellipsis className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => onEdit(grade)}>Edit</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => onDelete(grade.id)}>Delete</DropdownMenuItem>
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
