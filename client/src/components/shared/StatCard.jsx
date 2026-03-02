import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export const StatCard = ({ title, value, subtitle, icon: Icon, iconColor, isLoading }) => {
    return (
        <Card className="flex-1">
            <CardContent className="flex items-center justify-between gap-4 p-4">
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{title}</p>
                    <p className="text-2xl font-bold text-foreground">
                        {isLoading ? <Skeleton className="h-8 w-16" /> : value}
                    </p>
                    <p className="text-xs text-muted-foreground">{subtitle}</p>
                </div>
                {Icon ? (
                    <div className="rounded-lg bg-muted p-2.5">
                        <Icon className={`h-8 w-8 ${iconColor}`} />
                    </div>
                ) : null}
            </CardContent>
        </Card>
    );
};
