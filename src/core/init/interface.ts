/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { InitialRoute } from 'core/router';
import type { CookieStore } from 'core/cookies';

import type { State } from 'core/component/state';
import type { ComponentOptions } from 'core/component/engines';

export interface AppSSR {
	content: string;
	styles: string;
}

export type App = Element | AppSSR;

export type InitAppOptions = Overwrite<State, {
	/**
	 * A store of application cookies
	 */
	cookies: CookieStore;

	/**
	 * The initial route for initializing the router.
	 * Usually, this value is used during SSR.
	 */
	route?: InitialRoute;

	/**
	 * A link to the element where the application should be mounted.
	 * This parameter is only used when initializing the application in a browser.
	 */
	targetToMount?: Nullable<HTMLElement>;

	/**
	 * An API to work with a network, such as testing of the network connection, etc.
	 */
	net?: State['net'];

	/**
	 * A function that is called before the initialization of the root component
	 * @param rootComponentParams
	 */
	setup?(rootComponentParams: ComponentOptions): void;

	/**
	 * Sets the passed flag to a ready status.
	 * When all the declared flags are ready, the application itself will be initialized.
	 *
	 * @param flag
	 */
	ready(flag: string): Promise<(
		rootComponentName: Nullable<string>,
		opts: InitAppParams
	) => Promise<App>>;
}>;

export type InitAppParams = Overwrite<InitAppOptions, {
	route: InitialRoute;
	cookies: State['cookies'];
	net: State['net'];
}>;
