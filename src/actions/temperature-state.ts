import { action } from "@elgato/streamdeck";
import { UnraidService } from "../services/unraid.service";
import { TemperatureStateView } from "../views/temperature-state.view";
import { BasePollingAction } from "./base-polling.action";

@action({ UUID: "ca.qg-gbcm.streamdeck.unraid.temperaturestate" })
export class TemperatureState extends BasePollingAction {
    protected defaultRefreshRate = "15";

    protected async updateStatus(action: any): Promise<boolean> {
        try {
            const settings = await action.getSettings();

            const temp = await UnraidService.getTemperatures();
            
            await action.setImage(TemperatureStateView.generate(
                temp.hottestName,
                temp.hottestValue,
                temp.status
            ));
            
            return true;
        } catch (error) {
            console.error("[TemperatureState] Erreur lors de la mise à jour:", error);
            await action.showAlert();
            return false;
        }
    }
}