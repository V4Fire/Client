/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { ComponentInterface, MethodWatcher } from 'core/component/interface';
import type { DecoratorHook } from 'core/component/decorators/interface/hook';

export interface DecoratorMethod<CTX extends ComponentInterface = ComponentInterface, A = unknown, B = A> {
	/**
	 * Watcher for changes of some properties
	 */
	watch?: DecoratorMethodWatcher<CTX, A, B>;

	/**
	 * Parameters for watcher
	 */
	watchParams?: MethodWatcher<CTX, A, B>;

	/**
	 * Hook or a list of hooks after which the method should be invoked
	 */
	hook?: DecoratorHook;
}

export type DecoratorMethodWatcher<CTX extends ComponentInterface = ComponentInterface, A = unknown, B = A> =
	string |
	MethodWatcher<CTX, A, B> |
	Array<string | MethodWatcher<CTX, A, B>>;
