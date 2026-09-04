import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  SCHEDULE_LABELS,
  GRID_START_MINUTES,
  GRID_END_MINUTES,
  GRID_STEP_MINUTES,
  getScheduleLanguage,
  getScheduleLabels,
  getDateLocale,
  parseTimeToMinutes,
  formatMinutesToTime,
  generateTimeSlots,
  getDayIndex,
  groupByDay,
  getCurrentWeekRange,
  getDateForDay,
  calculateTopPosition,
  calculateHeight,
  detectOverlaps,
} from './scheduleUtils';

describe('getScheduleLanguage', () => {
  it('return id jika id', () => expect(getScheduleLanguage('id')).toBe('id'));
  it('default en', () => {
    expect(getScheduleLanguage('en')).toBe('en');
    expect(getScheduleLanguage('fr')).toBe('en');
    expect(getScheduleLanguage(null)).toBe('en');
    expect(getScheduleLanguage(undefined)).toBe('en');
  });
});

describe('getScheduleLabels', () => {
  it('return id labels', () => {
    expect(getScheduleLabels('id')).toEqual(SCHEDULE_LABELS.id);
    expect(getScheduleLabels('id').days).toContain('Senin');
  });
  it('return en default', () => {
    expect(getScheduleLabels('en')).toEqual(SCHEDULE_LABELS.en);
    expect(getScheduleLabels()).toEqual(SCHEDULE_LABELS.en);
    expect(getScheduleLabels('xx')).toEqual(SCHEDULE_LABELS.en);
  });
});

describe('getDateLocale', () => {
  it('return locale sesuai bahasa', () => {
    const id = getDateLocale('id');
    const en = getDateLocale('en');
    expect(id).toBeDefined();
    expect(en).toBeDefined();
    expect(id.code).toBe('id');
    expect(en.code).toBe('en-US');
  });
});

describe('parseTimeToMinutes', () => {
  it('parse valid time', () => {
    expect(parseTimeToMinutes('08:00')).toBe(480);
    expect(parseTimeToMinutes('07:30')).toBe(450);
    expect(parseTimeToMinutes('21:00')).toBe(1260);
    expect(parseTimeToMinutes('00:00')).toBe(0);
    expect(parseTimeToMinutes('8:5')).toBe(485);
  });
  it('return null jika invalid', () => {
    expect(parseTimeToMinutes(null)).toBeNull();
    expect(parseTimeToMinutes(undefined)).toBeNull();
    expect(parseTimeToMinutes('')).toBeNull();
    expect(parseTimeToMinutes(123)).toBeNull();
    expect(parseTimeToMinutes('abc')).toBeNull();
    expect(parseTimeToMinutes('ab:cd')).toBeNull();
  });
  it('handle tanpa menit', () => {
    expect(parseTimeToMinutes('08')).toBe(480);
  });
});

describe('formatMinutesToTime', () => {
  it('format correctly', () => {
    expect(formatMinutesToTime(0)).toBe('00:00');
    expect(formatMinutesToTime(60)).toBe('01:00');
    expect(formatMinutesToTime(480)).toBe('08:00');
    expect(formatMinutesToTime(485)).toBe('08:05');
    expect(formatMinutesToTime(1260)).toBe('21:00');
  });
});

describe('generateTimeSlots', () => {
  it('generate default slots 07:00-21:00 step 60', () => {
    const slots = generateTimeSlots();
    expect(slots[0]).toBe('07:00');
    expect(slots[slots.length - 1]).toBe('21:00');
    expect(slots).toHaveLength(15);
  });
  it('custom range', () => {
    expect(generateTimeSlots(480, 600, 60)).toEqual(['08:00', '09:00', '10:00']);
    expect(generateTimeSlots(0, 120, 30)).toEqual(['00:00', '00:30', '01:00', '01:30', '02:00']);
  });
  it('step tidak membagi habis tetap include end jika pas', () => {
    const slots = generateTimeSlots(0, 100, 60);
    expect(slots).toEqual(['00:00', '01:00']);
  });
});

describe('getDayIndex', () => {
  it('return index untuk hari', () => {
    expect(getDayIndex('Senin')).toBe(0);
    expect(getDayIndex('senin')).toBe(0);
    expect(getDayIndex('Monday')).toBe(0);
    expect(getDayIndex('Selasa')).toBe(1);
    expect(getDayIndex('Tuesday')).toBe(1);
    expect(getDayIndex('Rabu')).toBe(2);
    expect(getDayIndex('Wednesday')).toBe(2);
    expect(getDayIndex('Kamis')).toBe(3);
    expect(getDayIndex('Jumat')).toBe(4);
    expect(getDayIndex('Sabtu')).toBe(5);
    expect(getDayIndex('Minggu')).toBe(6);
    expect(getDayIndex('Sunday')).toBe(6);
  });
  it('handle trim dan case', () => {
    expect(getDayIndex('  Senin  ')).toBe(0);
    expect(getDayIndex('SENIN')).toBe(0);
  });
  it('return null jika invalid', () => {
    expect(getDayIndex(null)).toBeNull();
    expect(getDayIndex('')).toBeNull();
    expect(getDayIndex('InvalidDay')).toBeNull();
    expect(getDayIndex(undefined)).toBeNull();
  });
});

