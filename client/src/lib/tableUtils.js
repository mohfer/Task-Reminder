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
    if (
        normalized.includes('overdue') ||
        normalized.includes('today') ||
        normalized.includes('0 day') ||
        normalized.includes('1 day')
    ) {
        return 'bg-destructive text-destructive-foreground hover:bg-destructive/80';
    }
    if (/(2|3|4|5)\s*day/.test(normalized)) {
        return 'bg-warning text-warning-foreground hover:bg-warning/80';
    }
    return 'bg-secondary text-secondary-foreground hover:bg-secondary/80';
};
