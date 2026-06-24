// WXT auto-imports: browser

import { buildAriaNgUrl } from "../../lib/ariang-url";
import { getEl, localizePage } from "../../lib/dom";
import { DEFAULT_SETTINGS, type Settings } from "../../lib/settings";

document.addEventListener("DOMContentLoaded", async () => {
	localizePage();
	const toggleBtn = getEl<HTMLButtonElement>("toggleEnabled");
	const openAriangBtn = getEl<HTMLButtonElement>("openAriang");
	const openSettingsBtn = getEl<HTMLButtonElement>("openSettings");

	const stored = (await browser.storage.local.get("settings")) as {
		settings?: Settings;
	};
	const settings: Settings = stored.settings ?? DEFAULT_SETTINGS;

	updateToggleUI(settings.enabled);

	toggleBtn.addEventListener("click", async () => {
		const newEnabled = !settings.enabled;
		await browser.runtime.sendMessage({
			type: "setSettings",
			settings: { enabled: newEnabled },
		});
		settings.enabled = newEnabled;
		updateToggleUI(newEnabled);
	});

	openAriangBtn.addEventListener("click", () => {
		const ariangUrl = browser.runtime.getURL(buildAriaNgUrl(settings));
		browser.tabs.create({ url: ariangUrl });
		window.close();
	});

	openSettingsBtn.addEventListener("click", () => {
		browser.runtime.openOptionsPage();
		window.close();
	});

	function updateToggleUI(enabled: boolean): void {
		toggleBtn.textContent = enabled
			? browser.i18n.getMessage("toggleOn")
			: browser.i18n.getMessage("toggleOff");
		toggleBtn.className = enabled ? "btn btn-active" : "btn btn-inactive";
	}
});
