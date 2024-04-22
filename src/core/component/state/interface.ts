/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type Async from 'core/async';
import type * as net from 'core/net';

import type { Session } from 'core/session';
import type { Cookies } from 'core/cookies';

import type { Experiments } from 'core/abt';
import type { InitialRoute, AppliedRoute } from 'core/router';

import type { HydrationStore } from 'core/component';

import type ThemeManager from 'core/theme-manager';
import type PageMetaData from 'core/page-meta-data';

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
	 * An API for managing app themes from the Design System
	 */
	theme: ThemeManager;

	/**
	 * An API for working with the meta information of the current page
	 */
	pageMetaData: PageMetaData;

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

	/** {@link Async} */
	async: Async;

	/**
	 * This field is typically used in cases of SSR and hydration.
	 * {@link HydrationStore}
	 */
	hydrationStore?: HydrationStore;
}
