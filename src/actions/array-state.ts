import streamDeck, { action } from "@elgato/streamdeck";
import { UnraidService } from "../services/unraid.service";
import { ArrayStateView } from "../views/array-state.view";
import { BasePollingAction } from "./base-polling.action";

@action({ UUID: "ca.qg-gbcm.streamdeck.unraid.arraystate" })
export class ArrayState extends BasePollingAction {
    protected defaultRefreshRate = "10";

    protected async updateStatus(action: any): Promise<boolean> {
        try {
            const status = await UnraidService.getArrayStatus();
            let stateTranslationKey = "StateUnknown";
            switch(status.state.toUpperCase()) {
                case "STARTED": stateTranslationKey = "StateStarted"; break;
                case "STOPPED": stateTranslationKey = "StateStopped"; break;
                case "PARITY CHECK":
                case "PARITY_CHECK": stateTranslationKey = "StateParityCheck"; break;
                case "ERROR": stateTranslationKey = "StateError"; break;
            }

            const translatedState = streamDeck.i18n.translate('Array.' + stateTranslationKey) || status.state;
            const freeText = streamDeck.i18n.translate("Array.FreeSpace") || "libre";
            
            await action.setImage(ArrayStateView.render(
                status.state,
                translatedState,
                status.freeSpace,
                status.totalSize,
                freeText
            ));
            
            return true;
        } catch (error) {
            console.error("[ArrayState] Erreur lors de la mise à jour:", error);
            await action.showAlert();
            return false;
        }
    }
}