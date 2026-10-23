import { action, WillAppearEvent, WillDisappearEvent, DidReceiveSettingsEvent, SingletonAction } from "@elgato/streamdeck";
import { UnraidService } from "../services/unraid.service";
import { ServerStatsView } from "../views/server-stats.view";
import { PollingService } from "../services/polling.service";

type StatsSettings = {
    refreshRate?: string;
};

@action({ UUID: "ca.qg-gbcm.streamdeck.unraid.serverstats" })
export class ServerStats extends SingletonAction<StatsSettings> {
    
    override async onWillAppear(ev: WillAppearEvent<StatsSettings>): Promise<void> {
        await this.updateStatus(ev.action);
        await this.managePolling(ev.action);
    }

    override async onWillDisappear(ev: WillDisappearEvent<StatsSettings>): Promise<void> {
        PollingService.stop(ev.action.id);
    }

    override async onDidReceiveSettings(ev: DidReceiveSettingsEvent<StatsSettings>): Promise<void> {
        await this.updateStatus(ev.action);
        await this.managePolling(ev.action);
    }

    private async updateStatus(action: any): Promise<void> {
        try {
            const { cpuUsage, ramUsage } = await UnraidService.getServerStats();
            await action.setImage(ServerStatsView.render(cpuUsage, ramUsage));
            await action.setTitle("");
        } catch (error) {
            console.error("[ServerStats] Erreur:", error);
            await action.showAlert();
        }
    }

    private async managePolling(action: any): Promise<void> {
        const settings = await action.getSettings();
        const seconds = parseInt(settings.refreshRate || "5", 10);
        
        PollingService.start(action.id, seconds, () => {
            this.updateStatus(action);
        });
    }
}