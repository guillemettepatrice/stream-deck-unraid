import streamDeck from "@elgato/streamdeck";

import { ArrayState } from "./actions/array-state";
import { DockerState } from "./actions/docker-state";
import { ServerStats } from "./actions/server-stats";
import { UpsState } from "./actions/ups-state";
import { VmState } from "./actions/vm-state";
import { StorageState } from "./actions/storage-state";
import { NetworkState } from "./actions/network-state";
import { TemperatureState } from "./actions/temperature-state";

streamDeck.system.onDidReceiveDeepLink((ev) => {
	streamDeck.settings.setGlobalSettings({
		messageReceived: true,
	});
});

streamDeck.logger.setLevel("debug");

streamDeck.actions.registerAction(new ArrayState());
streamDeck.actions.registerAction(new DockerState());
streamDeck.actions.registerAction(new ServerStats());
streamDeck.actions.registerAction(new UpsState());
streamDeck.actions.registerAction(new VmState());
streamDeck.actions.registerAction(new StorageState());
streamDeck.actions.registerAction(new NetworkState());
streamDeck.actions.registerAction(new TemperatureState());


streamDeck.connect();
