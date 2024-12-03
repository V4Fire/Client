/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Page, JSHandle, ElementHandle } from 'playwright';

import { evalFn } from 'core/prelude/test-env/components/json';

import BOM, { WaitForIdleOptions } from 'tests/helpers/bom';
import type { ExtractFromJSHandle } from 'tests/helpers/mock';

const
	logsMap = new WeakMap<Page, string[]>();

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class Utils {
	/**
	 * Waits for the specified function to return `true` (`Boolean(result) === true`).
	 * Similar to the `Playwright.Page.waitForFunction`, but it executes with the provided context.
	 *
	 * @param ctx - context that will be available as the first argument of the provided function
	 * @param fn
	 * @param args
	 *
	 * @example
	 * ```typescript
	 * // `ctx` refers to `imgNode`
	 * Utils.waitForFunction(imgNode, (ctx, imgUrl) => ctx.src === imgUrl, imgUrl)
	 * ```
	 *
	 * @deprecated https://playwright.dev/docs/api/class-page#page-wait-for-function
	 */
	static waitForFunction<ARGS extends any[] = any[], CTX extends JSHandle = JSHandle>(
		ctx: CTX,
		fn: (this: any, ctx: ExtractFromJSHandle<CTX>, ...args: ARGS) => unknown,
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

	/**
	 * Imports the specified module into page and returns `JSHandle` for this module
	 *
	 * @param page
	 * @param moduleName
	 */
	static import<T>(page: Page, moduleName: string): Promise<JSHandle<T>> {
		if (!moduleName.startsWith('./')) {
			moduleName = `./src/${moduleName}`;
		}

		if (!moduleName.endsWith('.ts')) {
			moduleName = `${moduleName}/index.ts`;
		}

		return <Promise<ElementHandle<T>>>page.evaluateHandle(
			([{moduleName}]) => globalThis.importModule(moduleName), [{moduleName}]
		);
	}

	/**
	 * Reloads the page and waits until `requestIdleCallback`
	 *
	 * @param page
	 * @param [idleOptions]
	 *
	 * @deprecated
	 */
	static async reloadAndWaitForIdle(page: Page, idleOptions?: WaitForIdleOptions): Promise<void> {
		await page.reload({waitUntil: 'networkidle'});
		await BOM.waitForIdleCallback(page, idleOptions);
	}

	/**
	 * Intercepts and collects all invoking of `console` methods on the specified page.
	 * Mind, the intercepted callings aren't be shown a console till you invoke the `printPageLogs` method.
	 *
	 * @param page
	 */
	static collectPageLogs(page: Page): void {
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
	 * Evaluates the provided function in the browser context
	 * @param func
	 */
	static evalInBrowser<T extends Function>(func: T): T {
		return evalFn(func);
	}

	/**
	 * Prints all of intercepted page console invokes to the console
	 * @param page
	 */
	static printPageLogs(page: Page): void {
		const
			logs = logsMap.get(page);

		if (logs) {
			// eslint-disable-next-line no-console
			console.log(logs.join('\n'));
			logsMap.delete(page);
		}
	}
}
