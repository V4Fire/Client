/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Experiments } from 'core/abt';
import type { CookieStore } from 'core/cookies';
import type { InitialRoute, AppliedRoute } from 'core/router';
import type { Theme } from 'components/super/i-block/i-block';

export interface State {
	/**
	 * True, if the current user session is authorized
	 */
	isAuth?: boolean;

	/**
	 * True, if the application is connected to the Internet
	 */
	isOnline?: boolean;

	/**
	 * Date of the last Internet connection
	 */
	lastOnlineDate?: Date;

	/**
	 * The application default language
	 */
	lang?: Language;

	/**
	 * A list of registered AB experiments
	 */
	experiments?: Experiments;

	/**
	 * Initial value for the active route.
	 * This field is typically used in cases of SSR and hydration.
	 */
	route?: InitialRoute | AppliedRoute;

	/**
	 * A store of application cookies
	 */
	cookies?: CookieStore;

	/**
	 * A shim for the `window.document` API
	 */
	document?: Document;

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

	/**
	 * Actual app's color theme
	 */
	colorTheme: Theme;
}

export interface GlobalEnvironment extends Dictionary {}
