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

export type DockerStatusResult = {
    id: string;    
    state: string;
    isRunning: boolean;
};

export type ServerStatsResult = {
    cpuUsage: number;
    ramUsage: number;
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

        const responseText = await response.text();

        if (!response.ok) {
            console.error(`[Unraid API] Erreur HTTP ${response.status} - Body:`, responseText);
            throw new Error(`Erreur HTTP ${response.status}: ${responseText}`);
        }

        const json = JSON.parse(responseText);
        
        if (json.errors) {
            console.error("[Unraid API] Erreur GraphQL:", json.errors);
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

    public static async getContainerStatus(containerName: string): Promise<DockerStatusResult> {
        if (!containerName) return { id: "", state: "INCONNU", isRunning: false };

        const query = `
            query {
                docker {
                    containers {
                        id
                        names
                        state
                    }
                }
            }
        `;

        try {
            const data = await this.queryGraphQL(query);
            const containers = data?.docker?.containers || [];
            
            const targetContainer = containers.find((c: any) => {
                let cleanName = Array.isArray(c.names) ? c.names[0] : c.names;
                cleanName = cleanName.replace(/^\//, '');
                return cleanName.toLowerCase() === containerName.toLowerCase();
            });

            if (!targetContainer) {
                return { id: "", state: "INTROUVABLE", isRunning: false };
            }

            const currentState = targetContainer.state || "INCONNU";
            const isRunning = currentState.toLowerCase() === "running" || currentState.toLowerCase() === "started";

            return {
                id: targetContainer.id,
                state: currentState.toUpperCase(), 
                isRunning: isRunning
            };
        } catch (error) {
            console.error("[UnraidService] getContainerStatus:", error);
            return { id: "", state: "ERROR", isRunning: false };
        }
    }

    public static async getContainersList(): Promise<{label: string, value: string}[]> {
        const query = `
            query {
                docker {
                    containers {
                        names
                    }
                }
            }
        `;

        try {
            const data = await this.queryGraphQL(query);
            const containers = data?.docker?.containers || [];
            
            return containers
                .map((c: any) => {
                    let cleanName = Array.isArray(c.names) ? c.names[0] : c.names;
                    cleanName = cleanName.replace(/^\//, '');
                    
                    return { label: cleanName, value: cleanName };
                })
                .sort((a: any, b: any) => a.label.localeCompare(b.label));
        } catch (error) {
            console.error("[UnraidService] getContainersList erreur:", error);
            return [{ label: "Erreur API", value: "" }];
        }
    }

    public static async toggleContainer(containerId: string, currentState: string): Promise<void> {
        if (!containerId) throw new Error("ID du conteneur manquant");

        const isRunning = currentState.toLowerCase() === "running" || currentState.toLowerCase() === "started";
        
        const query = `
            mutation {
                docker {
                    ${isRunning ? 'stop' : 'start'}(id: "${containerId}") {
                        state
                    }
                }
            }
        `;

        try {
            await this.queryGraphQL(query);
            console.log(`[Unraid API] Commande ${isRunning ? 'stop' : 'start'} envoyée pour l'ID ${containerId}`);
        } catch (error) {
            console.error(`[UnraidService] Erreur lors du toggle de l'ID ${containerId}:`, error);
            throw error; 
        }
    }

    public static async getServerStats(): Promise<ServerStatsResult> {
        const query = `
            query {
                metrics {
                    memory {
                        percentTotal
                    }
                    cpu {
                        percentTotal
                    }
                }
            }
        `;

        try {
            const data = await this.queryGraphQL(query);
            
            const cpuUsage = data?.metrics?.cpu?.percentTotal || 0;
            const ramUsage = data?.metrics?.memory?.percentTotal || 0;

            return {
                cpuUsage: Math.round(cpuUsage),
                ramUsage: Math.round(ramUsage)
            };
        } catch (error) {
            console.error("[UnraidService] getServerStats:", error);
            return { cpuUsage: 0, ramUsage: 0 };
        }
    }
}