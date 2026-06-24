import type { Settings } from "./settings";

export function buildAriaNgUrl(settings: Settings): string {
	const protocol = settings.rpcProtocol === "https" ? "https" : "http";
	const host = settings.rpcHost || "localhost";
	const port = settings.rpcPort || 6800;

	let url = `/ariang/index.html#!/settings/rpc/set/${protocol}/${host}/${port}/jsonrpc`;
	if (settings.rpcSecret) {
		url += `/${btoa(settings.rpcSecret)}`;
	}
	return url;
}
