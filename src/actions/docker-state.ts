import streamDeck, { action } from "@elgato/streamdeck";
import { UnraidService } from "../services/unraid.service";
import { DockerStateView } from "../views/docker-state.view";
import { BasePollingAction } from "./base-polling.action";

@action({ UUID: "ca.qg-gbcm.streamdeck.unraid.dockerstate" })
export class DockerState extends BasePollingAction {
    protected defaultRefreshRate = "5";

    public override async onSendToPlugin(ev: any): Promise<void> {
        const eventName = ev.payload?.event || ev.payload?.payload?.event;

        if (eventName === "getDockerContainers") {
            try {
                const containers = await UnraidService.getContainersList();
                await streamDeck.ui?.sendToPropertyInspector({
                    event: "getDockerContainers",
                    items: containers
                });
            } catch (error) {
                await streamDeck.ui?.sendToPropertyInspector({
                    event: "getDockerContainers",
                    items: [{ label: "Erreur API", value: "" }]
                });
            }
        }
    }

    protected async updateStatus(action: any): Promise<boolean> {
        try {
            const settings = await action.getSettings();
            const containerId = settings.containerName; 
            
            if (!containerId) return false;

            const status = await UnraidService.getContainerStatus(containerId);

            let stateTranslationKey = `State${status.state.charAt(0).toUpperCase() + status.state.slice(1).toLowerCase()}`;
            const translatedState = streamDeck.i18n.translate('Docker.' + stateTranslationKey) || status.state;

            await action.setImage(DockerStateView.render(settings.containerName, translatedState, status.isRunning));
            
            return true;
        } catch (error) {
            await action.showAlert();
            return false;
        }
    }
}