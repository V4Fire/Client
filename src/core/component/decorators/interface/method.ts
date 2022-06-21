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
	 * A path to a property to watch or a list of such paths.
	 * Each time at least one of the specified properties is mutated, this method will be called.
	 * In addition to specifying the watching paths, you can also set other watching parameters.
	 *
	 * The `core/watch` module is used to make objects watchable.
	 * Therefore, for more information, please refer to its documentation.
	 *
	 * @example
	 * ```typescript
	 * import iBlock, { component, field, system, watch } from 'super/i-block/i-block';
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
