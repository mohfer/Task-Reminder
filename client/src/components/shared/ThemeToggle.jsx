import { Laptop, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/theme-provider';

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    const order = ['light', 'dark', 'system'];
    const currentIndex = order.indexOf(theme);
    const nextTheme = order[(currentIndex + 1) % order.length];

    const Icon =
        theme === 'light'
            ? Sun
            : theme === 'dark'
                ? Moon
                : Laptop;

    return (
        <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            onClick={() => setTheme(nextTheme)}
            title={`Theme: ${theme}. Click to switch to ${nextTheme}.`}
        >
            <Icon className="h-4 w-4" />
            <span className="sr-only">Cycle theme</span>
        </Button>
    );
}
