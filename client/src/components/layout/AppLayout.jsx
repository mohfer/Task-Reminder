import { AppSidebar } from '@/components/layout/Sidebar';
import { AppHeader } from '@/components/layout/Header';
import { AppBottomBar } from '@/components/layout/BottomBar';

export const AppLayout = ({ title, children }) => {
    return (
        <div className="flex h-screen bg-background">
            <AppSidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
                <AppHeader title={title} />
                <main className="flex-1 overflow-y-auto p-4 pb-28 lg:p-6 lg:pb-6">{children}</main>
            </div>
            <AppBottomBar />
        </div>
    );
};
