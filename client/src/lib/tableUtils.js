export const compareValues = (a, b) => {
    if (typeof a === 'number' && typeof b === 'number') {
        return a - b;
    }

    const aDate = new Date(a);
    const bDate = new Date(b);
    if (!Number.isNaN(aDate.getTime()) && !Number.isNaN(bDate.getTime())) {
        return aDate.getTime() - bDate.getTime();
    }

    return String(a).localeCompare(String(b), undefined, {
        numeric: true,
        sensitivity: 'base',
    });
};

export const getDeadlineBadgeClass = (label, status) => {
    const normalized = String(label || '').toLowerCase();
    if (Number(status) === 1 || normalized.includes('completed')) {
        return 'bg-success text-success-foreground hover:bg-success/80';
    }
    if (normalized.includes('overdue') || normalized.includes('today')) {
        return 'bg-destructive text-destructive-foreground hover:bg-destructive/80';
    }
    const days = parseInt(normalized, 10);
    if (!Number.isNaN(days)) {
        if (days <= 1) {
            return 'bg-destructive text-destructive-foreground hover:bg-destructive/80';
        }
        if (days <= 5) {
            return 'bg-warning text-warning-foreground hover:bg-warning/80';
        }
    }
    return 'bg-secondary text-secondary-foreground hover:bg-secondary/80';
};
