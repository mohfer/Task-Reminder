import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useSemesterStore from '@/store/useSemesterStore';
import { SEMESTERS } from '@/lib/constants';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { Separator } from '@/components/ui/separator';

const Header = ({ title }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { pathname } = location;
    const semesterLabel = useSemesterStore((state) => state.semesterLabel);
    const setSemester = useSemesterStore((state) => state.setSemester);
    const userName = useSemesterStore((state) => state.userName);
    const displayName = userName || localStorage.getItem('name') || 'User';

    useEffect(() => {
        localStorage.removeItem('isPasswordReset');

        const storedToken = localStorage.getItem('token');
        const emailVerified = localStorage.getItem('isEmailVerified');

        if (!storedToken) {
            navigate('/auth/login');
        } else if (emailVerified === 'false') {
            navigate('/auth/verify-email');
        }
    }, [navigate]);

    return (
        <header className="border-b bg-card">
            <div className="flex h-16 items-center justify-between px-4 lg:px-6">
                <h1 className="text-xl font-bold text-foreground lg:text-2xl">{title}</h1>
                <div className="flex items-center gap-3">
                    {pathname !== '/settings' ? (
                        <Select value={semesterLabel} onValueChange={(value) => setSemester(value, value)}>
                            <SelectTrigger className="w-[160px] bg-background">
                                <SelectValue placeholder="Select semester" />
                            </SelectTrigger>
                            <SelectContent>
                                {SEMESTERS.map((semester) => (
                                    <SelectItem key={semester} value={semester}>
                                        {semester}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    ) : null}

                    <ThemeToggle />

                    <Separator orientation="vertical" className="hidden h-6 lg:block" />

                    <div className="hidden items-center gap-3 lg:flex">
                        <span className="text-sm font-medium text-foreground">Hi, {displayName}</span>
                        <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary text-sm text-primary-foreground">
                                {displayName?.charAt(0)?.toUpperCase() || 'U'}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;