export class NetworkStateView {
    public static generate(rxMb: number, txMb: number, interfaceName: string): string {
        const bgColor = "#1C1C1C";
        const rxColor = "#3A82F6"; // Bleu (Download)
        const txColor = "#15C370"; // Vert (Upload)
        const textColor = "#FFFFFF";

        // Formater les valeurs (si < 1 MB/s, on affiche en KB/s pour plus de précision)
        const formatSpeed = (mbps: number) => {
            if (mbps < 1) return `${Math.round(mbps * 1024)} KB/s`;
            return `${mbps.toFixed(1)} MB/s`;
        };

        const rxText = formatSpeed(rxMb);
        const txText = formatSpeed(txMb);

        const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 144">
                <rect width="144" height="144" rx="24" fill="${bgColor}"/>
                
                <!-- Interface Name -->
                <text x="72" y="24" font-family="sans-serif" font-size="14" font-weight="bold" fill="#777777" text-anchor="middle">${interfaceName.toUpperCase()}</text>

                <!-- Zone Download (RX) -->
                <path d="M 25 45 L 45 45 L 35 65 Z" fill="${rxColor}"/>
                <rect x="31" y="35" width="8" height="12" fill="${rxColor}"/>
                <text x="130" y="55" font-family="sans-serif" font-size="20" font-weight="bold" fill="${textColor}" text-anchor="end">${rxText}</text>

                <!-- Ligne de séparation -->
                <line x1="20" y1="72" x2="124" y2="72" stroke="#333333" stroke-width="2" />

                <!-- Zone Upload (TX) -->
                <path d="M 25 105 L 45 105 L 35 85 Z" fill="${txColor}"/>
                <rect x="31" y="103" width="8" height="12" fill="${txColor}"/>
                <text x="130" y="105" font-family="sans-serif" font-size="20" font-weight="bold" fill="${textColor}" text-anchor="end">${txText}</text>
            </svg>
        `;
        
        return `data:image/svg+xml;charset=utf8,${encodeURIComponent(svg.trim())}`;
    }
}