import { memo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const LoadingTable = memo(({ rows = 5, columns = 5 }) => {
    return (
        <tr>
            <td colSpan={columns} className="p-4">
                <div className="space-y-3">
                    {Array.from({ length: rows }).map((_, index) => (
                        <Skeleton key={index} className="h-6 w-full" />
                    ))}
                </div>
            </td>
        </tr>
    );
});

LoadingTable.displayName = 'LoadingTable';
