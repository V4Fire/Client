/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import delay from 'delay';
import type { BrowserContext, Page, Request, Route } from 'playwright';
import { ModuleMocker } from 'jest-mock';

type ResponseHandler = (route: Route, request: Request) => CanPromise<any>;

interface ResponseOptions {
	delay?: number;
}

/**
 * API that provides simple way to intercept and response to any request
 */
export class RequestInterceptor {
	/**
	 * Route context
	 */
	readonly routeCtx: Page | BrowserContext;

	/**
	 * Route patter
	 */
	readonly routePattern: string | RegExp;

	/**
	 * Route listener
	 */
	readonly routeListener: ResponseHandler;

	/**
	 * Default response that will be used to response every request if there is not responses in `responseQueue`
	 */
	readonly mock: ReturnType<ModuleMocker['fn']>;

	/**
	 * @param ctx
	 * @param pattern
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
	 * Sets a response for one request
	 *
	 * @example
	 * ```typescript
	 * const interceptor = new RequestInterceptor(page, /api/);
	 *
	 * interceptor
	 *   .response((r: Route) => r.fulfill({status: 200}));
	 *   .response((r: Route) => r.fulfill({status: 500}));
	 * ```
	 */
	responseOnce(handler: ResponseHandler, opts?: ResponseOptions): this;

	/**
	 * Sets a response for one request
	 *
	 * @example
	 * ```typescript
	 * const interceptor = new RequestInterceptor(page, /api/);
	 *
	 * interceptor
	 *   .responseOnce(200, {content: 1});
	 *   .responseOnce(500)
	 * ```
	 */
	responseOnce(status: number, payload: object | string | number, opts?: ResponseOptions): this;

	/**
	 * @inheritdoc
	 */
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
	 * If there is not responses settled via `responseOnce` (ie `responseQueue` is empty) that response will be used
	 *
	 * @example
	 * ```typescript
	 * const interceptor = new RequestInterceptor(page, /api/);
	 * interceptor.response((r: Route) => r.fulfill({status: 200}));
	 * ```
	 *
	 * @param handler
	 */
	response(handler: ResponseHandler): this;

	/**
	 * Sets a response for every request.
	 * If there is not responses settled via `responseOnce` (ie `responseQueue` is empty) that response will be used
	 *
	 * @example
	 * ```typescript
	 * const interceptor = new RequestInterceptor(page, /api/);
	 * interceptor.response(200, {});
	 * ```
	 *
	 * @param status
	 * @param payload
	 * @param opts
	 */
	response(status: number, payload: object | string | number, opts?: ResponseOptions): this;

	/**
	 * @inheritdoc
	 */
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
	 * Clears the responses that was created via `responseOnce`
	 */
	clearResponseQueue(): this {
		this.mock.mockReset();
		return this;
	}

	/**
	 * Stops the request interception
	 */
	async stop(): Promise<this> {
		await this.routeCtx.unroute(this.routePattern, this.routeListener);
		return this;
	}

	/**
	 * Starts the request interception
	 */
	async start(): Promise<this> {
		await this.routeCtx.route(this.routePattern, this.routeListener);
		return this;
	}

	/**
	 * Cooks a response handler
	 *
	 * @param status
	 * @param payload
	 * @param opts
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

				return route.fulfill({status, body: JSON.stringify(payload), contentType: 'application/json'});
			};
	}
}
