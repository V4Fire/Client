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
	 * Waits for the specified function to return `Boolean(result) === true`.
	 * Similar to the `Playwright.Page.waitForFunction`, but it executes with the provided context.
	 *
	 * @param ctx – context that will be available as the first argument of the provided function
	 * @param fn
	 * @param args
	 *
	 * @example
	 * ```typescript
	 * // ctx refers to the imgNode
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
				const timeoutTimer = setTimeout(() => isTimeout = true, timeout);

				const interval = setInterval(() => {
					try {
						const fnRes = Boolean(newFn.call(ctx));

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
	 * Performs a pre-setting environment
	 *
	 * @param page
	 * @param context
	 * @param [options]
	 *
	 * @deprecated
	 */
	async setup(page: Page, context: BrowserContext, options?: SetupOptions): Promise<void> {
		options = {
			// eslint-disable-next-line quotes
			mocks: '[\'.*\']',
			permissions: ['geolocation'],
			location: {latitude: 59.95, longitude: 30.31667},
			sleepAfter: 2000,

			reload: true,

			waitForEl: undefined,

			...options
		};

		if (Object.size(options.permissions) > 0) {
			await context.grantPermissions(options.permissions!);
		}

		if (options.location) {
			await context.setGeolocation(options.location);
		}

		await page.waitForLoadState('networkidle');

		if (options.mocks != null) {
			await page.evaluate(`setEnv('mock', {patterns: ${options.mocks}});`);
		}

		await page.waitForLoadState('networkidle');

		if (options.reload) {
			await this.reloadAndWaitForIdle(page);
		}

		if (options.waitForEl != null) {
			await page.waitForSelector(options.waitForEl);
		}

		if (options.sleepAfter != null) {
			await delay(options.sleepAfter);
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
	 * Prints all of the intercepted page console invokes to a console
	 * @param page
	 */
	printPageLogs(page: Page): void {
		const logs = logsMap.get(page);

		if (logs) {
			console.log(logs.join('\n'));
			logsMap.delete(page);
		}
	}

	/**
	 * Reloads the page and waits until `requestIdleCallback`
	 *
	 * @param page
	 * @param [idleOptions]
	 *
	 * @deprecated
	 */
	async reloadAndWaitForIdle(page: Page, idleOptions?: WaitForIdleOptions): Promise<void> {
		await page.reload({waitUntil: 'networkidle'});
		await this.parent.bom.waitForIdleCallback(page, idleOptions);
	}

	/**
	 * @param ctx
	 * @param fn
	 * @param args
	 * @deprecated
	 * @see [[Utils.waitForFunction]]
	 */
	waitForFunction<ARGS extends any[] = any[]>(
		ctx: ElementHandle,
		fn: (this: any, ctx: any, ...args: ARGS) => unknown,
		...args: ARGS
	): Promise<void> {
		return Utils.waitForFunction(ctx, fn, ...args);
	}
}

