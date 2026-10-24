import streamDeck, { action } from "@elgato/streamdeck";
import { UnraidService } from "../services/unraid.service";
import { NetworkStateView } from "../views/network-state.view";
import { BasePollingAction } from "./base-polling.action";

@action({ UUID: "ca.qg-gbcm.streamdeck.unraid.networkstate" })
export class NetworkState extends BasePollingAction {
    protected defaultRefreshRate = "2";

    public override async onSendToPlugin(ev: any): Promise<void> {
        
        const eventName = ev.payload?.event || ev.payload?.payload?.event;

        if (eventName === "getInterfacesList") {
            try {
                const interfaces = await UnraidService.getNetworkInterfacesList();
                
                await streamDeck.ui.sendToPropertyInspector({
                    event: "getInterfacesList",
                    items: interfaces
                });
            } catch (error) {
                console.error("[NetworkState] ❌ Erreur:", error);
                await streamDeck.ui.sendToPropertyInspector({
                    event: "getInterfacesList",
                    items: [{ label: "Erreur API", value: "" }]
                });
            }
        }
    }

    protected async updateStatus(action: any): Promise<boolean> {
        try {
            const settings = await action.getSettings();
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
            console.error("[NetworkState] Erreur lors de la mise à jour:", error);
            await action.showAlert();
            return false;
        }
    }
}