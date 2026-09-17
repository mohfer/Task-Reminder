import { useMemo, useState } from 'react';
import { CalendarX } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/shared/EmptyState';
import { WeeklyScheduleHeader } from '@/components/Schedule/WeeklyScheduleHeader';
import { ScheduleTimeColumn } from '@/components/Schedule/ScheduleTimeColumn';
import { ScheduleDayColumn } from '@/components/Schedule/ScheduleDayColumn';
import {
    generateTimeSlots,
    getCurrentWeekRange,
    getDateForDay,
    getScheduleLabels,
    GRID_END_MINUTES,
    GRID_START_MINUTES,
    groupByDay,
} from '@/lib/scheduleUtils';

const ROW_HEIGHT = 52;

export const WeeklySchedule = ({ courseContents = [], language = 'en', isLoading = false }) => {
    const [weekOffset, setWeekOffset] = useState(0);
    const labels = useMemo(() => getScheduleLabels(language), [language]);
    const days = labels.days;

    const weekRange = useMemo(() => getCurrentWeekRange(weekOffset, language), [weekOffset, language]);
    const slots = useMemo(() => generateTimeSlots(GRID_START_MINUTES, GRID_END_MINUTES), []);
    const groupedCourses = useMemo(() => groupByDay(courseContents, days), [courseContents, days]);
    const isEmpty = !isLoading && !courseContents.length;

    return (
        <Card>
            <CardContent className="p-4">
                <WeeklyScheduleHeader
                    weekLabel={weekRange.label}
                    onPrev={() => setWeekOffset((current) => current - 1)}
                    onNext={() => setWeekOffset((current) => current + 1)}
                    prevLabel={labels.prevWeekAriaLabel}
                    nextLabel={labels.nextWeekAriaLabel}
                />

                <div className="relative">
                    <div className="overflow-x-auto">
                        <div className="min-w-[980px] rounded-md border border-border bg-card">
                            <div className="flex">
                                <ScheduleTimeColumn slots={slots} rowHeight={ROW_HEIGHT} />

                                {days.map((day, index) => (
                                    <ScheduleDayColumn
                                        key={day}
                                        day={day}
                                        date={getDateForDay(weekRange.start, index)}
                                        courses={groupedCourses[day] ?? []}
                                        rowHeight={ROW_HEIGHT}
                                        slots={slots}
                                        language={language}
                                        timeRange={{
                                            start: GRID_START_MINUTES,
                                            end: GRID_END_MINUTES,
                                        }}
                                        isLoading={isLoading}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {isEmpty ? (
                        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-md bg-background/70 p-4 backdrop-blur-[2px]">
                            <div className="w-full max-w-sm rounded-xl border border-border bg-card shadow-lg">
                                <EmptyState
                                    icon={CalendarX}
                                    title="No courses yet"
                                    description="Add your courses to see your weekly schedule here."
                                    actionLabel="Add Courses"
                                    actionTo="/course-contents"
                                />
                            </div>
                        </div>
                    ) : null}
                </div>
            </CardContent>
        </Card>
    );
};
