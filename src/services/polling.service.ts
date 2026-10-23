export class PollingService {
    private static timeouts: Map<string, NodeJS.Timeout> = new Map();
    private static errorCounts: Map<string, number> = new Map();

    public static start(
        actionId: string, 
        baseIntervalSeconds: number, 
        callback: () => Promise<boolean> 
    ): void {
        this.stop(actionId);
        
        const executePoll = async () => {
            const success = await callback();
            let currentErrors = this.errorCounts.get(actionId) || 0;

            if (success) {
                this.errorCounts.set(actionId, 0);
                currentErrors = 0;
            } else {
                currentErrors = Math.min(currentErrors + 1, 6);
                this.errorCounts.set(actionId, currentErrors);
            }

            const baseMs = baseIntervalSeconds * 1000;
            const multiplier = Math.pow(2, currentErrors);
            const nextDelay = Math.min(baseMs * multiplier, 60000); 

            const timeoutId = setTimeout(executePoll, nextDelay);
            this.timeouts.set(actionId, timeoutId);
            
        };

        executePoll();
    }

    public static stop(actionId: string): void {
        const timeoutId = this.timeouts.get(actionId);
        if (timeoutId) {
            clearTimeout(timeoutId);
            this.timeouts.delete(actionId);
            this.errorCounts.delete(actionId);
        }
    }
}