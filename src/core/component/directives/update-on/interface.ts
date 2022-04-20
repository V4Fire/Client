/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { EventEmitterLike } from 'core/async';
import type { DirectiveBinding } from 'core/component/engines';
import type { WatchOptions } from 'core/component/interface';

export interface DirectiveOptions extends DirectiveBinding<CanUndef<CanArray<DirectiveValue>>> {
	modifiers: Record<string, boolean>;
}

export interface DirectiveValue {
	/**
	 * The event emitter.
	 *
	 * It can be specified as a simple event emitter, a promise or string.
	 * In a string case, the string represents a name of the component property to watch.
	 *
	 * Also, the emitter can be provided as a function. In that case, it will be invoked,
	 * and the emitter is taken from the result.
	 */
	emitter: EventEmitterLike | Function | Promise<unknown> | string;

	/**
	 * Name of the event to listen
	 */
	event?: CanArray<string>;

	/**
	 * Group name of the operation
	 * (for Async)
	 */
	group?: string;

	/**
	 * If true, the listener will be removed after the first calling
	 * @default `false`
	 */
	single?: boolean;

	/**
	 * Additional options for an event emitter or watcher
	 */
	options?: Dictionary | WatchOptions;

	/**
	 * Function to handle events
	 */
	handler: Function;

	/**
	 * Function to handle error (if the emitter is specified as a promise)
	 */
	errorHandler?: Function;
}
