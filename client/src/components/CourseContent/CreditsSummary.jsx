import { memo } from 'react';
import { Badge } from '@/components/ui/badge';

export const CreditsSummary = memo(({ totalCredits }) => {
    return (
        <div className="mb-4 flex flex-wrap justify-center gap-3">
            <Badge className="bg-primary px-4 py-2 text-sm text-primary-foreground">
                Total Credits: {totalCredits}
            </Badge>
        </div>
    );
});

CreditsSummary.displayName = 'CreditsSummary';
