/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import $C = require('collection.js');
import StatusCodes from 'core/statusCodes';
import Provider, { provider, Middlewares, RequestResponse, RequestFactory, Response } from 'core/data';
import { getSession, setSession, clearSession, matchSession } from 'core/session';

@provider
export default class JWT extends Provider {
	/** @inheritDoc */
	static readonly middlewares: Middlewares<any, Provider> = {
		// tslint:disable-next-line
		addSession(url, p) {
			if (p.api) {
				Object.assign(p.headers, this.getAuthParams());
			}
		}
	};

	/** @override */
	getAuthParams(params?: Dictionary | undefined): Dictionary {
		const session = getSession();
		return {
			'X-XSRF-TOKEN': session.xsrf,
			'Authorization': `Bearer ${session.jwt}`
		};
	}

	/** @override */
	protected updateRequest(url: string, factory: RequestFactory): RequestResponse;
	protected updateRequest(url: string, event: string, factory: RequestFactory): RequestResponse;
	protected updateRequest(url: string, event: string | RequestFactory, factory?: RequestFactory): RequestResponse {
		const
			// @ts-ignore
			req = super.updateRequest(...arguments),
			{jwt, xsrf} = getSession();

		const update = (res) => {
			const
				info = <Response>res.response;

			try {
				setSession(info.getHeader('X-JWT-TOKEN'), info.getHeader('X-XSRF-TOKEN'));

			} catch (_) {}
		};

		req.then(update);
		return req.catch((err) => {
			const
				response = <Response | undefined>$C(err).get('details.response');

			if (response) {
				if (response.status === StatusCodes.UNAUTHORIZED) {
					if (!matchSession(jwt, xsrf)) {
						// @ts-ignore
						return this.updateRequest(...arguments);
					}

					clearSession();
				}

				update({response});
			}

			throw err;
		});
	}
}
