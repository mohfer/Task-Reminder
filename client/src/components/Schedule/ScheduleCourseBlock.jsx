import { cn } from '@/lib/utils';

export const ScheduleCourseBlock = ({ course, style, overlapIndex, overlapTotal }) => {
    const width = 100 / Math.max(overlapTotal, 1);
    const left = overlapIndex * width;

    return (
        <div
            className={cn(
                'absolute overflow-hidden rounded-md border border-primary/30 bg-primary/20 p-2 text-xs text-foreground shadow-sm',
                'transition-colors hover:bg-primary/25'
            )}
            style={{
                ...style,
                left: `calc(${left}% + 2px)`,
                width: `calc(${width}% - 4px)`,
            }}
            title={`${course.course_content} (${course.hour_start} - ${course.hour_end})`}
        >
            <p className="truncate text-[11px] font-semibold text-primary">
                {course.hour_start} - {course.hour_end}
            </p>
            <p className="mt-1 line-clamp-2 text-[11px] font-medium">{course.course_content}</p>
        </div>
    );
};
