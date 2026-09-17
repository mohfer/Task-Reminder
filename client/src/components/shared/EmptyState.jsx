import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const EmptyState = ({ icon: Icon, title, description, actionLabel, actionTo, onAction }) => {
    return (
        <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
            {Icon ? (
                <div className="mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <Icon className="h-6 w-6 text-muted-foreground" />
                </div>
            ) : null}
            <p className="text-base font-semibold">{title}</p>
            {description ? (
                <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
            ) : null}
            {actionLabel && (actionTo || onAction) ? (
                <div className="mt-2">
                    {actionTo ? (
                        <Button asChild>
                            <Link to={actionTo}>{actionLabel}</Link>
                        </Button>
                    ) : (
                        <Button type="button" onClick={onAction}>
                            {actionLabel}
                        </Button>
                    )}
                </div>
            ) : null}
        </div>
    );
};
