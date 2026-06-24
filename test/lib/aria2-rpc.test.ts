import { describe, expect, it } from "vitest";
import { buildRpcUrl } from "../../lib/aria2-rpc";

describe("buildRpcUrl", () => {
	it("builds HTTP URL", () => {
		expect(buildRpcUrl("localhost", 6800, "http")).toBe(
			"http://localhost:6800/jsonrpc",
		);
	});

	it("builds HTTPS URL", () => {
		expect(buildRpcUrl("aria2.example.com", 443, "https")).toBe(
			"https://aria2.example.com:443/jsonrpc",
		);
	});

	it("defaults to HTTP for unknown protocols", () => {
		expect(buildRpcUrl("host", 1234, "ftp")).toBe(
			"http://host:1234/jsonrpc",
		);
	});

	it("accepts port as string", () => {
		expect(buildRpcUrl("host", "6800", "http")).toBe(
			"http://host:6800/jsonrpc",
		);
	});

	it("works with IP addresses", () => {
		expect(buildRpcUrl("127.0.0.1", 6800, "http")).toBe(
			"http://127.0.0.1:6800/jsonrpc",
		);
	});
});
