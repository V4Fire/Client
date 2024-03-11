/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type * as net from 'core/net';

import type { Session } from 'core/session';
import type { Cookies } from 'core/cookies';

import type { Experiments } from 'core/abt';
import type { InitialRoute, AppliedRoute } from 'core/router';

export interface State {
	/**
	 * The unique identifier for the application process
	 */
	appProcessId: string;

	/**
	 * True, if the current user session is authorized
	 */
	isAuth?: boolean;

	/**
	 * An API for managing user session
	 */
	session: Session;

	/**
	 * An API for working with cookies
	 */
	cookies: Cookies;

	/**
	 * An API for working with the target document's URL
	 */
	location: URL;

	/**
	 * True, if the application is connected to the Internet
	 */
	isOnline?: boolean;

	/**
	 * Date of the last Internet connection
	 */
	lastOnlineDate?: Date;

	/**
	 * An API to work with a network, such as testing of the network connection, etc.
	 */
	net: typeof net;

	/**
	 * The initial value for the active route.
	 * This field is typically used in cases of SSR and hydration.
	 */
	route?: InitialRoute | AppliedRoute;

	/**
	 * The application default locale
	 */
	locale?: Language;

	/**
	 * A list of registered AB experiments
	 */
	experiments?: Experiments;
}
