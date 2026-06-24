import { describe, expect, it, vi } from "vitest";
import { getEl, localizePage } from "../../lib/dom";

// Mock browser.i18n
vi.stubGlobal("browser", {
	i18n: {
		getMessage: vi.fn((key: string) => {
			const map: Record<string, string> = {
				extName: "Aria2-helper",
				settingsBtn: "Settings",
				settingsTitle: "Aria2-helper Settings",
			};
			return map[key] ?? key;
		}),
	},
});

describe("getEl", () => {
	it("returns element by id", () => {
		document.body.innerHTML = '<div id="test">hello</div>';
		const el = getEl("test");
		expect(el.textContent).toBe("hello");
	});

	it("returns HTMLInputElement with correct type", () => {
		document.body.innerHTML = '<input id="input" type="text" value="foo" />';
		const el = getEl<HTMLInputElement>("input");
		expect(el.value).toBe("foo");
	});
});

describe("localizePage", () => {
	it("replaces data-i18n textContent", () => {
		document.body.innerHTML =
			'<h1 data-i18n="extName">Fallback</h1><button data-i18n="settingsBtn">Fb</button>';
		localizePage();
		expect(document.querySelector("h1")?.textContent).toBe("Aria2-helper");
		expect(document.querySelector("button")?.textContent).toBe("Settings");
	});

	it("sets document.title from data-i18n-title", () => {
		document.head.innerHTML = '<title data-i18n-title="settingsTitle">Fb</title>';
		localizePage();
		expect(document.title).toBe("Aria2-helper Settings");
	});

	it("ignores elements without data-i18n", () => {
		document.body.innerHTML =
			'<span>stay</span><span data-i18n="extName">replace</span>';
		localizePage();
		expect(document.querySelectorAll("span")[0].textContent).toBe("stay");
		expect(document.querySelectorAll("span")[1].textContent).toBe("Aria2-helper");
	});

	it("does nothing on empty page", () => {
		document.body.innerHTML = "";
		expect(() => localizePage()).not.toThrow();
	});
});
