import streamDeck from "@elgato/streamdeck";

import { ArrayState } from "./actions/array-state";

streamDeck.system.onDidReceiveDeepLink((ev) => {
	streamDeck.settings.setGlobalSettings({
		messageReceived: true,
	});
});

streamDeck.logger.setLevel("trace");

streamDeck.actions.registerAction(new ArrayState());

streamDeck.connect();
