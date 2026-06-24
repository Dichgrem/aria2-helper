// WXT auto-imports: browser

import { rpcCall } from "../lib/aria2-rpc";
import { DEFAULT_SETTINGS, type Settings } from "../lib/settings";

interface DownloadItem {
	id: number;
	url: string;
	filename?: string;
	totalBytes?: number;
	referer?: string;
}

const SKIP_URLS = new Set<string>();

let settings: Settings = { ...DEFAULT_SETTINGS };
let rpcUrl: string | null = null;

async function loadSettings(): Promise<void> {
	const stored = await browser.storage.local.get("settings");
	settings = stored.settings
		? { ...DEFAULT_SETTINGS, ...stored.settings }
		: DEFAULT_SETTINGS;
	connectToAria2();
}

async function saveSettings(newSettings: Partial<Settings>): Promise<void> {
	const rpcChanged =
		("rpcHost" in newSettings && newSettings.rpcHost !== settings.rpcHost) ||
		("rpcPort" in newSettings && newSettings.rpcPort !== settings.rpcPort) ||
		("rpcProtocol" in newSettings &&
			newSettings.rpcProtocol !== settings.rpcProtocol);
	settings = { ...settings, ...newSettings };
	await browser.storage.local.set({ settings });
	if (rpcChanged) {
		connectToAria2();
	}
}

function connectToAria2(): void {
	const protocol = settings.rpcProtocol === "https" ? "https" : "http";
	rpcUrl = `${protocol}://${settings.rpcHost}:${settings.rpcPort}/jsonrpc`;
}

function sendAria2Request(
	method: string,
	params: unknown[] = [],
): Promise<unknown> {
	if (!rpcUrl) {
		return Promise.reject(new Error("Not connected to aria2"));
	}
	return rpcCall(rpcUrl, settings.rpcSecret, method, params);
}

async function getCookies(url: string): Promise<string> {
	try {
		const cookies = await browser.cookies.getAll({ url });
		return cookies
			.map((cookie: browser.cookies.Cookie) => `${cookie.name}=${cookie.value}`)
			.join("; ");
	} catch (error) {
		console.error("Error getting cookies:", error);
	}
	return "";
}

async function addDownloadToAria2(
	downloadItem: DownloadItem,
	referer: string,
	cookies: string,
): Promise<void> {
	await browser.downloads.erase({ id: downloadItem.id });
	await addDownloadUrlToAria2(
		downloadItem.url,
		referer,
		cookies,
		downloadItem.filename?.split("/").pop(),
	);
}

async function addDownloadUrlToAria2(
	url: string,
	referer: string,
	cookies: string,
	filename?: string,
): Promise<void> {
	try {
		if (url.match(/\.(torrent|metalink4?)$/i)) {
			const response = await fetch(url);
			const blob = await response.blob();
			const base64 = await blobToBase64(blob);

			if (url.endsWith(".torrent")) {
				await sendAria2Request("aria2.addTorrent", [base64, [], {}]);
			} else {
				await sendAria2Request("aria2.addMetalink", [base64, [], {}]);
			}
		} else {
			const params: unknown[] = [[url]];

			const options: Record<string, unknown> = {};
			if (referer) {
				options.header = [`Referer: ${referer}`];
			}
			if (cookies) {
				options.header = options.header || [];
				(options.header as string[]).push(`Cookie: ${cookies}`);
			}
			if (filename) {
				options.out = filename;
			}

			params.push(options);
			await sendAria2Request("aria2.addUri", params);
		}

		if (settings.showNotifications) {
			showNotification(browser.i18n.getMessage("downloadAdded"));
		}
	} catch (error) {
		console.error("Error adding download to aria2:", error);
		if (settings.showNotifications) {
			showNotification(browser.i18n.getMessage("downloadError"));
		}
	}
}

function blobToBase64(blob: Blob): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onloadend = () => {
			const dataUrl = reader.result as string;
			const base64 = dataUrl.split(",")[1];
			resolve(base64);
		};
		reader.onerror = reject;
		reader.readAsDataURL(blob);
	});
}

function showNotification(message: string): void {
	browser.notifications.create({
		type: "basic",
		iconUrl: "/icons/icon-48.png",
		title: browser.i18n.getMessage("extName"),
		message: message,
	});
}

function updateContextMenu(): void {
	browser.contextMenus.removeAll().then(() => {
		browser.contextMenus.create({
			title: browser.i18n.getMessage("extName"),
			id: "ariang-main",
			contexts: ["link", "selection"],
		});

		browser.contextMenus.create({
			title: browser.i18n.getMessage("downloadWithAria2"),
			parentId: "ariang-main",
			id: "ariang-download",
			contexts: ["link"],
		});

		browser.contextMenus.create({
			title: browser.i18n.getMessage("openAria2"),
			parentId: "ariang-main",
			id: "ariang-open",
			contexts: ["link", "selection"],
		});
	});
}

