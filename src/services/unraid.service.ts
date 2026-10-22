import streamDeck from "@elgato/streamdeck";

export type GlobalSettings = {
    unraidHost?: string;
    apiKey?: string;
};

export type ArrayStatusResult = {
    state: string;
    totalSize: number;
    freeSpace: number;
};

export class UnraidService {
    /**
     * Méthode générique pour exécuter n'importe quelle requête GraphQL vers Unraid
     */
    public static async queryGraphQL(query: string): Promise<any> {
        const settings = await streamDeck.settings.getGlobalSettings<GlobalSettings>();
        
        if (!settings.unraidHost || !settings.apiKey) {
            throw new Error("Configuration Unraid manquante");
        }

        const baseUrl = settings.unraidHost.replace(/\/$/, '');
        const endpoint = `${baseUrl}/graphql`;
        
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": settings.apiKey,
                "Authorization": `Bearer ${settings.apiKey}`
            },
            body: JSON.stringify({ query })
        });

        if (!response.ok) {
            throw new Error(`Erreur HTTP ${response.status}`);
        }

        const json = await response.json();
        if (json.errors) {
            throw new Error(`Erreur GraphQL: ${JSON.stringify(json.errors)}`);
        }

        return json.data;
    }

    /**
     * Méthode spécifique pour récupérer l'état de la grappe de disques
     */
    public static async getArrayStatus(): Promise<ArrayStatusResult> {
        const query = `
            query {
                array {
                    state
                    disks {
                        status
                        fsSize
                        fsFree
                    }
                }
            }
        `;

        try {
            const data = await this.queryGraphQL(query);
            const arrayData = data?.array || {};
            const disks = arrayData.disks || [];
            
            let totalSize = 0;
            let totalFree = 0;

            for (const disk of disks) {
                if (disk.fsSize && disk.status === 'DISK_OK') {
                    totalSize += Number(disk.fsSize);
                    totalFree += Number(disk.fsFree);
                }
            }

            return {
                state: arrayData.state || "INCONNU",
                freeSpace: totalFree,
                totalSize: totalSize
            };
        } catch (error) {
            console.error("[UnraidService] getArrayStatus:", error);
            return { state: "Error", freeSpace: 0, totalSize: 0 };
        }
    }
}