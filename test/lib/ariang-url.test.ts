import { describe, expect, it } from "vitest";
import { buildAriaNgUrl } from "../../lib/ariang-url";
import { DEFAULT_SETTINGS, type Settings } from "../../lib/settings";

function s(overrides: Partial<Settings> = {}): Settings {
	return { ...DEFAULT_SETTINGS, ...overrides };
}

describe("buildAriaNgUrl", () => {
	it("builds URL with default settings", () => {
		expect(buildAriaNgUrl(s())).toBe(
			"/ariang/index.html#!/settings/rpc/set/http/localhost/6800/jsonrpc",
		);
	});

	it("uses HTTPS when rpcProtocol is https", () => {
		expect(buildAriaNgUrl(s({ rpcProtocol: "https" }))).toBe(
			"/ariang/index.html#!/settings/rpc/set/https/localhost/6800/jsonrpc",
		);
	});

	it("appends secret token with btoa when set", () => {
		const url = buildAriaNgUrl(s({ rpcSecret: "mysecret" }));
		expect(url).toContain("/jsonrpc/");
		expect(url).toMatch(/\/jsonrpc\/.+$/);
	});

	it("uses custom host and port", () => {
		expect(buildAriaNgUrl(s({ rpcHost: "192.168.1.1", rpcPort: 8800 }))).toBe(
			"/ariang/index.html#!/settings/rpc/set/http/192.168.1.1/8800/jsonrpc",
		);
	});

	it("falls back to localhost when rpcHost is empty", () => {
		expect(buildAriaNgUrl(s({ rpcHost: "" }))).toBe(
			"/ariang/index.html#!/settings/rpc/set/http/localhost/6800/jsonrpc",
		);
	});

	it("falls back to 6800 when rpcPort is 0", () => {
		expect(buildAriaNgUrl(s({ rpcPort: 0 }))).toBe(
			"/ariang/index.html#!/settings/rpc/set/http/localhost/6800/jsonrpc",
		);
	});

	it("does not append secret when rpcSecret is empty", () => {
		const url = buildAriaNgUrl(s({ rpcSecret: "" }));
		expect(url).toBe(
			"/ariang/index.html#!/settings/rpc/set/http/localhost/6800/jsonrpc",
		);
	});
});
