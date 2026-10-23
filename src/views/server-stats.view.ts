export class ServerStatsView {
    public static render(cpuUsage: number, ramUsage: number): string {
        const bgColor = "#333333";
        const barMaxWidth = 110;
        
        const cpuWidth = Math.max(0, Math.min(barMaxWidth, barMaxWidth * (cpuUsage / 100)));
        const ramWidth = Math.max(0, Math.min(barMaxWidth, barMaxWidth * (ramUsage / 100)));

        const getBarColor = (usage: number) => usage > 85 ? "#dc3545" : "#5881e0";

        const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144">
            <rect width="144" height="144" fill="${bgColor}" rx="15" />
            
            <!-- CPU Section -->
            <text x="16" y="40" font-family="sans-serif" font-size="16" font-weight="bold" fill="white">CPU</text>
            <text x="128" y="40" font-family="sans-serif" font-size="16" fill="white" text-anchor="end">${cpuUsage}%</text>
            <rect x="16" y="50" width="${barMaxWidth}" height="10" fill="rgba(255,255,255,0.2)" rx="5" />
            <rect x="16" y="50" width="${cpuWidth}" height="10" fill="${getBarColor(cpuUsage)}" rx="5" />

            <!-- RAM Section -->
            <text x="16" y="90" font-family="sans-serif" font-size="16" font-weight="bold" fill="white">RAM</text>
            <text x="128" y="90" font-family="sans-serif" font-size="16" fill="white" text-anchor="end">${ramUsage}%</text>
            <rect x="16" y="100" width="${barMaxWidth}" height="10" fill="rgba(255,255,255,0.2)" rx="5" />
            <rect x="16" y="100" width="${ramWidth}" height="10" fill="${getBarColor(ramUsage)}" rx="5" />
        </svg>`;
        
        return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
    }
}