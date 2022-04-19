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
	 * Handler (or a name of a component method) that is invoked on watcher events
	 */
	handler: string | DecoratorWatchHandler<CTX, A, B>;

	/**
	 * If false, then a handler that is invoked on the watcher event does not take any arguments from the event
	 * @default `true`
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
