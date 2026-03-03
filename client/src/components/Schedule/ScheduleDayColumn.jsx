import { format } from 'date-fns';
import { ScheduleCourseBlock } from '@/components/Schedule/ScheduleCourseBlock';
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
}) => {
    const totalHeight = (slots.length - 1) * rowHeight;
    const dateLocale = getDateLocale(language);

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
        <div className="min-w-[150px] flex-1 border-r border-border last:border-r-0">
            <div className="flex h-12 flex-col justify-center border-b border-border px-2">
                <p className="truncate text-center text-xs font-semibold text-foreground">{day}</p>
                <p className="truncate text-center text-[11px] text-muted-foreground">
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

                {positionedCourses.map((course) => (
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
