import { LayoutDashboard, Settings, Book, Trophy } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/course-contents', icon: Book, label: 'Courses' },
    { to: '/assessments', icon: Trophy, label: 'Assessments' },
    { to: '/settings', icon: Settings, label: 'Settings' },
];

const BottomBar = () => {
    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 block border-t bg-card lg:hidden">
            <nav className="flex items-center justify-around py-2">
                {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                            cn(
                                'flex flex-col items-center gap-1 px-3 py-1 text-xs font-medium transition-colors',
                                isActive ? 'text-primary' : 'text-muted-foreground'
                            )
                        }
                    >
                        <Icon className="h-5 w-5" />
                        <span>{label}</span>
                    </NavLink>
                ))}
            </nav>
        </div>
    );
};

export default BottomBar;