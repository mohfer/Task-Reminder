import { LayoutDashboard, Settings, Book, Trophy, LogOut } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/course-contents', icon: Book, label: 'Course Content' },
    { to: '/assessments', icon: Trophy, label: 'Assessment' },
    { to: '/settings', icon: Settings, label: 'Settings' },
];

const Sidebar = () => {
    const { logout } = useAuth();

    return (
        <aside className="hidden w-64 flex-col border-r bg-card lg:flex">
            <div className="flex h-16 items-center gap-3 px-6">
                <Link to="/dashboard" className="flex items-center gap-3 transition-opacity hover:opacity-80">
                    <img src="/logo.webp" className="h-8 w-8" alt="logo" />
                    <span className="text-lg font-bold text-foreground">Task Reminder</span>
                </Link>
            </div>

            <Separator />

            <nav className="flex-1 space-y-1 px-3 py-4">
                {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                            cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                                isActive
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                            )
                        }
                    >
                        <Icon className="h-5 w-5" />
                        {label}
                    </NavLink>
                ))}
            </nav>

            <Separator />

            <div className="p-3">
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={logout}
                >
                    <LogOut className="h-5 w-5" />
                    Logout
                </Button>
            </div>
        </aside>
    );
};

export default Sidebar;