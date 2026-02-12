import { useThemeStore } from '@/stores/themeStore';
import { Button } from '@/components/ui/button';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
    const { theme, toggleTheme } = useThemeStore();

    return (
        <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
            {theme === 'dark' ? (
                <Sun className="h-3.5 w-3.5" />
            ) : (
                <Moon className="h-3.5 w-3.5" />
            )}
        </Button>
    );
}
