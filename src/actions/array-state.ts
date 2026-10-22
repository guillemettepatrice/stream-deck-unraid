import { streamDeck, action, KeyDownEvent, WillAppearEvent, WillDisappearEvent, DidReceiveSettingsEvent, SingletonAction } from "@elgato/streamdeck";
import { UnraidService } from "../services/unraid.service";
import { ArrayStateView } from "../views/array-state.view";
import { PollingService } from "../services/polling.service";

type ActionSettings = {
    refreshRate?: string;
};

@action({ UUID: "ca.qg-gbcm.streamdeck.unraid.arraystate" })
export class ArrayState extends SingletonAction<ActionSettings> {
    
    override async onWillAppear(ev: WillAppearEvent<ActionSettings>): Promise<void> {
        await this.updateStatus(ev.action);
        await this.managePolling(ev.action);
    }

    override async onWillDisappear(ev: WillDisappearEvent<ActionSettings>): Promise<void> {
        PollingService.stop(ev.action.id);
    }

    override async onDidReceiveSettings(ev: DidReceiveSettingsEvent<ActionSettings>): Promise<void> {
        await this.managePolling(ev.action);
    }

    override async onKeyDown(ev: KeyDownEvent<ActionSettings>): Promise<void> {
        await this.updateStatus(ev.action);
        await ev.action.showOk();
    }

    private async updateStatus(action: any): Promise<void> {
        try {
            const { state, totalSize, freeSpace } = await UnraidService.getArrayStatus();
            
            let stateTranslationKey = "StateUnknown";
            switch(state.toUpperCase()) {
                case "STARTED": stateTranslationKey = "StateStarted"; break;
                case "STOPPED": stateTranslationKey = "StateStopped"; break;
                case "PARITY CHECK":
                case "PARITY_CHECK": stateTranslationKey = "StateParityCheck"; break;
                case "ERROR": stateTranslationKey = "StateError"; break;
            }

            const translatedState = streamDeck.i18n.translate(stateTranslationKey) || state;
            const freeText = streamDeck.i18n.translate("FreeSpace") || "libre";
            
            const svgImage = ArrayStateView.render(state, translatedState, freeSpace, totalSize, freeText);
            
            await action.setImage(svgImage);
            await action.setTitle("");
        } catch (error) {
            console.error("[ArrayState] Erreur UI:", error);
            await action.showAlert();
        }
    }

    private async managePolling(action: any): Promise<void> {
        const settings = await action.getSettings();
        const seconds = parseInt(settings.refreshRate, 10);
        
        PollingService.start(action.id, seconds, () => {
            this.updateStatus(action);
        });
    }
}