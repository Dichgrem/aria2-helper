export const getEl = <T extends HTMLElement>(id: string): T =>
	document.getElementById(id) as T;
