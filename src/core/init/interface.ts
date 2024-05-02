/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type Async from 'core/async';

import type { InitialRoute } from 'core/router';
import type { CookieStore } from 'core/cookies';

import type { State } from 'core/component/state';
import type { ComponentOptions } from 'core/component/engines';

export interface AppSSR {
	content: string;
	state: State;
	styles: string;
	state: State;
}

export type App = Element | AppSSR;

export interface CreateAppOptions {
	/**
	 * A function that is called before the initialization of the root component
	 * @param rootComponentParams
	 */
	setup?(rootComponentParams: ComponentOptions): void;

	/**
	 * A link to the element where the application should be mounted.
	 * This parameter is only used when initializing the application in a browser.
	 */
	targetToMount?: Nullable<HTMLElement>;
}

export type InitAppOptions = CreateAppOptions & Overwrite<State, {
	/**
	 * The unique identifier for the application process
	 */
	appProcessId?: string;

	/**
	 * A store of application cookies
	 */
	cookies: CookieStore;

	/**
	 * An API for managing app themes from the Design System
	 */
	theme?: State['theme'];

	/**
	 * An API for working with the meta information of the current page
	 */
	pageMetaData?: State['pageMetaData'];

	/**
	 * A storage for hydrated data.
	 * During SSR, data is saved in this storage and then restored from it on the client.
	 */
	hydrationStore?: State['hydrationStore'];

	/**
	 * The initial route for initializing the router.
	 * Usually, this value is used during SSR.
	 */
	route?: InitialRoute;

	/**
	 * An API to work with a network, such as testing of the network connection, etc.
	 */
	net?: State['net'];

	/** {@link Async} */
	async?: State['async'];
}>;
