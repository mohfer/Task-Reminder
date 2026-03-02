import { Badge } from '@/components/ui/badge';

export const IpsSummary = ({ ips, ipk }) => {
    return (
        <div className="mb-4 flex flex-wrap justify-start gap-3 sm:justify-center">
            <Badge className="px-4 py-2 text-sm bg-primary text-primary-foreground">Total IPS: {ips}</Badge>
            <Badge className="px-4 py-2 text-sm bg-success text-success-foreground">Total IPK: {ipk}</Badge>
        </div>
    );
};
