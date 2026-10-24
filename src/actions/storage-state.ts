import { action, SingletonAction, WillAppearEvent } from "@elgato/streamdeck";
import { UnraidService } from "../services/unraid.service";
import { PollingService } from "../services/polling.service";
import { StorageStateView } from "../views/storage-state.view";

@action({ UUID: "ca.qg-gbcm.streamdeck.unraid.storagestate" })
export class StorageState extends SingletonAction {
    override async onWillAppear(ev: WillAppearEvent<any>): Promise<void> {
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
        const seconds = parseInt(settings.refreshRate || "60", 10); // Le stockage change lentement, 60s par défaut
        
        PollingService.start(action.id, seconds, async () => {
            return await this.updateStatus(action);
        });
    }

    private async updateStatus(action: any): Promise<boolean> {
        try {
            const storage = await UnraidService.getStorageCapacity();
            
            if (storage.totalGb === 0) {
                await action.showAlert();
                return false;
            }

            const svg = StorageStateView.generate(storage.usedPercentage, storage.freeGb);
            await action.setImage(svg);
            
            return true;
        } catch (error) {
            console.error("[StorageState] Erreur lors de la mise à jour:", error);
            await action.showAlert();
            return false;
        }
    }
}