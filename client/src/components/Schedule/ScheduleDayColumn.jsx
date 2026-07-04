import { format, isToday } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { ScheduleCourseBlock } from '@/components/Schedule/ScheduleCourseBlock';
import { cn } from '@/lib/utils';
import {
    calculateHeight,
    calculateTopPosition,
    detectOverlaps,
    formatMinutesToTime,
    getDateLocale,
    parseTimeToMinutes,
} from '@/lib/scheduleUtils';

export const ScheduleDayColumn = ({
    day,
    date,
    courses,
    rowHeight,
    timeRange,
    slots,
    language,
    isLoading = false,
}) => {
    const totalHeight = (slots.length - 1) * rowHeight;
    const dateLocale = getDateLocale(language);
    const isTodayColumn = isToday(date);

    const positionedCourses = detectOverlaps(
        courses
            .map((course) => {
                const startMinutes = parseTimeToMinutes(course.hour_start);
                const endMinutes = parseTimeToMinutes(course.hour_end);

                if (startMinutes === null || endMinutes === null) {
                    return null;
                }

                const safeEnd = endMinutes > startMinutes ? endMinutes : startMinutes + 30;
                const top = calculateTopPosition(startMinutes, timeRange.start, timeRange.end);
                const height = calculateHeight(startMinutes, safeEnd, timeRange.start, timeRange.end);

                if (height <= 0) {
                    return null;
                }

                return {
                    ...course,
                    startMinutes,
                    endMinutes: safeEnd,
                    hour_start: course.hour_start ?? formatMinutesToTime(startMinutes),
                    hour_end: course.hour_end ?? formatMinutesToTime(safeEnd),
                    style: {
                        top: `${top}%`,
                        height: `${height}%`,
                    },
                };
            })
            .filter(Boolean)
    );

    return (
        <div className={cn(
            'min-w-[150px] flex-1 border-r border-border last:border-r-0',
            isTodayColumn && 'bg-primary/5'
        )}>
            <div className={cn(
                'flex h-12 flex-col justify-center border-b border-border px-2',
                isTodayColumn && 'bg-primary/10'
            )}>
                <p className={cn(
                    'truncate text-center text-xs font-semibold',
                    isTodayColumn ? 'text-primary' : 'text-foreground'
                )}>{day}</p>
                <p className={cn(
                    'truncate text-center text-[11px]',
                    isTodayColumn ? 'text-primary/70' : 'text-muted-foreground'
                )}>
                    {format(date, 'd MMM yyyy', { locale: dateLocale })}
                </p>
            </div>

            <div className="relative" style={{ height: totalHeight }}>
                {slots.slice(0, -1).map((slot, index) => (
                    <div
                        key={`${day}-${slot}`}
                        className="absolute left-0 right-0 border-b border-border/70"
                        style={{ top: index * rowHeight }}
                    />
                ))}

                {isLoading ? (
                    <>
                        <div className="absolute left-1 right-1 rounded-md border border-primary/10 bg-primary/5 p-2" style={{ top: '10%', height: '12%' }}>
                            <Skeleton className="mb-1 h-3 w-20" />
                            <Skeleton className="h-3 w-32" />
                        </div>
                        <div className="absolute left-1 right-1 rounded-md border border-primary/10 bg-primary/5 p-2" style={{ top: '35%', height: '12%' }}>
                            <Skeleton className="mb-1 h-3 w-20" />
                            <Skeleton className="h-3 w-28" />
                        </div>
                        <div className="absolute left-1 right-1 rounded-md border border-primary/10 bg-primary/5 p-2" style={{ top: '60%', height: '12%' }}>
                            <Skeleton className="mb-1 h-3 w-20" />
                            <Skeleton className="h-3 w-36" />
                        </div>
                    </>
                ) : positionedCourses.map((course) => (
                    <ScheduleCourseBlock
                        key={course.id}
                        course={course}
                        style={course.style}
                        overlapIndex={course.overlapIndex}
                        overlapTotal={course.overlapTotal}
                    />
                ))}
            </div>
        </div>
    );
};
