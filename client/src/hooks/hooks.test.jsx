import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { createElement } from 'react';
import { MemoryRouter } from 'react-router-dom';

// ----- useModal -----
import { useModal } from './useModal';

describe('useModal', () => {
  it('initial false dan open/close/toggle', () => {
    const { result } = renderHook(() => useModal());
    expect(result.current.isOpen).toBe(false);
    act(() => result.current.open());
    expect(result.current.isOpen).toBe(true);
    act(() => result.current.close());
    expect(result.current.isOpen).toBe(false);
    act(() => result.current.toggle());
    expect(result.current.isOpen).toBe(true);
    act(() => result.current.toggle());
    expect(result.current.isOpen).toBe(false);
  });

  it('initial true', () => {
    const { result } = renderHook(() => useModal(true));
    expect(result.current.isOpen).toBe(true);
  });
});

// ----- useAuth -----
vi.mock('@/api/authApi', () => ({
  authApi: {
    logout: vi.fn(() => Promise.resolve({ data: { message: 'Logged out' } })),
  },
}));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { useAuth } from './useAuth';
import { authApi } from '@/api/authApi';
import { toast } from 'sonner';

describe('useAuth', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('isAuthenticated dan getToken/getName', () => {
    const wrapper = ({ children }) => createElement(MemoryRouter, null, children);
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.isAuthenticated()).toBe(false);
    expect(result.current.getToken()).toBeNull();
    localStorage.setItem('token', 'abc');
    localStorage.setItem('name', 'Budi');
    expect(result.current.isAuthenticated()).toBe(true);
    expect(result.current.getToken()).toBe('abc');
    expect(result.current.getName()).toBe('Budi');
  });

  it('logout success menghapus storage dan navigasi', async () => {
    localStorage.setItem('token', 'abc');
    sessionStorage.setItem('x', '1');
    const wrapper = ({ children }) => createElement(MemoryRouter, null, children);
    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => {
      await result.current.logout();
    });
    expect(authApi.logout).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalled();
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('logout error tetap clear dan navigasi', async () => {
    authApi.logout.mockRejectedValueOnce({ response: { data: { message: 'Gagal' } } });
    const wrapper = ({ children }) => createElement(MemoryRouter, null, children);
    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => {
      await result.current.logout();
    });
    expect(toast.error).toHaveBeenCalled();
  });
});

// ----- useChartData -----
vi.mock('@/api/dashboardApi', () => ({
  dashboardApi: {
    getChart: vi.fn(() => Promise.resolve({ data: { data: { course_contents: [{ id: 1 }], completed_task: 2, uncompleted_task: 3, total_task: 5 } } })),
    getDashboard: vi.fn(() => Promise.resolve({ data: { data: { completed_task: 1, total_task: 2 } } })),
    getSemesterOverview: vi.fn(() => Promise.resolve({ data: { data: { semesters: ['Semester 1'] } } })),
  },
}));

import { useChartData } from './useChartData';
import { dashboardApi } from '@/api/dashboardApi';

