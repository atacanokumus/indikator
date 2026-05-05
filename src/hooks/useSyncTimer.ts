import { useState, useEffect } from 'react';

// The cron runs every 30 minutes
const CYCLE_DURATION_MINUTES = 30;

export function useSyncTimer(onSyncExpired?: () => void) {
    const [minutesSinceLastSync, setMinutesSinceLastSync] = useState(0);
    const [minutesUntilNextSync, setMinutesUntilNextSync] = useState(CYCLE_DURATION_MINUTES);
    const [isInitializing, setIsInitializing] = useState(true);

    useEffect(() => {
        // Determine the last sync time. If we don't have one, use 'now' as baseline.
        let lastSync = localStorage.getItem('lastSyncTime');
        if (!lastSync) {
            const now = Date.now();
            localStorage.setItem('lastSyncTime', now.toString());
            lastSync = now.toString();
        }

        const calculateTimes = () => {
            const now = Date.now();
            const lastSyncTime = parseInt(localStorage.getItem('lastSyncTime') || lastSync as string, 10);

            const diffMs = now - lastSyncTime;
            const diffMin = Math.floor(diffMs / (1000 * 60));

            let nextSyncIn = CYCLE_DURATION_MINUTES - (diffMin % CYCLE_DURATION_MINUTES);

            // If we just hit exactly 0 (or went over), reset the local storage to simulate a new cycle starting
            // and trigger the callback
            if (diffMin > 0 && diffMin % CYCLE_DURATION_MINUTES === 0) {
                // Only trigger if we haven't just freshly reset it
                if (nextSyncIn === CYCLE_DURATION_MINUTES) {
                    localStorage.setItem('lastSyncTime', now.toString());
                    if (onSyncExpired) {
                        onSyncExpired();
                    }
                    setMinutesSinceLastSync(0);
                    setMinutesUntilNextSync(CYCLE_DURATION_MINUTES);
                    return;
                }
            }

            setMinutesSinceLastSync(diffMin);
            setMinutesUntilNextSync(nextSyncIn);
            setIsInitializing(false);
        };

        // Calculate immediately
        calculateTimes();

        // Re-calculate every minute
        const interval = setInterval(calculateTimes, 60000);

        return () => clearInterval(interval);
    }, [onSyncExpired]);

    // Expose a way to force reset the timer if a manual sync happens
    const resetTimer = () => {
        localStorage.setItem('lastSyncTime', Date.now().toString());
        setMinutesSinceLastSync(0);
        setMinutesUntilNextSync(CYCLE_DURATION_MINUTES);
    };

    return { minutesSinceLastSync, minutesUntilNextSync, resetTimer, isInitializing };
}