function setupEventListeners(): void {
	browser.webRequest.onHeadersReceived.addListener(
		(details) => {
			if (!settings.enabled) return {};

			const disp = details.responseHeaders?.find(
				(h) => h.name.toLowerCase() === "content-disposition",
			);
			if (!disp?.value?.includes("attachment")) return {};

			const url = details.url;
			const tabId = details.tabId;

			if (details.method !== "GET") {
				SKIP_URLS.add(url);
				setTimeout(() => SKIP_URLS.delete(url), 10000);
				return {};
			}

			let filename: string | undefined;
			const m =
				disp.value.match(/filename\*=UTF-8''(.+?)(?:;|$)/i) ??
				disp.value.match(/filename="(.+?)"/i) ??
				disp.value.match(/filename=([^;\s]+)/i);
			if (m) {
				filename = decodeURIComponent(m[1].replace(/"/g, ""));
			}

			(async () => {
				try {
					const referer =
						tabId >= 0 ? (await browser.tabs.get(tabId)).url || "" : "";
					const cookies = await getCookies(url);
					await addDownloadUrlToAria2(url, referer, cookies, filename);
				} catch (error) {
					console.error("Error handling webRequest download:", error);
				}
			})();

			return { cancel: true };
		},
		{ urls: ["<all_urls>"], types: ["main_frame", "sub_frame"] },
		["blocking", "responseHeaders"],
	);

	browser.downloads.onCreated.addListener(
		async (downloadItem: browser.downloads.DownloadItem) => {
			if (!settings.enabled) return;
			if (SKIP_URLS.has(downloadItem.url)) {
				SKIP_URLS.delete(downloadItem.url);
				return;
			}
			if (/^(blob|data):/i.test(downloadItem.url)) return;

			try {
				await browser.downloads.cancel(downloadItem.id);
			} catch (_e) {
				// Ignore cancel errors
			}

			try {
				const tabs = await browser.tabs.query({
					active: true,
					currentWindow: true,
				});
				const tab = tabs[0];

				const referer = downloadItem.referrer || tab?.url || "";
				const cookies = await getCookies(downloadItem.url);

				await addDownloadToAria2(
					{
						id: downloadItem.id,
						url: downloadItem.url,
						filename: downloadItem.filename,
						totalBytes: downloadItem.totalBytes,
						referer: downloadItem.referrer,
					},
					referer,
					cookies,
				);
			} catch (error) {
				console.error("Error handling download:", error);
			}
		},
	);

	browser.contextMenus.onClicked.addListener(
		async (info: browser.contextMenus.OnClickData, tab?: browser.tabs.Tab) => {
			if (
				info.menuItemId === "ariang-download" ||
				info.menuItemId === "ariang-main"
			) {
				const url = info.linkUrl;
				if (url) {
					const referer = tab?.url || "";
					const cookies = await getCookies(url);

					await addDownloadToAria2(
						{
							url: url,
							id: 0,
						},
						referer,
						cookies,
					);
				}
			} else if (info.menuItemId === "ariang-open") {
				const protocol = settings.rpcProtocol === "https" ? "https" : "http";
				let ariangUrl = browser.runtime.getURL(
					`/ariang/index.html#!/settings/rpc/set/${protocol}/${settings.rpcHost}/${settings.rpcPort}/jsonrpc`,
				);
				if (settings.rpcSecret) {
					ariangUrl += `/${btoa(settings.rpcSecret)}`;
				}
				browser.tabs.create({ url: ariangUrl });
			}
		},
	);

	browser.runtime.onInstalled.addListener(() => {
		updateContextMenu();
	});

	browser.storage.onChanged.addListener(
		(
			changes: browser.storage.StorageAreaSyncOnChangedChangesType,
			area: string,
		) => {
			if (area === "local" && changes.settings) {
				loadSettings();
			}
		},
	);

	browser.runtime.onMessage.addListener(
		(
			message: { type: string; settings?: Partial<Settings> },
			_sender: browser.runtime.MessageSender,
			sendResponse: (response?: unknown) => void,
		) => {
			if (message.type === "getSettings") {
				sendResponse(settings);
			} else if (message.type === "setSettings" && message.settings) {
				saveSettings(message.settings).then(() =>
					sendResponse({ success: true }),
				);
				return true;
			}
		},
	);
}

export default defineBackground({
	main() {
		setupEventListeners();
		loadSettings();
	},
});
