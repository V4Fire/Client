/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { BrowserContext, Page, Request, Route } from 'playwright';
import delay from 'delay';
import { ModuleMocker } from 'jest-mock';

import type { ResponseHandler, ResponseOptions } from 'tests/helpers/providers/interceptor/interface';

/**
 * API that provides a simple way to intercept and respond to any request.
 */
export class RequestInterceptor {
	/**
	 * The route context.
	 */
	readonly routeCtx: Page | BrowserContext;

	/**
	 * The route pattern.
	 */
	readonly routePattern: string | RegExp;

	/**
	 * The route listener.
	 */
	readonly routeListener: ResponseHandler;

	/**
	 * Экземпляр jest-mock который берет на себя логику имплементации ответов
	 */
	readonly mock: ReturnType<ModuleMocker['fn']>;

	/**
	 * Creates a new instance of RequestInterceptor.
	 *
	 * @param ctx - The page or browser context.
	 * @param pattern - The route pattern to match against requests.
	 */
	constructor(ctx: Page | BrowserContext, pattern: string | RegExp) {
		this.routeCtx = ctx;
		this.routePattern = pattern;

		this.routeListener = async (route: Route, request: Request) => {
			await this.mock(route, request);
		};

		const mocker = new ModuleMocker(globalThis);
		this.mock = mocker.fn();
	}

	/**
	 * Sets a response for one request.
	 *
	 * @example
	 * ```typescript
	 * const interceptor = new RequestInterceptor(page, /api/);
	 *
	 * interceptor
	 *   .responseOnce((r: Route) => r.fulfill({status: 200}))
	 *   .responseOnce((r: Route) => r.fulfill({status: 500}));
	 * ```
	 *
	 * @param handler - The response handler function.
	 * @param opts - The response options.
	 * @returns The current instance of RequestInterceptor.
	 */
	responseOnce(handler: ResponseHandler, opts?: ResponseOptions): this;

	/**
	 * Sets a response for one request.
	 *
	 * @example
	 * ```typescript
	 * const interceptor = new RequestInterceptor(page, /api/);
	 *
	 * interceptor
	 *   .responseOnce(200, {content: 1})
	 *   .responseOnce(500);
	 * ```
	 *
	 * @param status - The response status.
	 * @param payload - The response payload.
	 * @param opts - The response options.
	 * @returns The current instance of RequestInterceptor.
	 */
	responseOnce(status: number, payload: object | string | number, opts?: ResponseOptions): this;

	responseOnce(
		handlerOrStatus: number | ResponseHandler,
		payload?: object | string | number,
		opts?: ResponseOptions
	): this {
		let fn;

		if (Object.isFunction(handlerOrStatus)) {
			fn = handlerOrStatus;
		} else {
			const status = handlerOrStatus;
			fn = this.cookResponseFn(status, payload, opts);
		}

		this.mock.mockImplementationOnce(fn);
		return this;
	}

	/**
	 * Sets a response for every request.
	 * If there are no responses set via {@link RequestInterceptor.responseOnce}, that response will be used.
	 *
	 * @example
	 * ```typescript
	 * const interceptor = new RequestInterceptor(page, /api/);
	 * interceptor.response((r: Route) => r.fulfill({status: 200}));
	 * ```
	 *
	 * @param handler - The response handler function.
	 * @returns The current instance of RequestInterceptor.
	 */
	response(handler: ResponseHandler): this;

	/**
	 * Sets a response for every request.
	 * If there are no responses set via {@link RequestInterceptor.responseOnce}, that response will be used.
	 *
	 * @example
	 * ```typescript
	 * const interceptor = new RequestInterceptor(page, /api/);
	 * interceptor.response(200, {});
	 * ```
	 *
	 * @param status - The response status.
	 * @param payload - The response payload.
	 * @param opts - The response options.
	 * @returns The current instance of RequestInterceptor.
	 */
	response(status: number, payload: object | string | number, opts?: ResponseOptions): this;

	response(
		handlerOrStatus: number | ResponseHandler,
		payload?: object | string | number,
		opts?: ResponseOptions
	): this {
		let fn;

		if (Object.isFunction(handlerOrStatus)) {
			fn = handlerOrStatus;
		} else {
			const status = handlerOrStatus;
			fn = this.cookResponseFn(status, payload, opts);
		}

		this.mock.mockImplementation(fn);
		return this;
	}

	/**
	 * Clears the responses that were created via {@link RequestInterceptor.responseOnce} or
	 * {@link RequestInterceptor.response}.
	 *
	 * @returns The current instance of RequestInterceptor.
	 */
	clearResponseOnce(): this {
		this.mock.mockReset();
		return this;
	}

	/**
	 * Stops the request interception.
	 *
	 * @returns A promise that resolves with the current instance of RequestInterceptor.
	 */
	async stop(): Promise<this> {
		await this.routeCtx.unroute(this.routePattern, this.routeListener);
		return this;
	}

	/**
	 * Starts the request interception.
	 *
	 * @returns A promise that resolves with the current instance of RequestInterceptor.
	 */
	async start(): Promise<this> {
		await this.routeCtx.route(this.routePattern, this.routeListener);
		return this;
	}

	/**
	 * Cooks a response handler.
	 *
	 * @param status - The response status.
	 * @param payload - The response payload.
	 * @param opts - The response options.
	 * @returns The response handler function.
	 */
	protected cookResponseFn(
		status: number,
		payload?: string | object | number,
		opts?: ResponseOptions
	): ResponseHandler {
		return async (route) => {
			if (opts?.delay != null) {
				await delay(opts.delay);
			}

			return route.fulfill({
				status,
				body: JSON.stringify(payload),
				contentType: 'application/json'
			});
		};
	}
}
