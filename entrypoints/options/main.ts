// WXT auto-imports: browser

import { rpcCall } from "../../lib/aria2-rpc";
import { DEFAULT_SETTINGS, type Settings } from "../../lib/settings";

const getEl = <T extends HTMLElement>(id: string): T =>
	document.getElementById(id) as T;

async function loadSettings(): Promise<void> {
	const stored = await browser.storage.local.get("settings");
	const settings: Settings = stored.settings
		? { ...DEFAULT_SETTINGS, ...stored.settings }
		: DEFAULT_SETTINGS;

	getEl<HTMLInputElement>("rpcHost").value = settings.rpcHost;
	getEl<HTMLInputElement>("rpcPort").value = settings.rpcPort.toString();
	getEl<HTMLSelectElement>("rpcProtocol").value = settings.rpcProtocol;
	getEl<HTMLInputElement>("rpcSecret").value = settings.rpcSecret || "";
	getEl<HTMLInputElement>("showNotifications").checked =
		settings.showNotifications;
	getEl<HTMLInputElement>("enabled").checked = settings.enabled;

	testConnection();
}

async function saveSettings(): Promise<void> {
	const settings: Settings = {
		enabled: getEl<HTMLInputElement>("enabled").checked,
		rpcHost: getEl<HTMLInputElement>("rpcHost").value.trim() || "localhost",
		rpcPort: parseInt(getEl<HTMLInputElement>("rpcPort").value, 10) || 6800,
		rpcProtocol: getEl<HTMLSelectElement>("rpcProtocol").value,
		rpcSecret: getEl<HTMLInputElement>("rpcSecret").value,
		showNotifications: getEl<HTMLInputElement>("showNotifications").checked,
	};

	try {
		await browser.storage.local.set({ settings });
		showStatus("Settings saved successfully!", "success");
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unknown error";
		showStatus(`Failed to save settings: ${message}`, "error");
	}
}

async function testConnection(): Promise<void> {
	const rpcHost =
		getEl<HTMLInputElement>("rpcHost").value.trim() || "localhost";
	const rpcPort = getEl<HTMLInputElement>("rpcPort").value || "6800";
	const rpcProtocol = getEl<HTMLSelectElement>("rpcProtocol").value;
	const rpcSecret = getEl<HTMLInputElement>("rpcSecret").value;

	const connectionStatus = getEl<HTMLDivElement>("connectionStatus");
	connectionStatus.textContent = "Connecting...";
	connectionStatus.className = "connection-status";

	try {
		const rpcUrl = `${rpcProtocol === "https" ? "https" : "http"}://${rpcHost}:${rpcPort}/jsonrpc`;
		await rpcCall(rpcUrl, rpcSecret, "aria2.getVersion", [], 10000);

		connectionStatus.textContent = "Connected";
		connectionStatus.className = "connection-status connected";
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unknown error";
		connectionStatus.textContent = `Failed: ${message}`;
		connectionStatus.className = "connection-status";
	}
}

function showStatus(message: string, type: string): void {
	const status = getEl<HTMLDivElement>("status");
	status.textContent = message;
	status.className = `status ${type}`;
	status.style.display = "block";

	setTimeout(() => {
		status.style.display = "none";
	}, 3000);
}

document.addEventListener("DOMContentLoaded", () => {
	getEl<HTMLButtonElement>("saveSettings").addEventListener(
		"click",
		saveSettings,
	);
	getEl<HTMLButtonElement>("testConnection").addEventListener(
		"click",
		testConnection,
	);

	loadSettings();
});
