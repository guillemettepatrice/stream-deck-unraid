import streamDeck, { action } from "@elgato/streamdeck";
import { UnraidService } from "../services/unraid.service";
import { VmStateView } from "../views/vm-state.view";
import { BasePollingAction } from "./base-polling.action";

@action({ UUID: "ca.qg-gbcm.streamdeck.unraid.vmstate" })
export class VmState extends BasePollingAction {
    protected defaultRefreshRate = "5";

    public override async onSendToPlugin(ev: any): Promise<void> {
        const eventName = ev.payload?.event || ev.payload?.payload?.event;

        if (eventName === "getVmsList") {
            try {
                const vms = await UnraidService.getVmsList();
                await streamDeck.ui?.sendToPropertyInspector({
                    event: "getVmsList",
                    items: vms
                });
            } catch (error) {
                await streamDeck.ui?.sendToPropertyInspector({
                    event: "getVmsList",
                    items: [{ label: "Erreur API", value: "" }]
                });
            }
        }
    }

    protected async updateStatus(action: any): Promise<boolean> {
        try {
            const settings = await action.getSettings();
            const vmId = settings.vmId; 
            
            if (!vmId) return false;

            const status = await UnraidService.getVmStatus(vmId);
            await action.setImage(VmStateView.generate(settings.vmId, status.isRunning));
            
            return true;
        } catch (error) {
            await action.showAlert();
            return false;
        }
    }
}