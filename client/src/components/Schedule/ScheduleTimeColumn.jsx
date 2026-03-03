export const ScheduleTimeColumn = ({ slots, rowHeight }) => {
    return (
        <div className="w-14 shrink-0 border-r border-border bg-muted/30">
            <div className="h-12 border-b border-border" />
            {slots.slice(0, -1).map((slot) => (
                <div
                    key={slot}
                    className="border-b border-border px-1 py-1 text-center text-xs text-muted-foreground"
                    style={{ height: rowHeight }}
                >
                    {slot.slice(0, 2)}
                </div>
            ))}
        </div>
    );
};
