/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

// tslint:disable max-classes-per-file

/// <reference types="@v4fire/core" />

declare namespace Playwright {
	type BrowserContext = import('playwright').BrowserContext;
	type ElementHandle = import('playwright').ElementHandle;
	type JSHandle = import('playwright').JSHandle;
	type Page = import('playwright').Page;

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
}

interface IncludeReturns extends Record<string, any> {
	'tests/helpers': BrowserTests.Helpers;
	'tests/utils': Tests.TestUtils;
}

declare function include<PATH extends keyof IncludeReturns>(path: PATH, ...args: any[]): IncludeReturns[PATH];

declare namespace BrowserTests {
	/**
	 * Helpers for writing browser tests
	 */
	class Helpers {
		/** @see Utils */
		utils: Utils;

		/** @see Component */
		component: Component;

		/** @see BOM */
		bom: BOM;

		/** @see DOM */
		dom: DOM;

		/** @see Router */
		router: Router;

		/** @see Scroll */
		scroll: Scroll;
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
	 * Options for functions `waitForEl` like
	 */
	interface WaitForElOptions {
		/**
		 * The delay between trying to find an element on the page
		 * @default `100`
		 */
		sleep?: number;

		/**
		 * Time after which the function stops trying to find an element on the page and returns `undefined`
		 * @default `2000`
		 */
		timeout?: number;

		/**
		 * Event to wait
		 *
		 *  * `mount` – element attached to the page
		 *  * `unmount` – element detached from the page
		 *
		 * @default `mount`
		 */
		to?: 'mount' | 'unmount';
	}

	type PlaywrightElContext = Playwright.ElementHandle | Playwright.JSHandle | Playwright.Page;

	/**
	 * Provides API for setting browser environment
	 */
	class Utils {
		/**
		 * Performs a pre-setting environment
		 *
		 * @param page
		 * @param context
		 * @param [options]
		 */
		setup(page: Playwright.Page, context: Playwright.BrowserContext, options?: SetupOptions): Promise<void>;

		/**
		 * Reloads the page and waits until `requestIdleCallback`
		 *
		 * @param page
		 * @param [idleOptions]
		 */
		reloadAndWaitForIdle(page: Playwright.Page, idleOptions?: WaitForIdleOptions): Promise<void>;
	}

	/**
	 * Class provides API to work with components on the page
	 */
	class Component {
		/**
		 * Sets props to the component and waits until `requestIdleCallback`
		 *
		 * @param page
		 * @param componentSelector
		 * @param props
		 * @param [idleOptions]
		 */
		setPropsToComponent(
			page: Playwright.Page,
			componentSelector: string,
			props: Dictionary,
			idleOptions?: WaitForIdleOptions
		): Promise<CanUndef<Playwright.JSHandle>>;

		/**
		 * Reloads the page, waits for `idleCallback`, sets the passed props to the component, waits for `idleCallback`
		 *
		 * @param page
		 * @param componentSelector
		 * @param props
		 */
		reloadAndSetProps(
			page: Playwright.Page,
			componentSelector: string,
			props: Dictionary
		): Promise<CanUndef<Playwright.JSHandle>>;

		/**
		 * Waits for the specified component to appear in the DOM and returns it
		 *
		 * @param ctx
		 * @param selector
		 * @param [options]
		 */
		waitForComponent(
			ctx: PlaywrightElContext,
			selector: string,
			options?: WaitForElOptions
		): Promise<CanUndef<Playwright.JSHandle>>;

		/**
		 * Returns the root component
		 *
		 * @param page
		 * @param id
		 */
		getComponentById(page: PlaywrightElContext, id: string): Promise<CanUndef<Playwright.JSHandle>>;

		/**
		 * Returns the component by id
		 *
		 * @param ctx
		 * @param selector
		 */
		getComponentByQuery(ctx: PlaywrightElContext, selector: string): Promise<CanUndef<Playwright.JSHandle>>;

		/**
		 * Returns the component by the specified selector
		 *
		 * @param ctx
		 * @param componentSelector
		 */
		getComponents(ctx: PlaywrightElContext, selector: string): Promise<Playwright.JSHandle[]>;

		/**
		 * Returns `root` component
		 * @param ctx
		 */
		getRoot(ctx: PlaywrightElContext): Promise<CanUndef<Playwright.JSHandle>>;

		/**
		 * Waits until the component has the specified status and returns the component
		 *
		 * @param ctx
		 * @param selector
		 * @param status
		 */
		waitForComponentStatus(ctx: PlaywrightElContext, selector: string, status: string): CanUndef<Playwright.JSHandle>;