describe('useChartData', () => {
  it('fetch chart data pada mount', async () => {
    const { result } = renderHook(() => useChartData('Semester 1'));
    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(dashboardApi.getChart).toHaveBeenCalledWith('Semester 1');
    expect(result.current.courseContents).toHaveLength(1);
    expect(result.current.completedTask).toBe(2);
    expect(result.current.totalTask).toBe(5);
  });

  it('handle error tanpa crash', async () => {
    dashboardApi.getChart.mockRejectedValueOnce(new Error('fail'));
    const { result } = renderHook(() => useChartData('Semester 1'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.courseContents).toEqual([]);
  });
});

// ----- useSemesterOverview -----
import { useSemesterOverview } from './useSemesterOverview';

describe('useSemesterOverview', () => {
  it('fetch overview dan expose semesters', async () => {
    const { result } = renderHook(() => useSemesterOverview());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(dashboardApi.getSemesterOverview).toHaveBeenCalled();
    expect(result.current.semesters).toEqual(['Semester 1']);
    expect(result.current.overviewData).toBeTruthy();
  });
});

// ----- useGrades -----
vi.mock('@/api/gradeApi', () => ({
  gradeApi: {
    getAll: vi.fn(() => Promise.resolve({ data: { data: [] } })),
    create: vi.fn(() => Promise.resolve({ data: { message: 'created' } })),
    update: vi.fn(() => Promise.resolve({ data: { message: 'updated' } })),
    delete: vi.fn(() => Promise.resolve({ data: { message: 'deleted' } })),
  },
}));
import { useGrades } from './useGrades';
import { gradeApi } from '@/api/gradeApi';

describe('useGrades', () => {
  it('fetchGrades dan create/update/delete', async () => {
    const { result } = renderHook(() => useGrades());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(gradeApi.getAll).toHaveBeenCalled();

    await act(async () => {
      const res = await result.current.createGrade({ grade: 'A' });
      expect(res.success).toBe(true);
    });
    expect(gradeApi.create).toHaveBeenCalled();

    await act(async () => {
      const res = await result.current.updateGrade(1, { grade: 'B' });
      expect(res.success).toBe(true);
    });
    expect(gradeApi.update).toHaveBeenCalledWith(1, { grade: 'B' });

    // error path
    gradeApi.create.mockRejectedValueOnce({ response: { data: { message: 'fail', errors: { grade: ['dup'] } } } });
    await act(async () => {
      const res = await result.current.createGrade({ grade: 'A' });
      expect(res.success).toBe(false);
      expect(res.errors).toHaveProperty('grade');
    });
  });
});

// ----- useCourseContents -----
vi.mock('@/api/courseContentApi', () => ({
  courseContentApi: {
    filter: vi.fn(() => Promise.resolve({ data: { data: { course_contents: [], total_credits: 0 } } })),
    create: vi.fn(() => Promise.resolve({ data: { message: 'created' } })),
    update: vi.fn(() => Promise.resolve({ data: { message: 'updated' } })),
    delete: vi.fn(() => Promise.resolve({ data: { message: 'deleted' } })),
  },
}));
import { useCourseContents } from './useCourseContents';
import { courseContentApi } from '@/api/courseContentApi';

describe('useCourseContents', () => {
  it('fetch dan create/update', async () => {
    const { result } = renderHook(() => useCourseContents('Semester 1'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(courseContentApi.filter).toHaveBeenCalledWith('Semester 1');

    await act(async () => {
      const res = await result.current.createCourseContent(new FormData());
      expect(res.success).toBe(true);
    });
    await act(async () => {
      const res = await result.current.updateCourseContent(1, { code: 'MK001' });
      expect(res.success).toBe(true);
    });
    // error path
    courseContentApi.create.mockRejectedValueOnce({ response: { data: { message: 'fail', errors: { code: ['dup'] } } } });
    await act(async () => {
      const res = await result.current.createCourseContent(new FormData());
      expect(res.success).toBe(false);
    });
  });
});

// ----- useDashboard -----
vi.mock('@/api/taskApi', () => ({
  taskApi: {
    create: vi.fn(() => Promise.resolve({ data: { message: 'created' } })),
    updateStatus: vi.fn(() => Promise.resolve({ data: { message: 'updated' } })),
  },
}));
import { useDashboard } from './useDashboard';

describe('useDashboard', () => {
  it('fetchDashboard dan create task', async () => {
    const { result } = renderHook(() => useDashboard());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(dashboardApi.getDashboard).toHaveBeenCalled();

    await act(async () => {
      const res = await result.current.createTask({ task: 'Test' });
      expect(res.success).toBe(true);
    });
    await act(async () => {
      await result.current.updateTaskStatus(1, true);
      expect(result.current.isMutating).toBe(false);
    });
    // error path
    const { taskApi: mockedTaskApi } = await import('@/api/taskApi');
    mockedTaskApi.create.mockRejectedValueOnce({ response: { data: { message: 'fail', errors: {} } } });
    await act(async () => {
      const res = await result.current.createTask({});
      expect(res.success).toBe(false);
    });
  });
});

// ----- useAssessments -----
vi.mock('@/api/assessmentApi', () => ({
  assessmentApi: {
    calculate: vi.fn(() => Promise.resolve({ data: { data: { course_contents: [], semester_gpa: '3.50', cumulative_gpa: '3.60' } } })),
    update: vi.fn(() => Promise.resolve({ data: { message: 'updated' } })),
    sync: vi.fn(() => Promise.resolve({ data: { message: 'synced', data: {} } })),
  },
}));
import { useAssessments } from './useAssessments';
import { assessmentApi } from '@/api/assessmentApi';

describe('useAssessments', () => {
  it('fetch, updateScore, syncScores', async () => {
    const { result } = renderHook(() => useAssessments('Semester 1'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(assessmentApi.calculate).toHaveBeenCalled();

    await act(async () => {
      const res = await result.current.updateScore(1, 85);
      expect(res.success).toBe(true);
    });
    await act(async () => {
      const res = await result.current.syncScores('20251');
      expect(res.success).toBe(true);
    });
    // error paths
    assessmentApi.update.mockRejectedValueOnce({ response: { data: { message: 'fail', errors: {} } } });
    await act(async () => {
      const res = await result.current.updateScore(1, 90);
      expect(res.success).toBe(false);
    });
  });
});

// ----- useSettings -----
vi.mock('@/api/settingsApi', () => ({
  settingsApi: {
    updateDeadlineNotification: vi.fn(() => Promise.resolve({ data: { message: 'ok' } })),
    updateNotificationChannel: vi.fn(() => Promise.resolve({ data: { message: 'ok' } })),
    updateTelegramChatId: vi.fn(() => Promise.resolve({ data: { message: 'ok' } })),
    testNotification: vi.fn(() => Promise.resolve({ data: { message: 'ok' } })),
    updateTaskCreatedNotification: vi.fn(() => Promise.resolve({ data: { message: 'ok' } })),
    updateTaskCompletedNotification: vi.fn(() => Promise.resolve({ data: { message: 'ok' } })),
    saveSiakangCredentials: vi.fn(() => Promise.resolve({ data: { message: 'ok' } })),
    deleteSiakangCredentials: vi.fn(() => Promise.resolve({ data: { message: 'ok' } })),
  },
}));
vi.mock('@/api/userApi', () => ({
  userApi: {
    getAuthenticatedUser: vi.fn(() => Promise.resolve({ data: { data: { user: { id: 1 }, settings: {} } } })),
  },
}));
import { useSettings } from './useSettings';

describe('useSettings', () => {
  it('fetchUserData dan update settings', async () => {
    const { result } = renderHook(() => useSettings());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const { userApi: mockedUserApi } = await import('@/api/userApi');
    expect(mockedUserApi.getAuthenticatedUser).toHaveBeenCalled();

    const { settingsApi: mockedSettingsApi } = await import('@/api/settingsApi');
    await act(async () => {
      await result.current.updateDeadlineNotification('3 days');
      expect(mockedSettingsApi.updateDeadlineNotification).toHaveBeenCalled();
    });
    await act(async () => {
      const res = await result.current.updateNotificationChannel('email');
      expect(res.success).toBe(true);
    });
  });
});
