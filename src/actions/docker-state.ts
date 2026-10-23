import streamDeck, { action, KeyDownEvent, WillAppearEvent, WillDisappearEvent, DidReceiveSettingsEvent, SingletonAction, SendToPluginEvent } from "@elgato/streamdeck";
import { UnraidService } from "../services/unraid.service";
import { DockerStateView } from "../views/docker-state.view";
import { PollingService } from "../services/polling.service";

type DockerActionSettings = {
    refreshRate?: string;
    containerName?: string; 
};

@action({ UUID: "ca.qg-gbcm.streamdeck.unraid.dockerstate" })
export class DockerState extends SingletonAction<DockerActionSettings> {
    
    override async onWillAppear(ev: WillAppearEvent<DockerActionSettings>): Promise<void> {
        await this.updateStatus(ev.action);
        await this.managePolling(ev.action);
    }

    override async onWillDisappear(ev: WillDisappearEvent<DockerActionSettings>): Promise<void> {
        PollingService.stop(ev.action.id);
    }

    override async onDidReceiveSettings(ev: DidReceiveSettingsEvent<DockerActionSettings>): Promise<void> {
        await this.updateStatus(ev.action);
        await this.managePolling(ev.action);
    }

    override async onKeyDown(ev: KeyDownEvent<DockerActionSettings>): Promise<void> {
        try {
            const settings = await ev.action.getSettings();
            const containerName = settings.containerName || "";

            if (!containerName) {
                await ev.action.showAlert();
                return;
            }

            const { id, state } = await UnraidService.getContainerStatus(containerName);

            if (!id || state === "INTROUVABLE") {
                console.error(`[DockerState] Impossible de trouver l'ID pour ${containerName}`);
                await ev.action.showAlert();
                return;
            }

            await UnraidService.toggleContainer(id, state);

            await ev.action.showOk();
            await this.updateStatus(ev.action);

        } catch (error) {
            console.error("[DockerState] Erreur lors du onKeyDown:", error);
            await ev.action.showAlert();
        }
    }

    override async onSendToPlugin(ev: SendToPluginEvent<DockerActionSettings, any>): Promise<void> {
        const payload = ev.payload as { event?: string };
        if (payload?.event === "getDockerContainers") {
            try {
                const containers = await UnraidService.getContainersList();
                
                if (streamDeck.ui) {
                    await streamDeck.ui.sendToPropertyInspector({
                        event: "getDockerContainers",
                        items: containers
                    });
                }
            } catch (error) {
                console.error("[DockerState] Erreur lors du chargement des conteneurs", error);
                
                if (streamDeck.ui) {
                    await streamDeck.ui.sendToPropertyInspector({
                        event: "getDockerContainers",
                        items: [{ label: "Erreur API (Voir console)", value: "" }]
                    });
                }
            }
        }
    }

    private async updateStatus(action: any): Promise<boolean> {
        try {
            const settings = await action.getSettings();
            const containerName = settings.containerName || "";

            if (!containerName) {
                await action.setImage(DockerStateView.render("", "NO CONFIG", false));
                return false;
            }

            const { state, isRunning } = await UnraidService.getContainerStatus(containerName);
            
            let stateTranslationKey = `State${state.charAt(0).toUpperCase() + state.slice(1).toLowerCase()}`;
            const translatedState = streamDeck.i18n.translate(stateTranslationKey) || state;
            
            await action.setImage(DockerStateView.render(containerName, translatedState, isRunning));
            await action.setTitle("");
            return true;
        } catch (error) {
            console.error("[DockerState] Erreur UI:", error);
            await action.showAlert();
            return false;
        }
    }

    private async managePolling(action: any): Promise<void> {
        const settings = await action.getSettings();
        const seconds = parseInt(settings.refreshRate || "5", 10);
        
        PollingService.start(action.id, seconds, async () => {
            return await this.updateStatus(action);
        });
    }
}