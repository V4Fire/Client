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

//#if runtime has dummyComponents
import('models/modules/test/test-session');
//#endif

export * from 'core/data';

/* eslint-disable @typescript-eslint/no-unused-vars, require-yield */

interface ParserToken<T = unknown> {type: string; value?: T}

interface ParserValue<T = unknown> extends ParserToken<T> {}

type ParserResult<T = unknown> = [ParserValue<T>, Iterable<string>];

type Parser<T = unknown, R = unknown> = (iterable: Iterable<string>) => Generator<ParserToken<T>, ParserResult<R>>;

interface ParserOptions<T = unknown> {
	token?: string;
	tokenValue?(unknown): T;
}

function tag<T, R>(template: Iterable<string | RegExp>, opts?: ParserOptions): Parser<T, R> {
	// ...
	return <any>null;
}

function seq<T = unknown, R = unknown>(
	...parsers: Parser[]
): Parser<T | T[], R[]>;

function seq<T = unknown, R = unknown>(
	opts: ParserOptions,
	...parsers: Parser[]
): Parser<T | T[], R[]>;

function seq(
	optsOrParser: ParserOptions | Parser,
	...parsers: Parser[]
): Parser {
	return <any>{};
}

const sign = tag([/[-+]/], {token: 'SIGN'});
const digit = tag([/\d+/], {token: 'DIGIT'});
const digits = repeat(digit, {token: 'DIGITS', tokenValue: (tokens) => tokens.reduce((r, {value}) => r + value, '')});

const expToken = {token: 'EXP', tokenValue: ([_, {value: sign}, {value: digits}]) => sign + digits};
const exp = seq(expToken, tag('e'), opt(sign), digits);

const significandToken = {token: 'SIGNIFICAND', tokenValue: (tokens) => tokens.reduce((r, {value}) => r + value, '')};
const significand = seq(significandToken, opt(sign), digits, opt(seq(tag('.'), digits)));

// Вот наш парсер
const num = seq(significand, exp);

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

		async addSession(this: Session, params: MiddlewareParams): Promise<void> {
			const
				{opts} = params;

			if (opts.api) {
				const h = await this.getAuthParams(params);
				Object.mixin({propsToCopy: 'new'}, opts.headers, h);
			}
		}
	};

	override async getAuthParams(_params: MiddlewareParams): Promise<Dictionary> {
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
				refreshHeader = info.headers.get(this.authRefreshHeader);

			try {
				if (refreshHeader != null) {
					await s.set(refreshHeader, {csrf: info.headers.get(this.csrfHeader) ?? undefined});
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
					// eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
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
