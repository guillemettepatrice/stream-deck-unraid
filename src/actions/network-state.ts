import streamDeck, { action,  WillAppearEvent,   SingletonAction } from "@elgato/streamdeck";
import { UnraidService } from "../services/unraid.service";
import { PollingService } from "../services/polling.service";
import { NetworkStateView } from "../views/network-state.view";

@action({ UUID: "ca.qg-gbcm.streamdeck.unraid.networkstate" })
export class NetworkState extends SingletonAction {
    override async onWillAppear(ev: WillAppearEvent<any>): Promise<void> {
        await this.managePolling(ev.action);
    }

    override onWillDisappear(ev: any): void {
        PollingService.stop(ev.action.id);
    }

    override async onDidReceiveSettings(ev: any): Promise<void> {
        await this.updateStatus(ev.action);
        await this.managePolling(ev.action);
    }

    override async onSendToPlugin(ev: any): Promise<void> {
        const payload = ev.payload as { event?: string };

        
        if (payload?.event === "getInterfacesList" || payload?.payload?.event === "getInterfacesList") {
            try {
                const interfaces = await UnraidService.getNetworkInterfacesList();
                
                if (streamDeck.ui) {
                        await streamDeck.ui.sendToPropertyInspector({
                            event: "getInterfacesList",
                            items: interfaces
                        });
                    }
            } catch (error) {
                if (streamDeck.ui) {
                    await streamDeck.ui.sendToPropertyInspector({
                        event: "getInterfacesList",
                        items: [{ label: "Erreur API", value: "" }]
                    });
                }
            }
        }
    }

    private async managePolling(action: any): Promise<void> {
        const settings = await action.getSettings();
        const seconds = parseInt(settings.refreshRate || "2", 10); 
        
        PollingService.start(action.id, seconds, async () => {
            return await this.updateStatus(action);
        });
    }


    private async updateStatus(action: any): Promise<boolean> {
        try {
            const settings = await action.getSettings();
            // Permettre de configurer 'eth0', 'br0', etc. via l'inspecteur plus tard
            const targetInterface = settings.interfaceName || "eth0"; 

            const networkStats = await UnraidService.getNetworkStats(targetInterface);
            
            if (networkStats.interfaceName === "ERROR") {
                await action.showAlert();
                return false;
            }

            const svg = NetworkStateView.generate(
                networkStats.rxMegabytes, 
                networkStats.txMegabytes, 
                networkStats.interfaceName
            );
            await action.setImage(svg);
            
            return true;
        } catch (error) {
            console.error("[NetworkState] Erreur:", error);
            await action.showAlert();
            return false;
        }
    }
}