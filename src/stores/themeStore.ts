import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

type Theme = 'dark' | 'light';

interface ThemeState {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (t: Theme) => void;
}

function applyTheme(theme: Theme) {
    const root = document.documentElement;
    if (theme === 'light') {
        root.classList.add('light');
    } else {
        root.classList.remove('light');
    }
}

export const useThemeStore = create<ThemeState>()(
    devtools(
        persist(
            (set, get) => ({
                theme: 'dark',
                toggleTheme: () => {
                    const next = get().theme === 'dark' ? 'light' : 'dark';
                    applyTheme(next);
                    set({ theme: next });
                },
                setTheme: (t) => {
                    applyTheme(t);
                    set({ theme: t });
                },
            }),
            {
                name: 'lupus-theme',
                onRehydrateStorage: () => (state) => {
                    if (state) applyTheme(state.theme);
                },
            }
        ),
        { name: 'lupus-theme' }
    )
);
