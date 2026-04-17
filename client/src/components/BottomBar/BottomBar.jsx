import { LayoutDashboard, Settings, Book, Trophy, CalendarDays } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
    { to: '/course-contents', icon: Book, label: 'Courses' },
    { to: '/schedule', icon: CalendarDays, label: 'Schedule' },
    { to: '/assessments', icon: Trophy, label: 'Assess' },
    { to: '/settings', icon: Settings, label: 'Settings' },
];

const BottomBar = () => {
    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 block border-t bg-card lg:hidden">
            <nav className="grid grid-cols-5 items-center py-1">
                {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                            cn(
                                'flex min-w-0 flex-col items-center gap-1 px-1 py-1 text-[10px] font-medium transition-colors',
                                isActive ? 'text-primary' : 'text-muted-foreground'
                            )
                        }
                    >
                        <Icon className="h-5 w-5" />
                        <span className="max-w-[58px] truncate">{label}</span>
                    </NavLink>
                ))}
            </nav>
        </div>
    );
};

export default BottomBar;