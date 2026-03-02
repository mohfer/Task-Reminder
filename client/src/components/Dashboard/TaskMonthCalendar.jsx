import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
    addMonths,
    eachDayOfInterval,
    endOfMonth,
    endOfWeek,
    format,
    isSameDay,
    isSameMonth,
    isToday,
    startOfDay,
    startOfMonth,
    startOfWeek,
    subMonths,
} from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

export const TaskMonthCalendar = ({ tasks = [], selectedDate, onDateSelect, onMonthChange }) => {
    const [currentMonth, setCurrentMonth] = useState(() => new Date());
    const todayStart = startOfDay(new Date());

    const tasksByDate = useMemo(() => {
        const map = {};
        for (const task of tasks) {
            const dateKey = format(new Date(task.deadline), 'yyyy-MM-dd');
            if (!map[dateKey]) {
                map[dateKey] = [];
            }
            map[dateKey].push(task);
        }
        return map;
    }, [tasks]);

    const calendarDays = useMemo(() => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(currentMonth);
        const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
        const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
        return eachDayOfInterval({ start: calStart, end: calEnd });
    }, [currentMonth]);

    const handlePrevMonth = () => {
        const prev = subMonths(currentMonth, 1);
        setCurrentMonth(prev);
        onMonthChange?.(prev.getMonth(), prev.getFullYear());
    };

    const handleNextMonth = () => {
        const next = addMonths(currentMonth, 1);
        setCurrentMonth(next);
        onMonthChange?.(next.getMonth(), next.getFullYear());
    };

    const handleToday = () => {
        const today = new Date();
        setCurrentMonth(today);
        onDateSelect?.(today);
        onMonthChange?.(today.getMonth(), today.getFullYear());
    };

    const weeks = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
        weeks.push(calendarDays.slice(i, i + 7));
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={handlePrevMonth} className="h-8 w-8">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <h3 className="text-lg font-semibold">{format(currentMonth, 'MMM yyyy')}</h3>
                    <Button variant="outline" size="icon" onClick={handleNextMonth} className="h-8 w-8">
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
                <Button variant="outline" size="sm" onClick={handleToday}>
                    Today
                </Button>
            </CardHeader>

            <CardContent className="p-2 sm:p-4">
                <div className="grid grid-cols-7 gap-px">
                    {WEEKDAYS.map((day) => (
                        <div key={day} className="py-2 text-center text-sm font-medium text-muted-foreground">
                            {day}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-px rounded-lg border bg-border">
                    {weeks.map((week, weekIndex) =>
                        week.map((day, dayIndex) => {
                            const dateKey = format(day, 'yyyy-MM-dd');
                            const dayTasks = tasksByDate[dateKey] || [];
                            const isCurrentMonth = isSameMonth(day, currentMonth);
                            const isSelected = selectedDate && isSameDay(day, selectedDate);
                            const isTodayDate = isToday(day);
                            const isSunday = day.getDay() === 0;
                            const isSaturday = day.getDay() === 6;

                            return (
                                <div
                                    key={dateKey}
                                    onClick={() => onDateSelect?.(day)}
                                    className={cn(
                                        'min-h-[80px] cursor-pointer bg-card p-1 transition-colors hover:bg-accent/50 sm:min-h-[100px] sm:p-2',
                                        !isCurrentMonth && 'bg-muted/30 text-muted-foreground',
                                        isSelected && 'ring-2 ring-inset ring-primary',
                                        weekIndex === 0 && dayIndex === 0 && 'rounded-tl-lg',
                                        weekIndex === 0 && dayIndex === 6 && 'rounded-tr-lg',
                                        weekIndex === weeks.length - 1 && dayIndex === 0 && 'rounded-bl-lg',
                                        weekIndex === weeks.length - 1 && dayIndex === 6 && 'rounded-br-lg'
                                    )}
                                >
                                    <div className="flex items-start justify-between">
                                        <span
                                            className={cn(
                                                'inline-flex h-6 w-6 items-center justify-center rounded-full text-sm',
                                                isTodayDate && 'bg-primary font-bold text-primary-foreground',
                                                !isTodayDate && isSunday && 'text-destructive',
                                                !isTodayDate && isSaturday && 'text-success',
                                                !isCurrentMonth && 'opacity-50'
                                            )}
                                        >
                                            {format(day, 'd')}
                                        </span>
                                    </div>

                                    <div className="mt-1 flex flex-col gap-0.5 overflow-hidden">
                                        {dayTasks.slice(0, 3).map((task) => {
                                            const deadlineDate = new Date(task.deadline);
                                            const isOverdue =
                                                Number(task.status) !== 1 &&
                                                !Number.isNaN(deadlineDate.getTime()) &&
                                                startOfDay(deadlineDate).getTime() < todayStart.getTime();

                                            return (
                                                <Badge
                                                    key={task.id}
                                                    variant={task.status === 1 ? 'default' : 'secondary'}
                                                    className={cn(
                                                        'cursor-pointer truncate px-1 py-0 text-[10px] font-normal leading-4',
                                                        task.priority
                                                            ? 'border border-destructive/70 bg-destructive text-destructive-foreground hover:bg-destructive/80'
                                                            : isOverdue
                                                                ? 'bg-warning text-warning-foreground hover:bg-warning/80'
                                                                : task.status === 1
                                                                    ? 'bg-success text-success-foreground hover:bg-success/80'
                                                                    : 'bg-primary text-primary-foreground hover:bg-primary/80'
                                                    )}
                                                >
                                                    {task.priority ? '⚑ ' : ''}
                                                    {task.code || task.task}
                                                </Badge>
                                            );
                                        })}
                                        {dayTasks.length > 3 ? (
                                            <span className="px-1 text-[10px] text-muted-foreground">
                                                +{dayTasks.length - 3} more
                                            </span>
                                        ) : null}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
