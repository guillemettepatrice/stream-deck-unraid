import { action, SingletonAction, WillAppearEvent } from "@elgato/streamdeck";
import { UnraidService } from "../services/unraid.service";
import { PollingService } from "../services/polling.service";
import { TemperatureStateView } from "../views/temperature-state.view";

@action({ UUID: "ca.qg-gbcm.streamdeck.unraid.temperaturestate" })
export class TemperatureState extends SingletonAction {
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
        const seconds = parseInt(settings.refreshRate || "10", 10); 
        
        PollingService.start(action.id, seconds, async () => {
            return await this.updateStatus(action);
        });
    }

    private async updateStatus(action: any): Promise<boolean> {
        try {
            const tempStats = await UnraidService.getTemperatures();
            
            if (tempStats.status === "ERROR") {
                await action.showAlert();
                return false;
            }

            const svg = TemperatureStateView.generate(
                tempStats.hottestName,
                tempStats.hottestValue,
                tempStats.status
            );
            await action.setImage(svg);
            
            return true;
        } catch (error) {
            console.error("[TemperatureState] Erreur:", error);
            await action.showAlert();
            return false;
        }
    }
}