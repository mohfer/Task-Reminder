import { memo } from 'react';
import { Badge } from '@/components/ui/badge';

export const IpsSummary = memo(({ ips, ipk }) => {
    return (
        <div className="mb-4 flex flex-wrap justify-start gap-3 sm:justify-center">
            <Badge className="bg-primary px-4 py-2 text-sm text-primary-foreground">Total IPS: {Number(ips).toFixed(2)}</Badge>
            <Badge className="bg-success px-4 py-2 text-sm text-success-foreground">Total IPK: {Number(ipk).toFixed(2)}</Badge>
        </div>
    );
});

IpsSummary.displayName = 'IpsSummary';
