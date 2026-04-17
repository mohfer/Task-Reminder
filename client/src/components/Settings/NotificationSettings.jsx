import { useEffect, useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const DEADLINES = ['7 days left', '5 days left', '3 days left', '1 day left'];
const CHANNEL_OPTIONS = [
    { value: 'email', label: 'Email' },
    { value: 'telegram', label: 'Telegram' },
    { value: 'both', label: 'Both' },
];

export const NotificationSettings = ({
    isLoading,
    isMutating,
    notify,
    notificationChannel,
    telegramChatId,
    taskCreated,
    taskCompleted,
    onNotifyChange,
    onNotificationChannelChange,
    onTelegramChatIdSave,
    onTestNotification,
    onTaskCreatedToggle,
    onTaskCompletedToggle,
}) => {
    const [chatIdInput, setChatIdInput] = useState('');
    const needsTelegramChatId = notificationChannel === 'telegram' || notificationChannel === 'both';
    const isTestDisabled = isMutating || (needsTelegramChatId && chatIdInput.trim() === '');

    useEffect(() => {
        setChatIdInput(telegramChatId || '');
    }, [telegramChatId]);

    return (
        <Card className="my-4">
            <CardContent className="p-6">
                {isLoading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                    </div>
                ) : (
                    <>
                        <div className="flex flex-col gap-3">
                            <div>
                                <p className="text-lg">Notification Channel</p>
                                <span className="text-muted-foreground">
                                    Choose where reminders are sent.
                                </span>
                            </div>

                            <div className="grid grid-cols-3 gap-2 sm:max-w-sm">
                                {CHANNEL_OPTIONS.map((option) => (
                                    <Button
                                        key={option.value}
                                        type="button"
                                        variant={notificationChannel === option.value ? 'default' : 'outline'}
                                        onClick={() => onNotificationChannelChange(option.value)}
                                        disabled={isMutating}
                                    >
                                        {option.label}
                                    </Button>
                                ))}
                            </div>

                            <div className="space-y-2">
                                <div className="flex flex-col gap-2 sm:flex-row">
                                    <Input
                                        placeholder="Telegram Chat ID"
                                        value={chatIdInput}
                                        onChange={(event) => setChatIdInput(event.target.value)}
                                        disabled={isMutating}
                                    />
                                    <Button
                                        type="button"
                                        onClick={() => onTelegramChatIdSave(chatIdInput)}
                                        disabled={isMutating || chatIdInput.trim() === telegramChatId?.trim()}
                                    >
                                        Save
                                    </Button>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Set Telegram chat ID first, then switch channel to Telegram or Both.
                                </p>
                            </div>

                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={onTestNotification}
                                    disabled={isTestDisabled}
                                >
                                    Send Test Notification
                                </Button>
                                <p className="text-sm text-muted-foreground">
                                    Sends a dummy message to your active channel selection.
                                </p>
                            </div>
                        </div>

                        <Separator className="my-4" />

                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-lg">Deadline Notification</p>
                                <span className="text-muted-foreground">
                                    Display a notification when the task is approaching the due date.
                                </span>
                            </div>

                            <Select value={notify} onValueChange={onNotifyChange}>
                                <SelectTrigger className="w-[170px]" disabled={isMutating}>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {DEADLINES.map((deadline) => (
                                        <SelectItem key={deadline} value={deadline}>
                                            {deadline}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <Separator className="my-4" />

                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-lg">Task Created Notification</p>
                                <span className="text-muted-foreground">
                                    Display a notification when the task is successfully created.
                                </span>
                            </div>
                            <div className="w-[108px] text-center">
                                <Switch checked={taskCreated === 1} onCheckedChange={onTaskCreatedToggle} disabled={isMutating} />
                            </div>
                        </div>

                        <Separator className="my-4" />

                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-lg">Task Completed Notification</p>
                                <span className="text-muted-foreground">
                                    Display a notification when the task is successfully completed.
                                </span>
                            </div>
                            <div className="w-[108px] text-center">
                                <Switch checked={taskCompleted === 1} onCheckedChange={onTaskCompletedToggle} disabled={isMutating} />
                            </div>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
};
