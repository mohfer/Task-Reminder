import { useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSettings } from '@/hooks/useSettings';
import { useAuth } from '@/hooks/useAuth';
import { NotificationSettings } from '@/components/settings/NotificationSettings';
import { ProfileForm } from '@/components/settings/ProfileForm';
import { PasswordForm } from '@/components/settings/PasswordForm';
import { LogoutButton } from '@/components/settings/LogoutButton';
import { GradeView } from '@/components/grade/GradeView';

export const SettingsView = () => {
    const {
        userData,
        settings,
        isLoading,
        isMutating,
        updateDeadlineNotification,
        toggleTaskCreatedNotification,
        toggleTaskCompletedNotification,
        updateProfile,
        changePassword,
    } = useSettings();

    const { logout } = useAuth();

    useEffect(() => {
        document.title = 'Settings - Task Reminder';
    }, []);

    return (
        <div className="space-y-6">
            <Tabs defaultValue="notifications">
                <TabsList>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                    <TabsTrigger value="grades">Grades</TabsTrigger>
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                </TabsList>

                <TabsContent value="notifications">
                    <NotificationSettings
                        isLoading={isLoading}
                        notify={settings?.deadline_notification || '5 days left'}
                        taskCreated={Number(settings?.task_created_notification || 0)}
                        taskCompleted={Number(settings?.task_completed_notification || 0)}
                        onNotifyChange={updateDeadlineNotification}
                        onTaskCreatedToggle={() =>
                            toggleTaskCreatedNotification(Number(settings?.task_created_notification || 0) === 1 ? 0 : 1)
                        }
                        onTaskCompletedToggle={() =>
                            toggleTaskCompletedNotification(Number(settings?.task_completed_notification || 0) === 1 ? 0 : 1)
                        }
                    />
                </TabsContent>

                <TabsContent value="grades">
                    <GradeView />
                </TabsContent>

                <TabsContent value="profile">
                    <div className="my-4 flex flex-col gap-4 lg:flex-row">
                        <ProfileForm userData={userData} isLoading={isLoading} isMutating={isMutating} onSubmit={updateProfile} />
                        <PasswordForm isLoading={isLoading} isMutating={isMutating} onSubmit={changePassword} />
                    </div>
                </TabsContent>
            </Tabs>

            <LogoutButton isLoading={isMutating} onLogout={logout} />
        </div>
    );
};
