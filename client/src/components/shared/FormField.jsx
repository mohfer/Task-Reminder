import { Label } from '@/components/ui/label';

export const FormField = ({ label, error, children, className = '' }) => {
    return (
        <div className={`space-y-2 ${className}`}>
            {label ? <Label>{label}</Label> : null}
            {children}
            {error ? <p className="text-sm text-red-500">{error}</p> : null}
        </div>
    );
};
