import { action } from "@elgato/streamdeck";
import { UnraidService } from "../services/unraid.service";
import { UpsStateView } from "../views/ups-state.view";
import { BasePollingAction } from "./base-polling.action";

@action({ UUID: "ca.qg-gbcm.streamdeck.unraid.upsstate" })
export class UpsState extends BasePollingAction {
    protected defaultRefreshRate = "10";

    protected async updateStatus(action: any): Promise<boolean> {
        try {
            const settings = await action.getSettings();

            const status = await UnraidService.getUpsStatus();
            
            await action.setImage(UpsStateView.generate(
                status.status, 
                status.batteryCharge, 
                status.load 
            ));
            
            return true;
        } catch (error) {
            console.error("[UpsState] Erreur lors de la mise à jour:", error);
            await action.showAlert();
            return false;
        }
    }
}