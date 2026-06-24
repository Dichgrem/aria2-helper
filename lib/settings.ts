export interface Settings {
	enabled: boolean;
	rpcHost: string;
	rpcPort: number;
	rpcProtocol: string;
	rpcSecret: string;
	showNotifications: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
	enabled: true,
	rpcHost: "localhost",
	rpcPort: 6800,
	rpcProtocol: "http",
	rpcSecret: "",
	showNotifications: true,
};
