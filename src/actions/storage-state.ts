import { action } from "@elgato/streamdeck";
import { UnraidService } from "../services/unraid.service";
import { StorageStateView } from "../views/storage-state.view";
import { BasePollingAction } from "./base-polling.action";

@action({ UUID: "ca.qg-gbcm.streamdeck.unraid.storagestate" })
export class StorageState extends BasePollingAction {
    protected defaultRefreshRate = "60";

    protected async updateStatus(action: any): Promise<boolean> {
        try {

            const status = await UnraidService.getStorageCapacity();
            await action.setImage(StorageStateView.generate(
                status.usedPercentage, 
                status.freeGb
            ));
            
            return true;
        } catch (error) {
            console.error("[StorageState] Erreur lors de la mise à jour:", error);
            await action.showAlert();
            return false;
        }
    }
}