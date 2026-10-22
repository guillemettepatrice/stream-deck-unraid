export class PollingService {
    private static intervals: Map<string, NodeJS.Timeout> = new Map();

  
    public static start(actionId: string, seconds: number, callback: () => void): void {
        this.stop(actionId);

        const safeSeconds = isNaN(seconds) || seconds < 5 ? 30 : seconds;
        const interval = setInterval(callback, safeSeconds * 1000);

        this.intervals.set(actionId, interval);
        
        console.log(`[PollingService] Timer actif pour ${actionId} (${safeSeconds}s)`);
    }

 
    public static stop(actionId: string): void {
        const interval = this.intervals.get(actionId);
        if (interval) {
            clearInterval(interval);
            this.intervals.delete(actionId);
            console.log(`[PollingService] Timer arrêté pour ${actionId}`);
        }
    }


    public static stopAll(): void {
        for (const [id, interval] of this.intervals.entries()) {
            clearInterval(interval);
        }
        this.intervals.clear();
        console.log("[PollingService] Tous les timers ont été arrêtés.");
    }
}