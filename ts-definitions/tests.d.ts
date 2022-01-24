/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

// tslint:disable max-classes-per-file

/// <reference types="@v4fire/core" />
/// <reference path="../index.d.ts" />

declare namespace Playwright {
	type Permission = '*' |
		'geolocation' |
		'midi' |
		'midi-sysex' |
		'notifications' |
		'push' |
		'camera' |
		'microphone' |
		'background-sync' |
		'ambient-light-sensor' |
		'accelerometer' |
		'gyroscope' |
		'magnetometer' |
		'accessibility-events' |
		'clipboard-read' |
		'clipboard-write' |
		'payment-handler';

	type Permissions = Permission[];

	type Geolocation = import('playwright').Geolocation;

	interface RouteFulfillResponse {
		/**
		 * Response status code, defaults to `200`
		 */
		status?: number;

		/**
		 * Optional response headers. Header values will be converted to strings.
		 */
		headers?: Dictionary<string>;

		/**
		 * Value of `Content-Type` response header
		 */
		contentType?: string;

		/**
		 * Optional response body
		 */
		body?: string | Buffer;

		/**
		 * Optional file path to respond with. The content type will be inferred from the file extension.
		 * If the path id relative, then it is resolved relative to the current working directory.
		 */
		path?: string;
	}
}

interface IncludeReturns extends Record<string, any> {
	'tests/helpers': BrowserTests.Helpers;
	'tests/utils': Tests.TestUtils;
}

declare function include<PATH extends keyof IncludeReturns>(path: PATH, ...args: any[]): IncludeReturns[PATH];

declare namespace BrowserTests {
	interface TestParams {
		/**
		 * Browser instance
		 */
		browser: import('playwright').Browser;

		/**
		 * Browser version
		 */
		version: string;

		/**
		 * Base test URL
		 */
		testURL: string;

		/**
		 * Initial page
		 * @deprecated [better to create a new page for every spec](https://github.com/V4Fire/Client/tree/master/docs/tests#specs-isolation)
		 */
		page: import('playwright').Page;

		/**
		 * Initial context
		 * @deprecated [better to create a new context for every spec](https://github.com/V4Fire/Client/tree/master/docs/tests#specs-isolation)
		 */
		context: import('playwright').BrowserContext;

		/**
		 * Context options
		 */
		contextOpts: Dictionary;

		/**
		 * Directory with component files
		 */
		componentDir: string;

		/**
		 * Directory to store some temporary data
		 */
		tmpDir: string;
	}

	/**
	 * Helpers to write browser tests
	 */
	class Helpers {
		/** @see Utils */
		utils: Utils;

		/** @see Component */
		component: Component;

		/** @see Gestures */
		gestures: Gestures;

		/** @see BOM */
		bom: BOM;

		/** @see DOM */
		dom: DOM;

		/** @see Router */
		router: Router;

		/** @see Scroll */
		scroll: Scroll;

		/** @see Request */
		request: Request;
	}

	/**
	 * Environment setup options
	 */
	interface SetupOptions {
		/**
		 * Parameters of mocks to be set using `setEnv`
		 * @default `"['.*']"`
		 */
		mocks?: string;

		/**
		 * Set of `permissions`
		 * @default ['geolocation']
		 */
		permissions?: Playwright.Permissions;

		/**
		 * Current geolocation
		 * @default `{latitude: 59.95, longitude: 30.31667}`
		 */
		location?: Playwright.Geolocation;

		/**
		 * Delay before starting a test
		 * @default `2000`
		 */
		sleepAfter?: number;

		/**
		 * If `true` the page will reload after setting up the environment
		 * @default `true`
		 */
		reload?: boolean;

		/**
		 * If settled, the test will not start until the element is attached to the page.
		 * @default `undefined`
		 */
		waitForEl?: string;
	}

	/**
	 * `waitForIdleCallback` function options
	 */
	interface WaitForIdleOptions {
		/**
		 * Indicates the number of `requestIdleCallback` that should occur
		 * @default `1`
		 */
		waitForIdleTimes?: number;

		/**
		 * Delay before exiting the function
		 * @default `100`
		 */
		sleepAfterIdles?: number;
	}

	/**
	 * `waitForRAF` function options
	 */
	interface WaitForRAFOptions {
		/**
		 * Indicates the number of `requestAnimationFrame` that should occur
		 * @default `1`
		 */
		waitForRafTimes?: number;

		/**
		 * Delay before exiting the function
		 * @default `100`
		 */
		sleepAfterRAF?: number;
	}

	/**
	 * Provides API to set browser environment
	 */
	class Utils {

	}

	interface ScrollToBottomWhileOptions extends ScrollOptions {
		/**
		 * Timeout after which the function will complete execution
		 * @default `1000`
		 */
		timeout?: number;

		/**
		 * Number of milliseconds between attempts to scroll down the page
		 * @default `100`
		 */
		tick?: number;
	}

	/**
	 * Class provides API to work with scroll on the page
	 */
	class Scroll {



		/**
		 * @param page
		 * @param [options]
		 */
		scrollToBottom(page: Playwright.Page, options?: ScrollOptions): Promise<void>;

		/**
		 * Scrolls the page until the value returned by the function is `true`
		 * or until the time specified in` timeout` expires.
		 *
		 * @param page
		 * @param [checkFn]
		 * @param [options]
		 */
		scrollToBottomWhile(
			page: Playwright.Page,
			checkFn?: () => CanPromise<boolean>,
			options?: ScrollToBottomWhileOptions
		): Promise<void>;
	}
}

declare namespace Tests {
	interface GetCurrentTestOptions {
		/**
		 * The path to the test folder that will be resolved by using `pzlr.resolve.blockSync`
		 *
		 * @default
		 * ```typescript
		 * args['--test-entry'] || `${args['--name']}/test`
		 * ```
		 */
		testDirPath?: string;

		/**
		 * Runner path relative to `testDirPath`
		 *
		 * @default
		 * ```typescript
		 * `/runners/${dasherize(runner)}.js`
		 * ```
		 */
		runnerPath?: string;
	}

	/**
	 * Helper function to test setup
	 */
	interface TestUtils {
		/**
		 * Returns a test that matches the `runner` parameter and the `name` passed to the `CLI`
		 * @param [options]
		 */
		getCurrentTest(options?: GetCurrentTestOptions): Function;
	}
}
