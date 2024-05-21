/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { InitialRoute } from 'core/router';

import type { State } from 'core/component/state';
import type { ComponentOptions } from 'core/component/engines';

type OptionalState = {
	[K in keyof State]?: State[K];
};

export interface AppSSR {
	content: string;
	styles: string;
}

export type App = Element | AppSSR;

export interface InitAppOptions extends OptionalState {
	/**
	 * The unique identifier for the application process
	 */
	appProcessId?: string;

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
		opts: InitAppOptions
	) => Promise<App>>;
}
