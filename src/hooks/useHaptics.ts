import { useCallback } from 'react';

export function useHaptics() {
    const vibrate = useCallback((pattern: number | number[]) => {
        if ('vibrate' in navigator) {
            navigator.vibrate(pattern);
        }
    }, []);

    return { vibrate };
}
