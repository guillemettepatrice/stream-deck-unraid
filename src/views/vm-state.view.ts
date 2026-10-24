export class VmStateView {
    public static generate(vmName: string, isRunning: boolean): string {
        const mainColor = isRunning ? "#15C370" : "#555555"; // Vert ou Gris
        const bgColor = "#1C1C1C";
        const textColor = "#FFFFFF";

        const displayName = vmName ? vmName.substring(0, 10) : "No VM";

        const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 144">
                <rect width="144" height="144" rx="24" fill="${bgColor}"/>
                
                <!-- Écran de la VM -->
                <rect x="22" y="30" width="100" height="70" rx="6" fill="none" stroke="${mainColor}" stroke-width="6"/>
                <line x1="22" y1="80" x2="122" y2="80" stroke="${mainColor}" stroke-width="4"/>
                
                <!-- Pied du moniteur -->
                <path d="M 60 100 L 50 115 L 94 115 L 84 100 Z" fill="${mainColor}"/>
                
                <!-- Nom de la VM -->
                <text x="72" y="62" font-family="sans-serif" font-size="16" font-weight="bold" fill="${textColor}" text-anchor="middle">${displayName}</text>
                
                <!-- État textuel -->
                <text x="72" y="132" font-family="sans-serif" font-size="14" font-weight="bold" fill="${mainColor}" text-anchor="middle">${isRunning ? 'RUNNING' : 'STOPPED'}</text>
            </svg>
        `;
        
        return `data:image/svg+xml;charset=utf8,${encodeURIComponent(svg.trim())}`;
    }
}