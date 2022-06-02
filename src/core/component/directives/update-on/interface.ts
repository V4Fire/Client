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

export interface DirectiveOptions extends DirectiveBinding<CanUndef<CanArray<DirectiveValue>>> {}

export interface DirectiveValue {
	/**
	 * The event emitter.
	 *
	 * It can be specified as a simple event emitter, a promise or string.
	 * In the case of a string, the string represents a name of the component property to watch.
	 *
	 * Also, the emitter can be provided as a function. In that case, it will be invoked,
	 * and the emitter is taken from the result.
	 */
	emitter: EventEmitterLike | Function | Promise<unknown> | string;

	/**
	 * A name of the event to listen
	 */
	event?: CanArray<string>;

	/**
	 * A group name to manual clearing of pending tasks via the [[Async]] module
	 */
	group?: string;

	/**
	 * If true, the listener will be removed after the first calling
	 * @default `false`
	 */
	single?: boolean;

	/**
	 * Additional options for the event emitter or watcher
	 */
	options?: Dictionary | WatchOptions;

	/**
	 * A function to handle events
	 */
	handler: Function;

	/**
	 * A function to handle errors (if the emitter is specified as a promise)
	 */
	errorHandler?: Function;
}