describe('groupByDay', () => {
  const daysEn = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const daysId = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

  it('group correctly en', () => {
    const courses = [
      { day: 'Senin', course_content: 'Kalkulus' },
      { day: 'Tuesday', course_content: 'Fisika' },
      { day: 'Senin', course_content: 'Algoritma' },
    ];
    const grouped = groupByDay(courses, daysEn);
    expect(grouped['Monday']).toHaveLength(2);
    expect(grouped['Tuesday']).toHaveLength(1);
    expect(grouped['Wednesday']).toHaveLength(0);
  });

  it('group correctly id', () => {
    const courses = [{ day: 'Senin', course_content: 'A' }];
    const grouped = groupByDay(courses, daysId);
    expect(grouped['Senin']).toHaveLength(1);
  });

  it('abaikan hari tidak dikenal', () => {
    const courses = [{ day: 'Invalid', course_content: 'X' }, { day: null, course_content: 'Y' }];
    const grouped = groupByDay(courses, daysEn);
    Object.values(grouped).forEach(arr => expect(arr).toHaveLength(0));
  });

  it('handle empty', () => {
    expect(groupByDay([], daysEn)).toEqual({
      Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: []
    });
  });
});

describe('getCurrentWeekRange', () => {
  it('return start, end, label', () => {
    const range = getCurrentWeekRange(0, 'en');
    expect(range.start).toBeInstanceOf(Date);
    expect(range.end).toBeInstanceOf(Date);
    expect(range.label).toContain('–');
    expect(range.start.getDay()).toBe(1);
  });

  it('weekOffset menggeser seminggu', () => {
    const w0 = getCurrentWeekRange(0);
    const w1 = getCurrentWeekRange(1);
    const diff = (w1.start - w0.start) / (1000 * 60 * 60 * 24);
    expect(diff).toBe(7);
    const wNeg = getCurrentWeekRange(-1);
    const diffNeg = (w0.start - wNeg.start) / (1000 * 60 * 60 * 24);
    expect(diffNeg).toBe(7);
  });

  it('label id locale', () => {
    const range = getCurrentWeekRange(0, 'id');
    expect(range.label).toBeDefined();
  });
});

describe('getDateForDay', () => {
  it('tambah hari dengan benar', () => {
    const monday = new Date(2025, 0, 6);
    expect(getDateForDay(monday, 0).getDate()).toBe(6);
    expect(getDateForDay(monday, 1).getDate()).toBe(7);
    expect(getDateForDay(monday, 6).getDate()).toBe(12);
  });
});

describe('calculateTopPosition', () => {
  it('hitung posisi proporsional', () => {
    // range 7*60 to 21*60 = 840 minutes
    expect(calculateTopPosition(420)).toBe(0);
    expect(calculateTopPosition(1260)).toBe(100);
    expect(calculateTopPosition(840)).toBeCloseTo(50);
  });
  it('clamp di luar range', () => {
    expect(calculateTopPosition(0)).toBe(0);
    expect(calculateTopPosition(2000)).toBe(100);
  });
  it('return 0 jika range invalid', () => {
    expect(calculateTopPosition(500, 100, 100)).toBe(0);
    expect(calculateTopPosition(500, 200, 100)).toBe(0);
  });
});

describe('calculateHeight', () => {
  it('hitung height proporsional', () => {
    expect(calculateHeight(480, 540)).toBeCloseTo((60 / 840) * 100);
    expect(calculateHeight(420, 1260)).toBe(100);
  });
  it('clamp dan handle overlap', () => {
    expect(calculateHeight(0, 2000)).toBe(100);
    expect(calculateHeight(500, 500)).toBe(0);
    expect(calculateHeight(600, 500)).toBe(0);
  });
  it('return 0 jika range invalid', () => {
    expect(calculateHeight(100, 200, 100, 100)).toBe(0);
  });
});

describe('detectOverlaps', () => {
  it('tidak overlap jika tidak tumpang tindih', () => {
    const courses = [
      { id: 1, startMinutes: 480, endMinutes: 540 },
      { id: 2, startMinutes: 600, endMinutes: 660 },
    ];
    const result = detectOverlaps(courses);
    expect(result[0].overlapIndex).toBe(0);
    expect(result[1].overlapIndex).toBe(0);
    expect(result[0].overlapTotal).toBe(1);
    expect(result[1].overlapTotal).toBe(1);
  });

  it('deteksi overlap dua jadwal bersamaan', () => {
    const courses = [
      { id: 1, startMinutes: 480, endMinutes: 600 },
      { id: 2, startMinutes: 500, endMinutes: 600 },
    ];
    const result = detectOverlaps(courses);
    expect(result[0].overlapIndex).toBe(0);
    expect(result[1].overlapIndex).toBe(1);
    // overlapTotal minimal 1
    expect(result[0].overlapTotal).toBeGreaterThanOrEqual(1);
  });

  it('reuse kolom jika slot kosong', () => {
    const courses = [
      { id: 1, startMinutes: 480, endMinutes: 540 },
      { id: 2, startMinutes: 500, endMinutes: 560 },
      { id: 3, startMinutes: 600, endMinutes: 660 },
    ];
    const result = detectOverlaps(courses);
    expect(result[2].overlapIndex).toBe(0);
  });

  it('sort berdasarkan startMinutes', () => {
    const courses = [
      { id: 2, startMinutes: 600, endMinutes: 660 },
      { id: 1, startMinutes: 480, endMinutes: 540 },
    ];
    const result = detectOverlaps(courses);
    expect(result[0].id).toBe(1);
    expect(result[1].id).toBe(2);
  });

  it('handle empty', () => {
    expect(detectOverlaps([])).toEqual([]);
  });

  it('handle same start, shorter first', () => {
    const courses = [
      { id: 1, startMinutes: 480, endMinutes: 600 },
      { id: 2, startMinutes: 480, endMinutes: 540 },
    ];
    const result = detectOverlaps(courses);
    expect(result[0].id).toBe(2);
    expect(result[1].id).toBe(1);
  });
});
