import { formatBytes } from "../utils/formatters";

export class ArrayStateView {
    public static render(rawState: string, displayState: string, freeBytes: number, totalBytes: number, freeText: string = "libre"): string {
        let bgColor = "#444444";
        
        // La logique de couleur utilise toujours l'état brut de l'API
        switch(rawState.toUpperCase()) {
            case "STARTED": bgColor = "#28a745"; break;
            case "STOPPED": bgColor = "#6c757d"; break;
            case "PARITY CHECK":
            case "PARITY_CHECK": bgColor = "#ffc107"; break;
            case "ERROR": bgColor = "#dc3545"; break;
            case "NO CONFIG": bgColor = "#dc3545"; break;
        }

        const freeStr = formatBytes(freeBytes);
        const percent = totalBytes > 0 ? (totalBytes - freeBytes) / totalBytes : 0;
        const barMaxWidth = 120;
        const barWidth = Math.max(0, Math.min(barMaxWidth, barMaxWidth * percent));

        const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144">
            <rect width="144" height="144" fill="${bgColor}" rx="15" />
            <text x="72" y="55" font-family="sans-serif" font-size="20" font-weight="bold" fill="white" text-anchor="middle">
                ${displayState} <!-- Affichage de l'état traduit -->
            </text>
            <text x="72" y="85" font-family="sans-serif" font-size="14" fill="white" text-anchor="middle">
                ${freeStr} ${freeText}
            </text>
            <rect x="12" y="100" width="${barMaxWidth}" height="14" fill="rgba(0,0,0,0.4)" rx="7" />
            <rect x="12" y="100" width="${barWidth}" height="14" fill="white" rx="7" />
        </svg>`;
        
        return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
    }
}