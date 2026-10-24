import { SingletonAction, WillAppearEvent } from "@elgato/streamdeck";
import { PollingService } from "../services/polling.service";

export abstract class BasePollingAction extends SingletonAction {
    protected abstract defaultRefreshRate: string;
    protected abstract updateStatus(action: any): Promise<boolean>;

    public override async onWillAppear(ev: WillAppearEvent<any>): Promise<void> {
        await this.managePolling(ev.action);
    }

    public override onWillDisappear(ev: any): void {
        PollingService.stop(ev.action.id);
    }

    public override async onDidReceiveSettings(ev: any): Promise<void> {
        await this.updateStatus(ev.action);
        await this.managePolling(ev.action);
    }

    protected async managePolling(action: any): Promise<void> {
        const settings = await action.getSettings();
        const seconds = parseInt(settings.refreshRate || this.defaultRefreshRate, 10); 
        
        PollingService.start(action.id, seconds, async () => {
            return await this.updateStatus(action);
        });
    }
}