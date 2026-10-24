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

export type UpsStatusResult = {
    name: string;
    status: string;
    batteryCharge: number;
    load: number;
    timeleft: number;
};

export type StorageStatusResult = {
    totalGb: number;
    freeGb: number;
    usedGb: number;
    usedPercentage: number;
};

export type NetworkStatusResult = {
    interfaceName: string;
    rxMegabytes: number; 
    txMegabytes: number; 
};

export type TempStatusResult = {
    average: number;
    hottestName: string;
    hottestValue: number;
    status: string; 
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
        } catch (error) {
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

    public static async getUpsStatus(): Promise<UpsStatusResult> {
        const query = `
            query {
                upsDevices {
                    name
                    status
                    battery {
                        chargeLevel
                        estimatedRuntime
                    }
                    power {
                        currentPower
                    }
                }
            }
        `;

        try {
            const data = await this.queryGraphQL(query);
            const upsData = data?.upsDevices?.[0];

            if (!upsData) {
                return { name: "INCONNU", status: "INTROUVABLE", batteryCharge: 0, load: 0, timeleft: 0 };
            }

            return {
                name: upsData.name || "UPS",
                status: upsData.status || "INCONNU",
                batteryCharge: upsData.battery?.chargeLevel || 0,
                load: upsData.power?.currentPower || 0,
                timeleft: upsData.battery?.estimatedRuntime || 0
            };
        } catch (error) {
            console.error("[UnraidService] getUpsStatus:", error);
            return { name: "ERROR", status: "ERROR", batteryCharge: 0, load: 0, timeleft: 0 };
        }
    }

    public static async getVmsList(): Promise<{label: string, value: string}[]> {
        const query = `
            query {
                vms {
                    domains {
                        id
                        name
                    }
                }
            }
        `;

        try {
            const data = await this.queryGraphQL(query);
            const vms = data?.vms?.domains || [];
            
            return vms
                .filter((vm: any) => vm.name)
                .map((vm: any) => {
                    return { label: vm.name, value: vm.id }; 
                })
                .sort((a: any, b: any) => a.label.localeCompare(b.label));
        } catch (error) {
            console.error("[UnraidService] getVmsList erreur:", error);
            return [{ label: "Erreur API", value: "" }];
        }
    }
    public static async getVmStatus(vmId: string): Promise<{ id: string, state: string, isRunning: boolean }> {
        if (!vmId) return { id: "", state: "INCONNU", isRunning: false };

        const query = `
            query {
                vms {
                    domains {
                        id
                        state
                    }
                }
            }
        `;

        try {
            const data = await this.queryGraphQL(query);
            const domains = data?.vms?.domains || [];
            const targetVm = domains.find((vm: any) => vm.id === vmId);

            if (!targetVm) {
                return { id: "", state: "INTROUVABLE", isRunning: false };
            }

            const currentState = targetVm.state || "INCONNU";
            const isRunning = currentState === "RUNNING";

            return {
                id: targetVm.id,
                state: currentState,
                isRunning: isRunning
            };
        } catch (error) {
            console.error("[UnraidService] getVmStatus:", error);
            return { id: "", state: "ERROR", isRunning: false };
        }
    }

    public static async toggleVm(vmId: string, currentState: string): Promise<void> {
        if (!vmId) throw new Error("ID de la VM manquant");

        const isRunning = currentState === "RUNNING";
        const action = isRunning ? "stop" : "start"; 
        
        const query = `
            mutation {
                vm {
                    ${action}(id: "${vmId}")
                }
            }
        `;

        try {
            await this.queryGraphQL(query);
        } catch (error) {
            throw error;
        }
    }

    public static async getStorageCapacity(): Promise<StorageStatusResult> {
        const query = `
            query {
                array {
                    capacity {
                        kilobytes {
                            free
                            total
                            used
                        }
                    }
                }
            }
        `;

        try {
            const data = await this.queryGraphQL(query);
            const kbData = data?.array?.capacity?.kilobytes;

            if (!kbData || !kbData.total) {
                return { totalGb: 0, freeGb: 0, usedGb: 0, usedPercentage: 0 };
            }

            const kbToGb = (kb: string) => Math.round(Number(kb) / 1024 / 1024);
            
            const totalGb = kbToGb(kbData.total);
            const freeGb = kbToGb(kbData.free);
            const usedGb = kbToGb(kbData.used);
            
            const usedPercentage = totalGb > 0 ? Math.round((usedGb / totalGb) * 100) : 0;

            return { totalGb, freeGb, usedGb, usedPercentage };
        } catch (error) {
            console.error("[UnraidService] getStorageCapacity:", error);
            return { totalGb: 0, freeGb: 0, usedGb: 0, usedPercentage: 0 };
        }
    }

    public static async getNetworkStats(targetInterface: string = "eth0"): Promise<NetworkStatusResult> {
        const query = `
            query {
                metrics {
                    network {
                        operstate
                        name
                        rxSec
                        txSec
                    }
                }
            }
        `;

        try {
            const data = await this.queryGraphQL(query);
            const interfaces = data?.metrics?.network || [];
            
            const netInfo = interfaces.find((i: any) => i.name === targetInterface) || interfaces[0];

            if (!netInfo) {
                return { interfaceName: "N/A", rxMegabytes: 0, txMegabytes: 0 };
            }

            const bytesToMb = (bytes: number) => bytes / 1024 / 1024;

            return {
                interfaceName: netInfo.name || "eth0",
                rxMegabytes: bytesToMb(netInfo.rxSec || 0),
                txMegabytes: bytesToMb(netInfo.txSec || 0)
            };
        } catch (error) {
            console.error("[UnraidService] getNetworkStats:", error);
            return { interfaceName: "ERROR", rxMegabytes: 0, txMegabytes: 0 };
        }
    }

    public static async getTemperatures(): Promise<TempStatusResult> {
        const query = `
            query {
                metrics {
                    temperature {
                        summary {
                            average
                            hottest {
                                name
                                current {
                                    value
                                    status
                                }
                            }
                        }
                    }
                }
            }
        `;

        try {
            const data = await this.queryGraphQL(query);
            const tempSummary = data?.metrics?.temperature?.summary;

            if (!tempSummary || !tempSummary.hottest) {
                return { average: 0, hottestName: "N/A", hottestValue: 0, status: "UNKNOWN" };
            }

            return {
                average: Math.round(tempSummary.average || 0),
                hottestName: tempSummary.hottest.name || "Sensor",
                hottestValue: Math.round(tempSummary.hottest.current?.value || 0),
                status: tempSummary.hottest.current?.status || "NORMAL"
            };
        } catch (error) {
            console.error("[UnraidService] getTemperatures:", error);
            return { average: 0, hottestName: "ERROR", hottestValue: 0, status: "ERROR" };
        }
    }

    public static async getNetworkInterfacesList(): Promise<{label: string, value: string}[]> {
        const query = `
            query {
                info {
                    networkInterfaces {
                        name
                        description
                        virtual
                        ipv4Addresses {
                            address    
                        }
                    }
                }
            }
        `;

        try {
            const data = await this.queryGraphQL(query);
            const interfaces = data?.info?.networkInterfaces || [];
            return interfaces.filter((net: any) => !net.virtual).map((net: any) => {
                const label = net.description ? `${net.name} - ${net.description}` : net.name;
                return { label: label + ' [' + (net.ipv4Addresses && net.ipv4Addresses[0]?.address ? net.ipv4Addresses[0]?.address : 'N/A') + ']', value: net.name };
            });
        } catch (error) {
            console.error("[UnraidService] getNetworkInterfacesList erreur:", error);
            return [{ label: "Erreur API", value: "" }];
        }
    }
}