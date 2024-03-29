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

	RequestFunctionResponse,
	Response,
	RequestPromise

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

	/**
	 * If true, then after clearing the session (in case of answer 401) will be an additional query
	 */
	readonly requestAfterClear: boolean = true;

	static override readonly middlewares: Middlewares = {
		...Provider.middlewares,

		async addSession(this: Session, {opts}: MiddlewareParams): Promise<void> {
			if (opts.api) {
				const h = await this.getAuthParams();
				Object.mixin({traits: true}, opts.headers, h);
			}
		}
	};

	override async getAuthParams(): Promise<Dictionary> {
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

	protected override updateRequest<T = unknown>(url: string, factory: RequestFunctionResponse<T>): RequestPromise<T>;
	protected override updateRequest<T = unknown>(
		url: string,
		event: string,
		factory: RequestFunctionResponse<T>
	): RequestPromise<T>;

	protected override updateRequest(
		url: string,
		event: string | RequestFunctionResponse,
		factory?: RequestFunctionResponse
	): RequestPromise {
		const
			req = super.updateRequest(url, Object.cast(event), Object.cast<RequestFunctionResponse>(factory)),
			session = s.get();

		const update = async (res) => {
			const
				info = <Response>res.response,
				refreshHeader = info.getHeader(this.authRefreshHeader);

			try {
				if (refreshHeader != null) {
					await s.set(refreshHeader, {csrf: info.getHeader(this.csrfHeader)});
				}

			} catch {}
		};

		req
			.then(update)
			.catch(stderr);

		return Provider.borrowRequestPromiseAPI(req, req.catch(async (err) => {
			const
				response = Object.get<Response>(err, 'details.response'),
				{auth, params} = await session;

			if (response) {
				const
					r = () => this.updateRequest(url, Object.cast(event), <RequestFunctionResponse>factory);

				if (response.status === 401) {
					if (!await s.match(auth, params)) {
						return r();
					}

					await s.clear();

					if (Object.isTruly(auth) && this.requestAfterClear) {
						return r();
					}
				}

				await update({response});
			}

			throw err;
		}));
	}
}
