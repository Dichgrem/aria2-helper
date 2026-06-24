const SESSION_PREFIX = Math.random().toString(36).slice(2, 11);

export function rpcCall(
	rpcUrl: string,
	secret: string,
	method: string,
	params: unknown[] = [],
	timeout = 30000,
): Promise<unknown> {
	return new Promise((resolve, reject) => {
		const id = `aria2-helper-${SESSION_PREFIX}-${Math.random().toString(36).slice(2, 11)}`;
		const rpcParams = secret ? [`token:${secret}`, ...params] : params;
		const body = JSON.stringify({
			jsonrpc: "2.0",
			id,
			method,
			params: rpcParams,
		});

		const xhr = new XMLHttpRequest();
		xhr.open("POST", rpcUrl, true);
		xhr.setRequestHeader("Content-Type", "application/json");
		xhr.timeout = timeout;

		xhr.onload = () => {
			if (xhr.status >= 200 && xhr.status < 300) {
				try {
					const data = JSON.parse(xhr.responseText);
					if (data.error) {
						reject(new Error(data.error.message));
					} else {
						resolve(data.result);
					}
				} catch (_e) {
					reject(new Error("Invalid response"));
				}
			} else {
				reject(new Error(`HTTP ${xhr.status}`));
			}
		};

		xhr.onerror = () => reject(new Error("Connection failed"));
		xhr.ontimeout = () => reject(new Error("Connection timeout"));

		xhr.send(body);
	});
}
