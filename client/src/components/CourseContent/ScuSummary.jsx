import { memo } from 'react';
import { Badge } from '@/components/ui/badge';

export const ScuSummary = memo(({ totalScu }) => {
    return (
        <div className="mb-4 flex flex-wrap justify-start gap-3 sm:justify-center">
            <Badge className="bg-primary px-4 py-2 text-sm text-primary-foreground">
                Total SCU: {totalScu}
            </Badge>
        </div>
    );
});

ScuSummary.displayName = 'ScuSummary';
