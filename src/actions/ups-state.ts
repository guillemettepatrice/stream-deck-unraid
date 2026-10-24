import { action, SingletonAction } from "@elgato/streamdeck";
import { UnraidService } from "../services/unraid.service";
import { PollingService } from "../services/polling.service";
import { UpsStateView } from "../views/ups-state.view";

@action({ UUID: "ca.qg-gbcm.streamdeck.unraid.upsstate" })
export class UpsState extends SingletonAction {
    override async onWillAppear(ev: any): Promise<void> {
        await this.managePolling(ev.action);
    }

    override onWillDisappear(ev: any): void {
        PollingService.stop(ev.action.id);
    }

    override async onDidReceiveSettings(ev: any): Promise<void> {
        await this.managePolling(ev.action);
    }

    private async managePolling(action: any): Promise<void> {
        const settings = await action.getSettings();
        const seconds = parseInt(settings.refreshRate || "5", 10);
        
        PollingService.start(action.id, seconds, async () => {
            return await this.updateStatus(action);
        });
    }

    private async updateStatus(action: any): Promise<boolean> {
        try {
            const upsData = await UnraidService.getUpsStatus();
            
            // Si l'API retourne une erreur, on fait échouer le polling pour ralentir les requêtes
            if (upsData.status === "ERROR" || upsData.status === "INTROUVABLE") {
                await action.showAlert();
                return false;
            }

            // Génère l'image SVG dynamique et l'envoie au Stream Deck
            const svg = UpsStateView.generate(
                upsData.status, 
                upsData.batteryCharge, 
                upsData.load
            );
            await action.setImage(svg);
            
            return true; 
        } catch (error) {
            console.error("[UpsState] Erreur lors de la mise à jour:", error);
            await action.showAlert();
            return false;
        }
    }
}