import { action, KeyDownEvent, SingletonAction, WillAppearEvent } from "@elgato/streamdeck";
import { UnraidService } from "../services/unraid.service";
import { PollingService } from "../services/polling.service";
import { VmStateView } from "../views/vm-state.view";

@action({ UUID: "ca.qg-gbcm.streamdeck.unraid.vmstate" })
export class VmState extends SingletonAction {
    override async onWillAppear(ev: WillAppearEvent<any>): Promise<void> {
        await this.managePolling(ev.action);
    }

    override onWillDisappear(ev: any): void {
        PollingService.stop(ev.action.id);
    }

    override async onDidReceiveSettings(ev: any): Promise<void> {
        await this.managePolling(ev.action);
    }

    override async onKeyDown(ev: KeyDownEvent<any>): Promise<void> {
        const settings = await ev.action.getSettings();
        if (!settings.vmId) {
            await ev.action.showAlert();
            return;
        }

        try {
            const status = await UnraidService.getVmStatus(settings.vmId);
            await UnraidService.toggleVm(settings.vmId, status.state);
            await ev.action.showOk();
            // Force une mise à jour visuelle rapide
            setTimeout(() => this.updateStatus(ev.action), 1500);
        } catch (error) {
            await ev.action.showAlert();
        }
    }

    public override async onSendToPlugin(ev: any): Promise<void> {
        const payload = ev.payload as { event?: string };
        
        if (payload?.event === "getVmsList") {
            try {
                // On récupère la liste via GraphQL
                const vms = await UnraidService.getVmsList();
                
                // On renvoie la liste à l'interface HTML
                await ev.action.sendToPropertyInspector({
                    event: "getVmsList",
                    items: vms
                });
            } catch (error) {
                console.error("[VmState] Erreur lors du chargement des VMs", error);
                await ev.action.sendToPropertyInspector({
                    event: "getVmsList",
                    items: [{ label: "Erreur API (Voir console)", value: "" }]
                });
            }
        }
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
            const settings = await action.getSettings();
            
            if (!settings.vmId) {
                const svg = VmStateView.generate("Setup", false);
                await action.setImage(svg);
                return true; 
            }

            const vmStatus = await UnraidService.getVmStatus(settings.vmId);
            
            if (vmStatus.state === "ERROR" || vmStatus.state === "INTROUVABLE") {
                await action.showAlert();
                return false;
            }

            const svg = VmStateView.generate(settings.vmName || "VM", vmStatus.isRunning);
            await action.setImage(svg);
            
            return true;
        } catch (error) {
            return false;
        }
    }

}