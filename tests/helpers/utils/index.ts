/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import delay from 'delay';
import type { Page, BrowserContext, ElementHandle } from 'playwright';

import type { SetupOptions } from 'tests/helpers/utils/interface';
import type { WaitForIdleOptions } from 'tests/helpers/bom';

import type Helpers from 'tests/helpers';

const
	logsMap = new WeakMap<Page, string[]>();

export default class Utils {
	/**
	 * Waits for the specified function returns true (`Boolean(result) === true`).
	 * Similar to the `Playwright.Page.waitForFunction`, but it executes with the provided context.
	 *
	 * @param ctx – context that will be available as the first argument of the provided function
	 * @param fn
	 * @param args
	 *
	 * @example
	 * ```typescript
	 * // `ctx` refers to `imgNode`
	 * h.utils.waitForFunction(imgNode, (ctx, imgUrl) => ctx.src === imgUrl, imgUrl)
	 * ```
	 */
	static waitForFunction<ARGS extends any[] = any[]>(
		ctx: ElementHandle,
		fn: (this: any, ctx: any, ...args: ARGS) => unknown,
		...args: ARGS
	): Promise<void> {
		const
			strFn = fn.toString();

		return ctx.evaluate((ctx, [strFn, ...args]) => {
			const
				timeout = 4e3,
				// eslint-disable-next-line no-new-func
				newFn = Function(`return (${strFn}).apply(this, [this, ...${JSON.stringify(args)}])`);

			let
				isTimeout = false;

			return new Promise<void>((res, rej) => {
				const
					timeoutTimer = setTimeout(() => isTimeout = true, timeout);

				const interval = setInterval(() => {
					try {
						const
							fnRes = Boolean(newFn.call(ctx));

						if (fnRes) {
							clearTimeout(timeoutTimer);
							clearInterval(interval);
							res();
						}

						if (isTimeout) {
							clearInterval(interval);
							rej(`The given function\n${newFn.toString()}\nreturns a negative result`);
						}

					} catch (err) {
						clearInterval(interval);
						rej(err);
					}
				}, 15);
			});

		}, [strFn, ...args]);
	}

	/** @see [[Helpers]] */
	protected parent: typeof Helpers;

	/** @param parent */
	constructor(parent: typeof Helpers) {
		this.parent = parent;
	}

	/**
	 * Performs the pre-setting environment
	 *
	 * @deprecated
	 * @param page
	 * @param context
	 * @param [opts]
	 */
	async setup(page: Page, context: BrowserContext, opts?: SetupOptions): Promise<void> {
		opts = {
			// eslint-disable-next-line quotes
			mocks: '[\'.*\']',
			permissions: ['geolocation'],
			location: {latitude: 59.95, longitude: 30.31667},
			sleepAfter: 2000,

			reload: true,

			waitForEl: undefined,

			...opts
		};

		if (Object.size(opts.permissions) > 0) {
			await context.grantPermissions(opts.permissions!);
		}

		if (opts.location) {
			await context.setGeolocation(opts.location);
		}

		await page.waitForLoadState('networkidle');

		if (opts.mocks != null) {
			await page.evaluate(`setEnv('mock', {patterns: ${opts.mocks}});`);
		}

		await page.waitForLoadState('networkidle');

		if (opts.reload) {
			await this.reloadAndWaitForIdle(page);
		}

		if (opts.waitForEl != null) {
			await page.waitForSelector(opts.waitForEl);
		}

		if (opts.sleepAfter != null) {
			await delay(opts.sleepAfter);
		}

		await page.waitForSelector('#root-component', {timeout: (60).seconds(), state: 'attached'});
	}

	/**
	 * Intercepts and collects all invoking of `console` methods on the specified page.
	 * Mind, the intercepted callings aren't be shown a console till you invoke the `printPageLogs` method.
	 *
	 * @param page
	 */
	collectPageLogs(page: Page): void {
		const logs = logsMap.get(page);

		if (logs === undefined) {
			const logsArr = <string[]>[];
			logsMap.set(page, logsArr);

			page.on('console', (message) => {
				logsArr.push(message.text());
			});
		}
	}

	/**
	 * Prints all of intercepted page console invokes to the console
	 * @param page
	 */
	printPageLogs(page: Page): void {
		const
			logs = logsMap.get(page);

		if (logs) {
			console.log(logs.join('\n'));
			logsMap.delete(page);
		}
	}

	/**
	 * Reloads the passed page and waits until `requestIdleCallback` occurred
	 *
	 * @deprecated
	 * @param page
	 * @param [idleOpts]
	 */
	async reloadAndWaitForIdle(page: Page, idleOpts?: WaitForIdleOptions): Promise<void> {
		await page.reload({waitUntil: 'networkidle'});
		await this.parent.bom.waitForIdleCallback(page, idleOpts);
	}

	/**
	 * @deprecated
	 * @see [[Utils.waitForFunction]]
	 *
	 * @param ctx
	 * @param fn
	 * @param args
	 */
	waitForFunction<ARGS extends any[] = any[]>(
		ctx: ElementHandle,
		fn: (this: any, ctx: any, ...args: ARGS) => unknown,
		...args: ARGS
	): Promise<void> {
		return Utils.waitForFunction(ctx, fn, ...args);
	}
}

