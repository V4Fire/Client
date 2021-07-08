/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Provider, {

	provider,

	Middlewares,
	MiddlewareParams,

	RequestResponse,
	RequestFunctionResponse,
	Response

} from 'core/data';

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
	static readonly middlewares: Middlewares = {
		...Provider.middlewares,

		async addSession(this: Session, {opts}: MiddlewareParams): Promise<void> {
			if (opts.api) {
				const h = await this.getAuthParams();
				Object.mixin({traits: true}, opts.headers, h);
			}
		}
	};

	/** @override */
	async getAuthParams(): Promise<Dictionary> {
		const
			session = await s.get();

		if (Object.isString(session.auth)) {
			return {
				[this.authHeader]: this.authPrfx + session.auth,
				[this.csrfHeader]: session.params?.csrf
			};
		}

		return {};
	}

	/** @override */
	protected updateRequest<T = unknown>(url: string, factory: RequestFunctionResponse<T>): RequestResponse<T>;
	protected updateRequest<T = unknown>(
		url: string,
		event: string,
		factory: RequestFunctionResponse<T>,
		canRetry?: boolean
	): RequestResponse<T>;

	protected updateRequest(
		url: string,
		event: string | RequestFunctionResponse,
		factory?: RequestFunctionResponse,
		canRetry: boolean = true
	): RequestResponse {
		const
			req = super.updateRequest(url, <any>event, <any>factory),
			getSessionPromise = s.get();

		const update = async (res) => {
			const
				{response} = res,
				refreshHeader = response.getHeader(this.authRefreshHeader);

			try {
				if (refreshHeader != null) {
					await s.set(refreshHeader, {csrf: response.getHeader(this.csrfHeader)});
				}

			} catch {}
		};

		req
			.then(update)
			.catch(() => {
				// Do nothing. Logging must be already handled in a request factory.
			});

		return req.catch(async (err) => {
			const
				response = Object.get<Response>(err, 'details.response');

			if (response) {
				await update({response});

				if (response.status === 401 && canRetry && await s.isExists()) {
					const
						{auth, params} = await getSessionPromise;

					if (!await s.match(auth, params)) {
						return this.updateRequest(url, <string>event, <RequestFunctionResponse>factory, false);
					}

					await s.clear();
				}
			}

			throw err;
		});
	}
}
