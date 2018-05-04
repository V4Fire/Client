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
import * as s from 'core/session';
export * from 'core/data';

@provider
export default class Session extends Provider {
	/**
	 * Authorization scheme prefix
	 */
	readonly authPrfx: string = 'Bearer ';

	/**
	 * Authorization header name
	 */
	readonly authHeader: string = 'Authorization';

	/**
	 * Authorization refresh header name
	 */
	readonly authRefreshHeader: string = 'X-JWT-TOKEN';

	/**
	 * CSRF header name
	 */
	readonly csrfHeader: string = 'X-XSRF-TOKEN';

	/** @override */
	static readonly middlewares: Middlewares<any, Provider> = {
		// tslint:disable-next-line
		async addSession(url, p) {
			if (p.api) {
				Object.assign(p.headers, await this.getAuthParams());
			}
		}
	};

	/** @override */
	async getAuthParams(params?: Dictionary | undefined): Promise<Dictionary> {
		const
			session = await s.get();

		return {
			[this.authHeader]: this.authPrfx + session.auth,
			[this.csrfHeader]: session.csrf
		};
	}

	/** @override */
	protected updateRequest(url: string, factory: RequestFactory): RequestResponse;
	protected updateRequest(url: string, event: string, factory: RequestFactory): RequestResponse;
	protected updateRequest(url: string, event: string | RequestFactory, factory?: RequestFactory): RequestResponse {
		const
			// @ts-ignore
			req = super.updateRequest(...arguments),
			session = s.get();

		const update = (res) => {
			const
				info = <Response>res.response,
				refreshHeader = info.getHeader(this.authRefreshHeader);

			try {
				if (refreshHeader) {
					s.set(refreshHeader, info.getHeader(this.csrfHeader));
				}
			} catch (_) {}
		};

		req.then(update);
		return req.catch(async (err) => {
			const
				response = <Response | undefined>$C(err).get('details.response'),
				{auth, csrf} = await session;

			if (response) {
				if (response.status === StatusCodes.UNAUTHORIZED) {
					if (!await s.match(auth, csrf)) {
						// @ts-ignore
						return this.updateRequest(...arguments);
					}

					s.clear();
				}

				update({response});
			}

			throw err;
		});
	}
}
