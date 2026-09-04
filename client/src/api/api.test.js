import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./axiosInstance', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: {} })),
    post: vi.fn(() => Promise.resolve({ data: {} })),
    put: vi.fn(() => Promise.resolve({ data: {} })),
    patch: vi.fn(() => Promise.resolve({ data: {} })),
    delete: vi.fn(() => Promise.resolve({ data: {} })),
  },
}));

import axiosInstance from './axiosInstance';
import { taskApi } from './taskApi';
import { courseContentApi } from './courseContentApi';
import { authApi } from './authApi';
import { gradeApi } from './gradeApi';
import { dashboardApi } from './dashboardApi';
import { assessmentApi } from './assessmentApi';
import { settingsApi } from './settingsApi';
import { userApi } from './userApi';
import { passwordApi } from './passwordApi';

describe('API modules', () => {
  beforeEach(() => vi.clearAllMocks());

  it('taskApi calls correct endpoints', async () => {
    await taskApi.getAll();
    expect(axiosInstance.get).toHaveBeenCalledWith('/tasks');
    await taskApi.getById(1);
    expect(axiosInstance.get).toHaveBeenCalledWith('/tasks/1');
    await taskApi.create({ task: 'Test' });
    expect(axiosInstance.post).toHaveBeenCalledWith('/tasks', { task: 'Test' });
    await taskApi.update(2, { task: 'Upd' });
    expect(axiosInstance.put).toHaveBeenCalledWith('/tasks/2', { task: 'Upd' });
    await taskApi.delete(3);
    expect(axiosInstance.delete).toHaveBeenCalledWith('/tasks/3');
    await taskApi.updateStatus(5, 1);
    expect(axiosInstance.patch).toHaveBeenCalledWith('/tasks/5/status', { status: 1 });
  });

  it('courseContentApi calls correct endpoints', async () => {
    await courseContentApi.filter('Semester 1');
    expect(axiosInstance.get).toHaveBeenCalledWith('/course-contents/filter', { params: { semester: 'Semester 1' } });
    await courseContentApi.create({ code: 'MK001' });
    expect(axiosInstance.post).toHaveBeenCalledWith('/course-contents', { code: 'MK001' }, expect.objectContaining({ headers: { 'Content-Type': 'multipart/form-data' } }));
    await courseContentApi.update(1, { code: 'MK002' });
    expect(axiosInstance.put).toHaveBeenCalledWith('/course-contents/1', { code: 'MK002' });
    await courseContentApi.delete(1);
    expect(axiosInstance.delete).toHaveBeenCalledWith('/course-contents/1');
    await courseContentApi.downloadTemplate();
    expect(axiosInstance.get).toHaveBeenCalledWith('/course-contents/download-template', { responseType: 'blob' });
    const fd = new FormData();
    await courseContentApi.importFromExcel(fd, vi.fn());
    expect(axiosInstance.post).toHaveBeenCalledWith('/course-contents/import-from-excel', fd, expect.objectContaining({ headers: { 'Content-Type': 'multipart/form-data' } }));
    await courseContentApi.syncSchedule('Semester 1', '20251');
    expect(axiosInstance.post).toHaveBeenCalledWith('/course-contents/sync-schedule', { semester: 'Semester 1', source_semester: '20251' });
  });

  it('authApi calls correct endpoints', async () => {
    await authApi.login({ email: 'a@b.com', password: 'secret' });
    expect(axiosInstance.post).toHaveBeenCalledWith('/auth/login', { email: 'a@b.com', password: 'secret' });
    await authApi.register({ name: 'Test' });
    expect(axiosInstance.post).toHaveBeenCalledWith('/auth/register', { name: 'Test' }, expect.any(Object));
    await authApi.logout();
    expect(axiosInstance.post).toHaveBeenCalledWith('/auth/logout');
    await authApi.checkToken();
    expect(axiosInstance.get).toHaveBeenCalledWith('/auth/check/token');
    await authApi.checkEmail();
    expect(axiosInstance.get).toHaveBeenCalledWith('/auth/check/email');
    await authApi.resendVerificationEmail({});
    expect(axiosInstance.post).toHaveBeenCalledWith('/email/resend', {});
    await authApi.verifyEmail(1, 'hash', { a: 1 });
    expect(axiosInstance.get).toHaveBeenCalledWith('/email/verify/1/hash', { params: { a: 1 } });
  });

  it('gradeApi calls correct endpoints', async () => {
    await gradeApi.getAll();
    expect(axiosInstance.get).toHaveBeenCalledWith('/settings/grades');
    await gradeApi.create({ grade: 'A' });
    expect(axiosInstance.post).toHaveBeenCalledWith('/settings/grades', { grade: 'A' });
    await gradeApi.update(1, { grade: 'B' });
    expect(axiosInstance.patch).toHaveBeenCalledWith('/settings/grades/1', { grade: 'B' });
    await gradeApi.delete(1);
    expect(axiosInstance.delete).toHaveBeenCalledWith('/settings/grades/1');
  });

  it('dashboardApi calls correct endpoints', async () => {
    await dashboardApi.getDashboard();
    expect(axiosInstance.get).toHaveBeenCalledWith('/dashboard');
    await dashboardApi.getChart('Semester 1');
    expect(axiosInstance.get).toHaveBeenCalledWith('/dashboard/chart', { params: { semester: 'Semester 1' } });
    await dashboardApi.getSemesterOverview();
    expect(axiosInstance.get).toHaveBeenCalledWith('/dashboard/semester-overview');
  });

  it('assessmentApi calls correct endpoints', async () => {
    await assessmentApi.calculate('Semester 1');
    expect(axiosInstance.get).toHaveBeenCalledWith('/assessments/calculate', { params: { semester: 'Semester 1' } });
    await assessmentApi.update(1, { score: 85 });
    expect(axiosInstance.patch).toHaveBeenCalledWith('/assessments/1', { score: 85 });
    await assessmentApi.sync('Semester 2', '20251');
    expect(axiosInstance.post).toHaveBeenCalledWith('/assessments/sync', { semester: 'Semester 2', source_semester: '20251' });
    await assessmentApi.getSemesters();
    expect(axiosInstance.get).toHaveBeenCalledWith('/assessments/semesters');
  });

  it('settingsApi calls correct endpoints', async () => {
    await settingsApi.updateDeadlineNotification({ deadline_notification: '3 days' });
    expect(axiosInstance.put).toHaveBeenCalledWith('/settings/deadline-notification', { deadline_notification: '3 days' });
    await settingsApi.updateNotificationChannel({ notification_channel: 'email' });
    expect(axiosInstance.put).toHaveBeenCalledWith('/settings/notification-channel', { notification_channel: 'email' });
    await settingsApi.updateTelegramChatId({ telegram_chat_id: '123' });
    expect(axiosInstance.put).toHaveBeenCalledWith('/settings/telegram-chat-id', { telegram_chat_id: '123' });
    await settingsApi.testNotification();
    expect(axiosInstance.post).toHaveBeenCalledWith('/settings/test-notification');
    await settingsApi.updateTaskCreatedNotification({});
    expect(axiosInstance.patch).toHaveBeenCalledWith('/settings/task-created-notification', {});
    await settingsApi.updateTaskCompletedNotification({});
    expect(axiosInstance.patch).toHaveBeenCalledWith('/settings/task-completed-notification', {});
    await settingsApi.saveSiakangCredentials({ email: 'a@b.com' });
    expect(axiosInstance.put).toHaveBeenCalledWith('/settings/siakang-credentials', { email: 'a@b.com' }, { skipAuthLogout: true });
    await settingsApi.deleteSiakangCredentials();
    expect(axiosInstance.delete).toHaveBeenCalledWith('/settings/siakang-credentials', { skipAuthLogout: true });
  });

  it('userApi calls correct endpoints', async () => {
    await userApi.getAuthenticatedUser();
    expect(axiosInstance.get).toHaveBeenCalledWith('/auth/user');
    await userApi.updateProfile({ name: 'New' });
    expect(axiosInstance.put).toHaveBeenCalledWith('/settings/profile', { name: 'New' });
    await userApi.changePassword({ old_password: 'old' });
    expect(axiosInstance.put).toHaveBeenCalledWith('/settings/password', { old_password: 'old' });
  });

  it('passwordApi calls correct endpoints', async () => {
    await passwordApi.sendResetLink({ email: 'a@b.com' });
    expect(axiosInstance.post).toHaveBeenCalledWith('/password/email', { email: 'a@b.com' });
    await passwordApi.resetPassword({ token: 'tok' });
    expect(axiosInstance.post).toHaveBeenCalledWith('/password/reset', { token: 'tok' }, expect.any(Object));
  });
});
