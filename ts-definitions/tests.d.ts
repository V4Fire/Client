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
	type BrowserContext = import('playwright').BrowserContext;
	type ElementHandle<T extends Node = Node> = import('playwright').ElementHandle<T>;
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
		page: Playwright.Page;

		/**
		 * Initial context
		 * @deprecated [better to create a new context for every spec](https://github.com/V4Fire/Client/tree/master/docs/tests#specs-isolation)
		 */
		context: Playwright.BrowserContext;

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
	 * Options for functions `waitForEl` like
	 */
	interface WaitForElOptions {
		/**
		 * The delay between trying to find an element on a page
		 * @default `100`
		 */
		sleep?: number;

		/**
		 * Time after which the function stops trying to find an element on a page and returns `undefined`
		 * @default `3500`
		 */
		timeout?: number;

		/**
		 * Event to wait
		 *
		 *  * `mount` – element attached to a page
		 *  * `unmount` – element detached from a page
		 *
		 * @default `mount`
		 */
		to?: 'mount' | 'unmount';
	}

	type PlaywrightElContext = Playwright.ElementHandle | Playwright.JSHandle | Playwright.Page;

	/**
	 * Provides API to set browser environment
	 */
	class Utils {
		/**
		 * Performs a pre-setting environment
		 *
		 * @param page
		 * @param context
		 * @param [options]
		 *
		 * @deprecated
		 */
		setup(page: Playwright.Page, context: Playwright.BrowserContext, options?: SetupOptions): Promise<void>;

		/**
		 * Collect all console.log calls on page
		 *
		 * @param page
     *
		 */
    collectPageLogs(page: Playwright.Page);

    /**
		 * Print all collected console.log calls on page into terminal
     *
		 */
    printPageLogs()

		/**
		 * Reloads the page and waits until `requestIdleCallback`
		 *
		 * @param page
		 * @param [idleOptions]
		 *
		 * @deprecated
		 */
		reloadAndWaitForIdle(page: Playwright.Page, idleOptions?: WaitForIdleOptions): Promise<void>;

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
		waitForFunction<ARGS extends any[] = any[]>(
			ctx: PlaywrightElContext,
			fn: (this: any, ctx: any, ...args: ARGS) => unknown,
			...args: ARGS
		): Promise<void>;
	}

	/**
	 * Class provides API to work with gestures on a page
	 */
	class Gestures {
		/**
		 * Creates a gesture instance
		 *
		 * @param page
		 * @param options
		 */
		create(page: Playwright.Page, options: TouchGesturesCreateOptions): Playwright.JSHandle;
	}

	/**
	 * Class provides API to work with components on a page
	 */
	class Component {
		/**
		 * Sets props to a component by the specified selector `requestIdleCallback`
		 *
		 * @param page
		 * @param componentSelector
		 * @param props
		 * @param [idleOptions]
		 *
		 * @deprecated
		 */
		setPropsToComponent(
			page: Playwright.Page,
			componentSelector: string,
			props: Dictionary,
			idleOptions?: WaitForIdleOptions
		): Promise<CanUndef<Playwright.JSHandle>>;

		/**
		 * Reloads the page, waits for `idleCallback`, sets the passed props to a component, waits for `idleCallback`
		 *
		 * @param page
		 * @param componentSelector
		 * @param props
		 *
		 * @deprecated
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
		 * Returns a component by id
		 *
		 * @param ctx
		 * @param selector
		 */
		getComponentByQuery(ctx: PlaywrightElContext, selector: string): Promise<CanUndef<Playwright.JSHandle>>;

		/**
		 * Returns a component by the specified selector
		 *
		 * @param ctx
		 * @param selector
		 */
		getComponents(ctx: PlaywrightElContext, selector: string): Promise<Playwright.JSHandle[]>;

		/**
		 * Returns the root component
		 *
		 * @param ctx
		 * @param [selector='#root-component']
		 */
		getRoot(ctx: PlaywrightElContext, selector?: string): Promise<CanUndef<Playwright.JSHandle>>;

		/**
		 * Waits until the component has the specified status and returns the component
		 *
		 * @param ctx
		 * @param selector
		 * @param status
		 */
		waitForComponentStatus(ctx: PlaywrightElContext, selector: string, status: string): CanUndef<Playwright.JSHandle>;

		/**
		 * Waits for the passed value in the passed property of a component, and returns it
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

		/**
		 * Creates a component by using `$createElement` and `vdom.render` methods
		 *
		 * @param componentCtx
		 * @param componentName
		 * @param props
		 */
		renderComponent(
			componentCtx: PlaywrightElContext,
			componentName: string,
			props?: Dictionary
		): Playwright.ElementHandle<any>;
	}

	/**
	 * Class provides API to work with `BOM` (browser object model)
	 */
	class BOM {
		/**
		 * Waits until `requestIdleCallback` (`setTimeout 50` for safari) on the page
		 *
		 * @param page
		 * @param [idleOptions]
		 */
		waitForIdleCallback(page: Playwright.Page, idleOptions?: WaitForIdleOptions): Promise<void>;

		/**
		 * Waits until `requestAnimationFrame` fires on the page
		 *
		 * @param page
		 * @param [rafOptions]
		 */
		waitForRAF(page: Playwright.Page, rafOptions?: WaitForRAFOptions): Promise<void>;
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
		 *
		 * @deprecated
		 * @see https://playwright.dev/docs/api/class-elementhandle#element-handle-wait-for-selector
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
		 * @param refName
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
		 *
		 * @deprecated
		 *
		 * @see https://playwright.dev/docs/api/class-elementhandle#element-handle-is-visible
		 * @see https://playwright.dev/docs/api/class-elementhandle#element-handle-wait-for-selector
		 */
		isVisible(selectorOrElement: PlaywrightElContext | string, ctx?: PlaywrightElContext): Promise<boolean>;

		/**
		 * Returns a generator of an element names
		 *
		 * @example
		 * ```typescript
		 * const
		 *   base = elNameGenerator('p-index'), // Function
		 *   elName = base('page'); // 'p-index__page'
		 * ```
		 */
		elNameGenerator(blockName: string): (elName: string) => string;

		/**
		 * Returns an element name
		 *
		 * @example
		 * ```typescript
		 * const
		 *   elName = elNameGenerator('p-index', 'page'); // 'p-index__page'
		 * ```
		 */
		elNameGenerator(blockName: string, elName: string): string;

		/**
		 * Returns a generator of an element class names
		 *
		 * @example
		 * ```typescript
		 * const
		 *   base = elNameSelectorGenerator('p-index'), // Function
		 *   elName = base('page'); // '.p-index__page'
		 * ```
		 */
		elNameSelectorGenerator(blockName: string): (elName: string) => string;

		/**
		 * Returns an element class name
		 *
		 * @example
		 * ```typescript
		 * const
		 *   elName = elNameGenerator('p-index', 'page'); // '.p-index__page'
		 * ```
		 */
		elNameSelectorGenerator(blockName: string, elName: string): string;

		/**
		 * Returns a generator of an element names with modifiers
		 *
		 * @example
		 * ```typescript
		 * const
		 *   base = elNameGenerator('p-index') // Function,
		 *   elName = base('page'), // 'p-index__page'
		 *   modsBase = elModNameGenerator(elName), // Function
		 *   elNameWithMods = modsBase('type', 'test'); // 'p-index__page_type_test'
		 * ```
		 */
		elModNameGenerator(fullElName: string): (modName: string, modVal: string) => string;

		/**
		 * Returns a string of an element name with modifiers
		 *
		 * @example
		 * ```typescript
		 * const
		 *   base = elNameGenerator('p-index') // Function,
		 *   elName = base('page'), // 'p-index__page'
		 *   modsBase = elModNameGenerator(elName, 'type', 'test'); // 'p-index__page_type_test'
		 * ```
		 */
		elModNameGenerator(fullElName: string, modName: string, modVal: string): string;

		/**
		 * Returns a generator of an element class names with modifiers
		 *
		 * @example
		 * ```typescript
		 * const
		 *   base = elNameGenerator('p-index') // Function,
		 *   elName = base('page'), // 'p-index__page'
		 *   modsBase = elModNameGenerator(elName), // Function
		 *   elNameWithMods = modsBase('type', 'test'); // '.p-index__page_type_test'
		 * ```
		 */
		elModSelectorGenerator(fullElName: string): (modName: string, modVal: string) => string;

		/**
		 * Returns a string of an element class name with modifiers
		 *
		 * @example
		 * ```typescript
		 * const
		 *   base = elNameGenerator('p-index') // Function,
		 *   elName = base('page'), // 'p-index__page'
		 *   modsBase = elModSelectorGenerator(elName, 'type', 'test'); // '.p-index__page_type_test'
		 * ```
		 */
		elModSelectorGenerator(fullElName: string, modName: string, modVal: string): string;
	}

	/**
	 * Class provides API to work with `b-router`.
	 */
	class Router {
		/**
		 * Calls the specified method on a router with providing of arguments
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
		 * Throws an error when elementHandle does not point to an element connected to a Document or a ShadowRoot.
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
		 * Throws an error when elementHandle does not point to an element connected to a Document or a ShadowRoot.
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
		scrollBy(page: Playwright.Page, options: ScrollToOptions): Promise<void>;

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

	class Request {
		/**
		 * Returns a promise that will be resolved after all specified URL-s are requested
		 *
		 * @param page
		 * @param urls
		 *
		 * @deprecated
		 */
		waitForRequests(page: Playwright.Page, urls: string[]): Promise<void>;

		/**
		 * Returns a promise that will be resolved after all specified URL-s are requested
		 * and completed with an request error
		 *
		 * @param page
		 * @param urls
		 *
		 * @deprecated
		 */
		waitForRequestsFail(page: Playwright.Page, urls: string[]): Promise<void>;

		/**
		 * Intercepts the specified URL and sends the specified response on it
		 *
		 * @param page
		 * @param urls
		 * @param response
		 * @param timeout
		 *
		 * @deprecated
		 */
		interceptRequest(
			page: Playwright.Page,
			urls: string[],
			response: Playwright.RouteFulfillResponse,
			timeout?: number
		): Promise<void>;

		/**
		 * Intercepts the specified URL-s and sends the specified response on each of them
		 *
		 * @param page
		 * @param urls
		 * @param response
		 * @param timeout
		 *
		 * @deprecated
		 */
		interceptRequests(
			page: Playwright.Page,
			urls: string[],
			response: Playwright.RouteFulfillResponse,
			timeout?: number
		): Promise<void>;

		/**
		 * Returns a promise that will be resolved after all specified URL-s will fire the specified request event
		 *
		 * @param page
		 * @param urls
		 * @param event
		 *
		 * @deprecated
		 */
		waitForRequestsEvents(page: Playwright.Page, urls: string[], event: string): Promise<void>;

		/**
		 * Generates a random URL
		 */
		getRandomUrl(): string;
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
