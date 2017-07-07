'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Provider, { provider } from 'core/data';
import { getSession, setSession, clearSession, matchSession } from 'core/session';

const
	status = require('http-status'),
	isLocal = (url) => url.includes(API);

@provider
export default class JWT extends Provider {
	/* eslint-disable no-unused-vars */

	/** @override */
	getAuthParams(params: ?Object): ?Object {
		return this.addSession(`${API}/handshake`).headers;
	}

	/** @override */
	updateRequest(url: string, factory: () => Promise<XMLHttpRequest>, event?: string): Promise<XMLHttpRequest> {
		const
			req = super.updateRequest(...arguments),
			{jwt, xsrf} = getSession();

		if (!isLocal(url)) {
			return req;
		}

		function update(res) {
			try {
				setSession(res.getResponseHeader('X-JWT-TOKEN'), res.getResponseHeader('X-XSRF-TOKEN'));

			} catch (_) {}
		}

		req.then(update);
		return Object.assign(req.catch((err) => {
			const
				res = err.args[0];

			if (res.status === status.UNAUTHORIZED) {
				if (!matchSession(jwt, xsrf)) {
					return this.updateRequest(...arguments);
				}

				clearSession();
			}

			update(res);
			throw err;

		}), {abort: req.abort});
	}

	/* eslint-enable no-unused-vars */

	/** @override */
	addSession(url, params = {}): Object {
		if (isLocal(url)) {
			const
				session = getSession();

			params.headers = Object.assign(params.headers || {}, {
				'X-XSRF-TOKEN': session.xsrf,
				'Authorization': `Bearer ${session.jwt}`
			});
		}

		return params;
	}
}
