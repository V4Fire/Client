/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { ComponentInterface, WatchOptions, WatchHandlerParams } from 'core/component/interface';

export interface DecoratorFieldWatcherObject<
	CTX extends ComponentInterface = ComponentInterface,
	A = unknown,
	B = A
> extends WatchOptions {
	/**
	 * A function (or the name of a component method) that gets triggered on watcher events
	 *
	 * @example
	 * ```typescript
	 * import iBlock, { component, field, watch } from 'components/super/i-block/i-block';
	 *
	 * @component()
	 * class bExample extends iBlock {
	 *   @watch({handler: 'onIncrement'})
	 *   @field()
	 *   i: number = 0;
	 *
	 *   onIncrement(val, oldVal, info) {
	 *     console.log(val, oldVal, info);
	 *   }
	 * }
	 * ```
	 */
	handler: string | DecoratorWatchHandler<CTX, A, B>;

	/**
	 * If set to false, a handler that gets invoked due to a watcher event won't take any arguments from the event
	 *
	 * @default `true`
	 *
	 * @example
	 * ```typescript
	 * import iBlock, { component, field } from 'components/super/i-block/i-block';
	 *
	 * @component()
	 * class bExample extends iBlock {
	 *   @field({watch: {handler: 'onIncrement', provideArgs: false}})
	 *   i: number = 0;
	 *
	 *   onIncrement(val) {
	 *     console.log(val === undefined);
	 *   }
	 * }
	 * ```
	 */
	provideArgs?: boolean;

	/**
	 * A function to determine whether a watcher should be initialized or not.
	 * If the function returns false, the watcher will not be initialized.
	 * Useful for precise component optimizations.
	 *
	 * @param ctx
	 */
	shouldInit?(ctx: CTX): boolean;
}

export interface DecoratorWatchHandler<CTX extends ComponentInterface = ComponentInterface, A = unknown, B = A> {
	(ctx: CTX['unsafe'], a: A, b: B, params?: WatchHandlerParams): unknown;
	(ctx: CTX['unsafe'], ...args: A[]): unknown;
}

export type DecoratorFieldWatcher<CTX extends ComponentInterface = ComponentInterface, A = unknown, B = A> =
	string |
	DecoratorFieldWatcherObject<CTX, A, B> |
	DecoratorWatchHandler<CTX, A, B> |
	Array<string | DecoratorFieldWatcherObject<CTX, A, B> | DecoratorWatchHandler<CTX, A, B>>;
