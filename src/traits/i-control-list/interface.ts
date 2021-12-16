/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type iBlock from 'super/i-block/i-block';

/**
 * A handler function to invoke on the specified control' event, like `click` or `change`.
 * It can be defined as a method's path from the component that implements this trait.
 * Also, it can be provided as a simple function. The handler will take all arguments produced with a listening event.
 * Finally, you can define the handler in an object form, where you can fully control which arguments should pass to
 * the handler.
 */
export type ControlAction =
	string |
	Function |
	ControlActionObject;

/**
 * An object to specify a handler function that will be invoked on events
 */
export interface ControlActionObject {
	/**
	 * A method's path from the component that implements this trait.
	 * Also, it can be defined as a simple function.
	 */
	method: string | ControlActionMethodFn;

	/**
	 * A list of additional attributes to provide to the handler.
	 * These arguments will follow after the event's arguments.
	 */
	args?: unknown[];

	/**
	 * A function that takes a list of handler arguments and returns a new one.
	 * The function can be defined as a path to the component method or as a simple function.
	 */
	argsMap?: string | ControlActionArgsMapFn;

	/**
	 * Should or not provide as handler arguments values from the caught event
	 */
	defArgs?: boolean;
}

/**
 * Parameters to handle analytics that are tied with a control' event
 */
export interface ControlEvent {
	/**
	 * A method's path from the component that implements this trait.
	 * Also, it can be defined as a simple function.
	 */
	action?: ControlAction;

	/**
	 * Additional information
	 */
	analytics?: ControlAnalytics | ControlAnalyticsArgs;
}

/**
 * Additional information for event analytics
 * @deprecated
 * @see [[ControlAnalyticsArgs]]
 */
export interface ControlAnalytics {
	/**
	 * Event name
	 */
	event: string;

	/**
	 * Event details
	 */
	details?: Dictionary;
}

/**
 * Additional information for event analytics
 */
export type ControlAnalyticsArgs = unknown[];

/**
 * Parameter of a control component
 */
export interface Control extends ControlEvent {
	/**
	 * Text that will be inserted into the component
	 */
	text?: string;

	/**
	 * Name of the component to create
	 */
	component?: 'b-button' | 'b-file-button' | string;

	/**
	 * Additional attributes (properties, modifiers, etc.) for the created component
	 */
	attrs?: Dictionary;
}

export type ControlActionMethodFn<T extends iBlock = iBlock> =
	((this: T, ...args: unknown[]) => unknown) |
	Function;

export interface ControlActionArgsMapFn<T extends iBlock = iBlock> {
	(this: T, args: unknown[]): Nullable<unknown[]>;
}
