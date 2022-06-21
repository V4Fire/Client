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
	 * A handler (or a name of the component method) that is invoked on watcher events
	 *
	 * @example
	 * ```typescript
	 * import iBlock, { component, field, watch } from 'super/i-block/i-block';
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
	 * If false, then a handler that is invoked on the watcher event does not take any arguments from the event
	 *
	 * @default `true`
	 * @example
	 * ```typescript
	 * import iBlock, { component, field } from 'super/i-block/i-block';
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
