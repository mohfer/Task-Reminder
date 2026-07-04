import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { settingsApi } from '@/api/settingsApi';
import { userApi } from '@/api/userApi';
import useSemesterStore from '@/store/useSemesterStore';

export const useSettings = () => {
    const [userData, setUserData] = useState(null);
    const [settings, setSettings] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isMutating, setIsMutating] = useState(false);

    const fetchUserData = useCallback(async (showLoading = true) => {
        try {
            if (showLoading) {
                setIsLoading(true);
            }
            const response = await userApi.getAuthenticatedUser();
            setUserData(response.data.data.user);
            setSettings(response.data.data.settings);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to load user data.');
        } finally {
            if (showLoading) {
                setIsLoading(false);
            }
        }
    }, []);

    const updateDeadlineNotification = useCallback(
        async (deadline) => {
            try {
                setIsMutating(true);
                const response = await settingsApi.updateDeadlineNotification({
                    deadline_notification: deadline,
                });
                toast.success(response.data.message);
                await fetchUserData(false);
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to update deadline notification.');
            } finally {
                setIsMutating(false);
            }
        },
        [fetchUserData]
    );

    const updateNotificationChannel = useCallback(
        async (channel) => {
            try {
                setIsMutating(true);
                const response = await settingsApi.updateNotificationChannel({
                    notification_channel: channel,
                });
                toast.success(response.data.message);
                await fetchUserData(false);
                return { success: true };
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to update notification channel.');
                return { success: false };
            } finally {
                setIsMutating(false);
            }
        },
        [fetchUserData]
    );

    const updateTelegramChatId = useCallback(
        async (chatId) => {
            try {
                setIsMutating(true);
                const response = await settingsApi.updateTelegramChatId({
                    telegram_chat_id: chatId?.trim() || null,
                });
                toast.success(response.data.message);
                await fetchUserData(false);
                return { success: true };
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to update Telegram chat ID.');
                return { success: false };
            } finally {
                setIsMutating(false);
            }
        },
        [fetchUserData]
    );

    const testNotification = useCallback(
        async () => {
            try {
                setIsMutating(true);
                const response = await settingsApi.testNotification();
                toast.success(response.data.message);
                return { success: true };
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to send test notification.');
                return { success: false };
            } finally {
                setIsMutating(false);
            }
        },
        []
    );

    const toggleTaskCreatedNotification = useCallback(
        async (value) => {
            try {
                setIsMutating(true);
                const response = await settingsApi.updateTaskCreatedNotification({
                    task_created_notification: value,
                });
                toast.success(response.data.message);
                await fetchUserData(false);
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to update task-created notification.');
            } finally {
                setIsMutating(false);
            }
        },
        [fetchUserData]
    );

    const toggleTaskCompletedNotification = useCallback(
        async (value) => {
            try {
                setIsMutating(true);
                const response = await settingsApi.updateTaskCompletedNotification({
                    task_completed_notification: value,
                });
                toast.success(response.data.message);
                await fetchUserData(false);
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to update task-completed notification.');
            } finally {
                setIsMutating(false);
            }
        },
        [fetchUserData]
    );

    const updateProfile = useCallback(
        async (data) => {
            try {
                setIsMutating(true);
                const response = await userApi.updateProfile(data);
                toast.success(response.data.message);
                localStorage.setItem('name', data.name);
                useSemesterStore.getState().setUserName(data.name);
                await fetchUserData(false);
                return { success: true };
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to update profile.');
                return { success: false, errors: error.response?.data?.errors || {} };
            } finally {
                setIsMutating(false);
            }
        },
        [fetchUserData]
    );

    const changePassword = useCallback(
        async (data) => {
            try {
                setIsMutating(true);
                const response = await userApi.changePassword(data);
                toast.success(response.data.message);
                await fetchUserData(false);
                return { success: true };
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to change password.');
                return {
                    success: false,
                    errors: error.response?.data?.errors || {},
                    oldPasswordError:
                        error.response?.status === 401
                            ? error.response.data.message
                            : error.response?.data?.errors?.old_password || '',
                };
            } finally {
                setIsMutating(false);
            }
        },
        [fetchUserData]
    );

    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    return {
        userData,
        settings,
        isLoading,
        isMutating,
        updateDeadlineNotification,
        updateNotificationChannel,
        updateTelegramChatId,
        testNotification,
        toggleTaskCreatedNotification,
        toggleTaskCompletedNotification,
        updateProfile,
        changePassword,
    };
};
