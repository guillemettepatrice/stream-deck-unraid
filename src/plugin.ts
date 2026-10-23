import streamDeck from "@elgato/streamdeck";

import { ArrayState } from "./actions/array-state";
import { DockerState } from "./actions/docker-state";
import { ServerStats } from "./actions/server-stats";

streamDeck.system.onDidReceiveDeepLink((ev) => {
	streamDeck.settings.setGlobalSettings({
		messageReceived: true,
	});
});

streamDeck.logger.setLevel("info");

streamDeck.actions.registerAction(new ArrayState());
streamDeck.actions.registerAction(new DockerState());
streamDeck.actions.registerAction(new ServerStats());

streamDeck.connect();
