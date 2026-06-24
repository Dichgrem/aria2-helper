import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS, type Settings } from "../../lib/settings";

describe("DEFAULT_SETTINGS", () => {
	it("has all required fields with correct defaults", () => {
		expect(DEFAULT_SETTINGS).toEqual({
			enabled: true,
			rpcHost: "localhost",
			rpcPort: 6800,
			rpcProtocol: "http",
			rpcSecret: "",
			showNotifications: true,
		} satisfies Settings);
	});

	it("is frozen at the type level (Settings interface is satisfied)", () => {
		const s: Settings = DEFAULT_SETTINGS;
		expect(s.enabled).toBe(true);
		expect(s.rpcHost).toBe("localhost");
		expect(s.rpcPort).toBe(6800);
		expect(s.rpcProtocol).toBe("http");
		expect(s.rpcSecret).toBe("");
		expect(s.showNotifications).toBe(true);
	});
});
