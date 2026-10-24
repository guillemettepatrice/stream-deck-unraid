export class UpsStateView {
    public static generate(status: string, batteryCharge: number, load: number): string {
        // Alerte si l'onduleur passe sur batterie ou si la charge est <= 20%
        const isAlert = status.toLowerCase() !== "online" || batteryCharge <= 20;
        const mainColor = isAlert ? "#FF3B30" : "#15C370"; // Rouge ou Vert Unraid
        const bgColor = "#1C1C1C";
        const textColor = "#FFFFFF";

        // Calcule la largeur de la jauge intérieure (max 80px)
        const fillWidth = Math.max(0, Math.min(80, (batteryCharge / 100) * 80));
        
        // Formate le statut pour qu'il soit court (ex: ONLINE, ONBATT)
        const displayStatus = status.substring(0, 8).toUpperCase();

        const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 144">
                <rect width="144" height="144" rx="24" fill="${bgColor}"/>
                
                <!-- Statut (Haut) -->
                <text x="72" y="28" font-family="sans-serif" font-size="16" font-weight="bold" fill="${mainColor}" text-anchor="middle">${displayStatus}</text>
                
                <!-- Contour de la batterie -->
                <rect x="25" y="45" width="86" height="40" rx="4" fill="none" stroke="${textColor}" stroke-width="4"/>
                <path d="M 115 55 v 20" stroke="${textColor}" stroke-width="4" stroke-linecap="round"/>
                
                <!-- Remplissage de la batterie -->
                <rect x="28" y="48" width="${fillWidth}" height="34" rx="2" fill="${mainColor}"/>
                
                <!-- Pourcentage à l'intérieur -->
                <text x="68" y="69" font-family="sans-serif" font-size="18" font-weight="bold" fill="${batteryCharge > 40 ? bgColor : textColor}" text-anchor="middle" dominant-baseline="middle">${Math.round(batteryCharge)}%</text>
                
                <!-- Charge en Watts (Bas) -->
                <text x="72" y="118" font-family="sans-serif" font-size="22" font-weight="bold" fill="${textColor}" text-anchor="middle">${Math.round(load)} W</text>
            </svg>
        `;
        
        // Retourne le SVG sous forme d'URI compatible Stream Deck
        return `data:image/svg+xml;charset=utf8,${encodeURIComponent(svg.trim())}`;
    }
}