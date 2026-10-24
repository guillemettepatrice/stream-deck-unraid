import { action } from "@elgato/streamdeck";
import { UnraidService } from "../services/unraid.service";
import { ServerStatsView } from "../views/server-stats.view";
import { BasePollingAction } from "./base-polling.action";

@action({ UUID: "ca.qg-gbcm.streamdeck.unraid.serverstats" })
export class ServerStats extends BasePollingAction {
    protected defaultRefreshRate = "10";

    protected async updateStatus(action: any): Promise<boolean> {
        try {
            const stats = await UnraidService.getServerStats();
            await action.setImage(ServerStatsView.render(stats.cpuUsage, stats.ramUsage));
            return true;
        } catch (error) {
            await action.showAlert();
            return false;
        }
    }
}