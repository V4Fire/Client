/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import $C = require('collection.js');
import statusCodes from 'core/status-codes';
import Provider, { provider, Middlewares, RequestResponse, RequestFunctionResponse, Response } from 'core/data';
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

	/**
	 * If true, then after clearing the session (in case of answer 401) will be an additional query
	 */
	readonly requestAfterClear: boolean = true;

	/** @override */
	static readonly middlewares: Middlewares = {
		// tslint:disable-next-line:typedef
		async addSession(this: Session, {opts}) {
			if (opts.api) {
				const h = await this.getAuthParams();
				Object.mixin({traits: true}, opts.headers, h);
			}
		}
	};

	/** @override */
	async getAuthParams(params?: CanUndef<Dictionary>): Promise<Dictionary> {
		const
			session = await s.get();

		return {
			[this.authHeader]: session.auth && this.authPrfx + session.auth,
			[this.csrfHeader]: session.csrf
		};
	}

	/** @override */
	protected updateRequest<T = unknown>(url: string, factory: RequestFunctionResponse<T>): RequestResponse<T>;
	protected updateRequest<T = unknown>(
		url: string,
		event: string,
		factory: RequestFunctionResponse<T>
	): RequestResponse<T>;

	protected updateRequest(
		url: string,
		event: string | RequestFunctionResponse,
		factory?: RequestFunctionResponse
	): RequestResponse {
		const
			// @ts-ignore
			req = super.updateRequest(url, event, factory),
			session = s.get();

		const update = (res) => {
			const
				info = <Response>res.response,
				refreshHeader = info.getHeader(this.authRefreshHeader);

			try {
				if (refreshHeader) {
					s.set(refreshHeader, info.getHeader(this.csrfHeader));
				}
			} catch {}
		};

		req.then(update);
		return req.catch(async (err) => {
			const
				response = <CanUndef<Response>>$C(err).get('details.response'),
				{auth, csrf} = await session;

			if (response) {
				const
					r = () => this.updateRequest(url, <string>event, <RequestFunctionResponse>factory);

				if (response.status === statusCodes.UNAUTHORIZED) {
					if (!await s.match(auth, csrf)) {
						return r();
					}

					await s.clear();

					if (auth && this.requestAfterClear) {
						return r();
					}
				}

				update({response});
			}

			throw err;
		});
	}
}