		/**
		 * Waits for the passed value in the passed property of the component, and returns it
		 *
		 * @param ctx
		 * @param selector
		 * @param prop
		 * @param val
		 *
		 * @example
		 * ```typescript
		 * waitForComponentPropVal(page, '.b-slider', 'module.test', true)
		 * ```
		 *
		 * @returns {!Promise<?Playwright.JSHandle>}
		 */
		waitForComponentPropVal(
			ctx: PlaywrightElContext,
			selector: string,
			prop: string,
			val: unknown
		): Promise<CanUndef<Playwright.JSHandle>>;
	}

	/**
	 * Class provides API to work with `BOM`
	 */
	class BOM {
		/**
		 * Waits until `requestIdleCallback` (`setTimeout 50` for safari) on the page
		 *
		 * @param page
		 * @param [idleOptions]
		 */
		waitForIdleCallback(page: Playwright.Page, idleOptions?: WaitForIdleOptions): Promise<void>;
	}

	/**
	 * Class provides API to work with `DOM`.
	 */
	class DOM {
		/**
		 * Returns a selector for test refs
		 * @param refName
		 */
		getRefSelector(refName: string): string;

		/**
		 * Returns an element that matches the specified `refName`
		 *
		 * @param ctx
		 * @param refName
		 */
		getRef(ctx: PlaywrightElContext, refName: string): Promise<Playwright.ElementHandle>;

		/**
		 * Returns elements that match the specified `refName`
		 *
		 * @param ctx
		 * @param refName
		 */
		getRefs(ctx: PlaywrightElContext, refName: string): Promise<Playwright.ElementHandle[]>;

		/**
		 * Returns attribute value of the specified `ref`
		 *
		 * @param ctx
		 * @param refName
		 * @param attr
		 */
		getRefAttr(ctx: PlaywrightElContext, refName: string, attr: string): Promise<Nullable<string>>;

		/**
		 * Click on the element that matches the specified `refName`
		 *
		 * @param ctx
		 * @param refName
		 * @param [clickOptions]
		 *
		 * @see https://playwright.dev/#version=v1.2.0&path=docs%2Fapi.md&q=pageclickselector-options
		 */
		clickToRef(ctx: PlaywrightElContext, refName: string, clickOptions?: Dictionary): Promise<void>;

		/**
		 * Waits for the specified element to appear in the DOM and returns it
		 *
		 * @param ctx
		 * @param selector
		 * @param [options]
		 */
		waitForEl(
			ctx: PlaywrightElContext,
			selector: string,
			options?: WaitForElOptions
		): Promise<CanUndef<Playwright.ElementHandle>>;

		/**
		 * Waits for an element in the DOM that matches the specified `refName` and returns it
		 *
		 * @param ctx
		 * @param efName
		 * @param [options]
		 */
		waitForRef(
			ctx: PlaywrightElContext,
			refName: string,
			options?: Omit<WaitForElOptions, 'to'>
		): Promise<CanUndef<Playwright.ElementHandle>>;

		/**
		 * Returns `true` if the specified item is visible in the viewport
		 *
		 * @param selectorOrElement
		 * @param ctx
		 */
		isVisible(selectorOrElement: PlaywrightElContext | string, ctx?: PlaywrightElContext): Promise<boolean>;
	}

	/**
	 * Class provides API to work with `b-router`.
	 */
	class Router {
		/**
		 * Calls the specified method on the router and passes it the specified list of arguments
		 *
		 * @param page
		 * @param method
		 * @param args
		 */
		call(page: Playwright.Page, method: string, ...args: unknown[]): Promise<void>;
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
		 * This method waits for actionability checks, then tries to scroll element into view,
		 * unless it is completely visible as defined by IntersectionObserver's ratio.
		 *
		 * Throws when elementHandle does not point to an element connected to a Document or a ShadowRoot.
		 *
		 * @param ctx
		 * @param selector
		 * @param [scrollIntoViewOptions]
		 */
		scrollIntoViewIfNeeded(
			ctx: PlaywrightElContext,
			selector: string,
			scrollIntoViewOptions: Dictionary
		): Promise<void>;

		/**
		 * This method waits for actionability checks, then tries to scroll element into view,
		 * unless it is completely visible as defined by IntersectionObserver's ratio.
		 *
		 * Throws when elementHandle does not point to an element connected to a Document or a ShadowRoot.
		 *
		 * @param ctx
		 * @param refName
		 * @param [scrollIntoViewOptions]
		 */
		scrollRefIntoViewIfNeeded(
			ctx: PlaywrightElContext,
			refName: string,
			scrollIntoViewOptions: Dictionary
		): Promise<void>;

		/**
		 * @param page
		 * @param options
		 */
		scrollBy(page: Playwright.Page, options: ScrollOptions): Promise<void>;

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
		 * The path to the test folder will be resolved using `pzlr.resolve.blockSync`
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
	 * Helper function for test setup
	 */
	interface TestUtils {
		/**
		 *  Returns a test that matches the `runner` parameter and the `name` passed to the `CLI`
		 *
		 * @param [options]
		 */
		getCurrentTest(options?: GetCurrentTestOptions): Function;
	}

}
