export const getEl = <T extends HTMLElement>(id: string): T =>
	document.getElementById(id) as T;

export function localizePage(): void {
	for (const el of document.querySelectorAll<HTMLElement>("[data-i18n]")) {
		const key = el.dataset.i18n;
		if (key) {
			el.textContent = browser.i18n.getMessage(key);
		}
	}
	const title = document.querySelector<HTMLTitleElement>("[data-i18n-title]");
	if (title?.dataset.i18nTitle) {
		document.title = browser.i18n.getMessage(title.dataset.i18nTitle);
	}
}
