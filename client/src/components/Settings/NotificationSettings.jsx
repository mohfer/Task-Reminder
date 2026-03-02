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

const DEADLINES = ['7 days left', '5 days left', '3 days left', '1 day left'];

export const NotificationSettings = ({
    isLoading,
    notify,
    taskCreated,
    taskCompleted,
    onNotifyChange,
    onTaskCreatedToggle,
    onTaskCompletedToggle,
}) => {
    return (
        <Card className="my-4">
            <CardContent className="p-6">
                {isLoading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                    </div>
                ) : (
                    <>
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-lg">Deadline Notification</p>
                                <span className="text-muted-foreground">
                                    Display a notification when the task is approaching the due date.
                                </span>
                            </div>

                            <Select value={notify} onValueChange={onNotifyChange}>
                                <SelectTrigger className="w-[170px]">
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
                                <Switch checked={taskCreated === 1} onCheckedChange={onTaskCreatedToggle} />
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
                                <Switch checked={taskCompleted === 1} onCheckedChange={onTaskCompletedToggle} />
                            </div>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
};
