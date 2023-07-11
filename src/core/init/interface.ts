/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { InitialRoute } from 'core/router';
import type { GlobalEnvironment } from 'core/component/state';

export interface InitAppOptions {
	/**
	 * A link to the element where the application should be mounted.
	 * This parameter is only used when initializing the application in a browser.
	 */
	targetToMount?: Nullable<HTMLElement>;

	/**
	 * The initial route for initializing the router.
	 * Usually, this value is used during SSR.
	 */
	route?: InitialRoute;

	/**
	 * An object whose properties will extend the global object.
	 * For example, for SSR rendering, the proper functioning of APIs such as `document.cookie` or `location` is required.
	 * Using this object, polyfills for all necessary APIs can be passed through.
	 *
	 * @example
	 * ```js
	 * ({
	 *   globalEnv: {
	 *     location: {
	 *       href: 'https://foo.com'
	 *     }
	 *   }
	 * })
	 * ```
	 */
	globalEnv?: GlobalEnvironment;
}
