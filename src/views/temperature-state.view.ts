export class TemperatureStateView {
    public static generate(hottestName: string, hottestValue: number, status: string): string {
        const bgColor = "#1C1C1C";
        
        let mainColor = "#15C370";
        if (status === "WARNING") mainColor = "#FFA500"; 
        if (status === "CRITICAL" || status === "ERROR") mainColor = "#FF3B30";

        const shortName = hottestName.substring(0, 12).toUpperCase();

        const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 144">
                <rect width="144" height="144" rx="24" fill="${bgColor}"/>
                
                <!-- Titre (Nom du capteur le plus chaud) -->
                <text x="72" y="28" font-family="sans-serif" font-size="14" font-weight="bold" fill="#777777" text-anchor="middle">${shortName}</text>
                
                <!-- Icône Thermomètre -->
                <path d="M 60 55 C 60 48 64 42 72 42 C 80 42 84 48 84 55 L 84 80 C 88 84 90 90 88 96 C 85 104 78 108 72 108 C 66 108 59 104 56 96 C 54 90 56 84 60 80 Z" fill="none" stroke="${mainColor}" stroke-width="6" stroke-linejoin="round"/>
                <circle cx="72" cy="94" r="8" fill="${mainColor}"/>
                <line x1="72" y1="94" x2="72" y2="65" stroke="${mainColor}" stroke-width="6" stroke-linecap="round"/>
                
                <!-- Valeur en degrés -->
                <text x="72" y="132" font-family="sans-serif" font-size="24" font-weight="bold" fill="${mainColor}" text-anchor="middle">${hottestValue}°C</text>
            </svg>
        `;
        
        return `data:image/svg+xml;charset=utf8,${encodeURIComponent(svg.trim())}`;
    }
}