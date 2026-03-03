import { addDays, addWeeks, endOfWeek, format, startOfWeek } from 'date-fns';
import { enUS, id as idLocale } from 'date-fns/locale';

export const SCHEDULE_LABELS = {
    en: {
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        prevWeekAriaLabel: 'Previous week',
        nextWeekAriaLabel: 'Next week',
        emptyState: 'No schedule found for this semester.',
    },
    id: {
        days: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'],
        prevWeekAriaLabel: 'Minggu sebelumnya',
        nextWeekAriaLabel: 'Minggu berikutnya',
        emptyState: 'Jadwal belum tersedia untuk semester ini.',
    },
};

const DAY_ALIASES = {
    monday: 0,
    senin: 0,
    tuesday: 1,
    selasa: 1,
    wednesday: 2,
    rabu: 2,
    thursday: 3,
    kamis: 3,
    friday: 4,
    jumat: 4,
    saturday: 5,
    sabtu: 5,
    sunday: 6,
    minggu: 6,
};

export const GRID_START_MINUTES = 7 * 60;
export const GRID_END_MINUTES = 21 * 60;
export const GRID_STEP_MINUTES = 60;

const pad2 = (value) => String(value).padStart(2, '0');

export const getScheduleLanguage = (language) => {
    return language === 'id' ? 'id' : 'en';
};

export const getScheduleLabels = (language = 'en') => {
    return SCHEDULE_LABELS[getScheduleLanguage(language)];
};

export const getDateLocale = (language = 'en') => {
    return getScheduleLanguage(language) === 'id' ? idLocale : enUS;
};

export const parseTimeToMinutes = (timeStr) => {
    if (!timeStr || typeof timeStr !== 'string') {
        return null;
    }

    const [hour, minute] = timeStr.split(':');
    const parsedHour = Number(hour);
    const parsedMinute = Number(minute ?? 0);

    if (Number.isNaN(parsedHour) || Number.isNaN(parsedMinute)) {
        return null;
    }

    return parsedHour * 60 + parsedMinute;
};

export const formatMinutesToTime = (minutes) => {
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;
    return `${pad2(hour)}:${pad2(minute)}`;
};

export const generateTimeSlots = (
    startMinutes = GRID_START_MINUTES,
    endMinutes = GRID_END_MINUTES,
    stepMinutes = GRID_STEP_MINUTES
) => {
    const slots = [];
    for (let minute = startMinutes; minute <= endMinutes; minute += stepMinutes) {
        slots.push(formatMinutesToTime(minute));
    }
    return slots;
};

export const getDayIndex = (day) => {
    if (!day) {
        return null;
    }

    const normalized = String(day).trim().toLowerCase();
    return DAY_ALIASES[normalized] ?? null;
};

export const groupByDay = (courseContents, days) => {
    const grouped = days.reduce((accumulator, day) => {
        accumulator[day] = [];
        return accumulator;
    }, {});

    courseContents.forEach((course) => {
        const dayIndex = getDayIndex(course.day);
        if (dayIndex === null) {
            return;
        }

        const day = days[dayIndex];
        if (!day || !grouped[day]) {
            return;
        }

        grouped[day].push(course);
    });

    return grouped;
};

export const getCurrentWeekRange = (weekOffset = 0, language = 'en') => {
    const monday = startOfWeek(addWeeks(new Date(), weekOffset), { weekStartsOn: 1 });
    const sunday = endOfWeek(monday, { weekStartsOn: 1 });
    const locale = getDateLocale(language);

    return {
        start: monday,
        end: sunday,
        label: `${format(monday, 'd MMMM', { locale })} – ${format(sunday, 'd MMMM yyyy', { locale })}`,
    };
};

export const getDateForDay = (weekStartDate, dayIndex) => {
    return addDays(weekStartDate, dayIndex);
};

export const calculateTopPosition = (
    startTime,
    dayStartTime = GRID_START_MINUTES,
    dayEndTime = GRID_END_MINUTES
) => {
    const totalRange = dayEndTime - dayStartTime;
    if (totalRange <= 0) {
        return 0;
    }

    const clamped = Math.min(Math.max(startTime, dayStartTime), dayEndTime);
    return ((clamped - dayStartTime) / totalRange) * 100;
};

export const calculateHeight = (
    startTime,
    endTime,
    dayStartTime = GRID_START_MINUTES,
    dayEndTime = GRID_END_MINUTES
) => {
    const totalRange = dayEndTime - dayStartTime;
    if (totalRange <= 0) {
        return 0;
    }

    const clampedStart = Math.min(Math.max(startTime, dayStartTime), dayEndTime);
    const clampedEnd = Math.min(Math.max(endTime, dayStartTime), dayEndTime);

    if (clampedEnd <= clampedStart) {
        return 0;
    }

    return ((clampedEnd - clampedStart) / totalRange) * 100;
};

export const detectOverlaps = (courses) => {
    const sorted = [...courses].sort((a, b) => {
        if (a.startMinutes === b.startMinutes) {
            return a.endMinutes - b.endMinutes;
        }
        return a.startMinutes - b.startMinutes;
    });

    const activeColumns = [];

    return sorted
        .map((course) => {
            for (let index = 0; index < activeColumns.length; index += 1) {
                if (activeColumns[index] <= course.startMinutes) {
                    activeColumns[index] = course.endMinutes;
                    return {
                        ...course,
                        overlapIndex: index,
                        overlapTotal: activeColumns.length,
                    };
                }
            }

            activeColumns.push(course.endMinutes);

            return {
                ...course,
                overlapIndex: activeColumns.length - 1,
                overlapTotal: activeColumns.length,
            };
        })
        .map((course) => ({
            ...course,
            overlapTotal: Math.max(course.overlapTotal, 1),
        }));
};