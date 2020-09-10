/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

// @ts-check

const
	delay = require('delay');

/**
 * @typedef {import('playwright').Page} Page
 * @typedef {import('playwright').BrowserContext} BrowserContext
 */

class Utils {
	/**
	 * @param {BrowserTests.Helpers} parent
	 */
	constructor(parent) {
		this.#parent = parent;
	}

	/**
	 * @see [[BrowserTests.Utils.setup]]
	 */
	async setup(page, context, options) {
		options = {
			// eslint-disable-next-line quotes
			mocks: `['.*']`,
			permissions: ['geolocation'],
			location: {latitude: 59.95, longitude: 30.31667},
			sleepAfter: 2000,

			reload: true,

			waitForEl: undefined,

			...options
		};

		if (options.permissions && options.permissions.length) {
			await context.grantPermissions(options.permissions);
		}

		if (options.location) {
			await context.setGeolocation(options.location);
		}

		await page.waitForLoadState('networkidle');

		if (options.mocks) {
			await page.evaluate(`setEnv('mock', {patterns: ${options.mocks}});`);
		}

		await page.waitForLoadState('networkidle');

		if (options.reload) {
			await this.reloadAndWaitForIdle(page);
		}

		if (options.waitForEl) {
			await this.#parent.dom.waitForEl(page, options.waitForEl);
		}

		if (options.sleepAfter) {
			await delay(options.sleepAfter);
		}

	}

	/**
	 * @see [[BrowserTests.Utils.reloadAndWaitForIdle]]
	 */
	async reloadAndWaitForIdle(page, idleOptions) {
		await page.reload({waitUntil: 'networkidle'});
		await this.#parent.bom.waitForIdleCallback(page, idleOptions);
	}

	/**
	 * @see [[BrowserTests.Utils.waitForFunction]]
	 */
	waitForFunction(ctx, fn, ...args) {
		const
			strFn = fn.toString();

		return ctx.evaluate((ctx, [strFn, ...args]) => {
			const
				timeout = 4e3,
				// eslint-disable-next-line no-new-func
				newFn = new Function(`return (${strFn}).apply(this, [this, ...${JSON.stringify(args)}])`);

			let
				isTimeout = false;

			return new Promise((res, rej) => {
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
							rej();
						}

					} catch {
						clearInterval(interval);
						rej();
					}
				}, 15);
			});

		}, [strFn, ...args]);
	}

	/**
	 * Parent class
	 * @type  {BrowserTests.Helpers}
	 */
	#parent;
}

module.exports = Utils;
