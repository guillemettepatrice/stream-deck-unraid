export class DockerStateView {
    public static render(containerName: string, state: string, isRunning: boolean): string {
        let bgColor = isRunning ? "#28a745" : "#6c757d";
        if (state.toUpperCase() === "ERROR" || state.toUpperCase() === "INTROUVABLE") {
            bgColor = "#dc3545";
        }

        const displayName = containerName.length > 13 
            ? containerName.substring(0, 11) + "..." 
            : (containerName || "Config requise");

        const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144">
            <rect width="144" height="144" fill="${bgColor}" rx="15" />
            <!-- État -->
            <text x="72" y="60" font-family="sans-serif" font-size="18" font-weight="bold" fill="white" text-anchor="middle">
                ${state}
            </text>
            <!-- Ligne de séparation -->
            <line x1="20" y1="75" x2="124" y2="75" stroke="rgba(255,255,255,0.3)" stroke-width="2" />
            <!-- Nom du conteneur -->
            <text x="72" y="105" font-family="sans-serif" font-size="16" fill="white" text-anchor="middle">
                ${displayName}
            </text>
        </svg>`;
        
        return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
    }
}