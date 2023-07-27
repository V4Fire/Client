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
	 * A path specifies the property to watch, or you can provide a list of such paths.
	 * Whenever a mutation occurs in any one of the specified properties, this method will be invoked.
	 * You can also set additional parameters for watching.
	 *
	 * The `core/watch` module is used to make objects watchable.
	 * Therefore, for more information, please refer to its documentation.
	 *
	 * @example
	 * ```typescript
	 * import iBlock, { component, field, system, watch } from 'components/super/i-block/i-block';
	 *
	 * @component()
	 * class bExample extends iBlock {
	 *   @system()
	 *   i: number = 0;
	 *
	 *   @field()
	 *   opts: Dictionary = {a: {b: 1}};
	 *
	 *   @watch(['i', {path: 'opts.a.b', flush: 'sync'}])
	 *   onIncrement(val, oldVal, info) {
	 *     console.log(val, oldVal, info);
	 *   }
	 * }
	 * ```
	 */
	watch?: DecoratorMethodWatcher<CTX, A, B>;

	/**
	 * Watch parameters that are applied for all watchers.
	 *
	 * The `core/watch` module is used to make objects watchable.
	 * Therefore, for more information, please refer to its documentation.
	 */
	watchParams?: MethodWatcher<CTX, A, B>;

	/**
	 * A component lifecycle hook or a list of such hooks on which this method should be called
	 */
	hook?: DecoratorHook;
}

export type DecoratorMethodWatcher<CTX extends ComponentInterface = ComponentInterface, A = unknown, B = A> =
	string |
	MethodWatcher<CTX, A, B> |
	Array<string | MethodWatcher<CTX, A, B>>;
