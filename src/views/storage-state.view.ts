export class StorageStateView {
    public static generate(usedPercentage: number, freeGb: number): string {
        const isWarning = usedPercentage >= 90;
        const mainColor = isWarning ? "#FF3B30" : "#5881e0";
        const bgColor = "#1C1C1C";
        const trackColor = "#333333";
        const textColor = "#FFFFFF";

        const radius = 45;
        const circumference = 2 * Math.PI * radius;
        const fillAmount = (usedPercentage / 100) * circumference;
        const emptyAmount = circumference - fillAmount;

        const freeText = freeGb >= 1000 ? `${(freeGb / 1024).toFixed(1)}T` : `${freeGb}G`;

        const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 144">
                <rect width="144" height="144" rx="24" fill="${bgColor}"/>
                
                <!-- Titre Haut -->
                <text x="72" y="24" font-family="sans-serif" font-size="16" font-weight="bold" fill="${textColor}" text-anchor="middle">ARRAY</text>
                
                <!-- Cercle de fond (Track) -->
                <circle cx="72" cy="76" r="${radius}" fill="none" stroke="${trackColor}" stroke-width="12" />
                
                <!-- Cercle de progression (Value) -->
                <!-- L'attribut transform fait pivoter le cercle pour qu'il commence en haut (-90 deg) -->
                <circle cx="72" cy="76" r="${radius}" fill="none" stroke="${mainColor}" stroke-width="12" stroke-linecap="round"
                        stroke-dasharray="${fillAmount} ${emptyAmount}" 
                        transform="rotate(-90 72 76)" />
                
                <!-- Pourcentage au centre -->
                <text x="72" y="82" font-family="sans-serif" font-size="22" font-weight="bold" fill="${textColor}" text-anchor="middle">${usedPercentage}%</text>
                
                <!-- Espace libre en bas -->
                <text x="72" y="132" font-family="sans-serif" font-size="15" font-weight="bold" fill="${mainColor}" text-anchor="middle">${freeText} FREE</text>
            </svg>
        `;
        
        return `data:image/svg+xml;charset=utf8,${encodeURIComponent(svg.trim())}`;
    }
}