/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type iBlock from 'components/super/i-block/i-block';

export interface Control extends ControlEvent {
	/**
	 * The text to be inserted into the component
	 */
	text?: string;

	/**
	 * The name of the component to create
	 */
	component?: string;

	/**
	 * Additional attributes (properties, modifiers, etc.) for the created component
	 */
	attrs?: Dictionary;
}

export interface ControlEvent {
	/**
	 * A handler function that is called on events of the specified control, such as "click" or "change".
	 * The function can be passed explicitly, or as a path to the component property where it is located.
	 * In addition, the function can be decorated with additional parameters. To do this, you need to pass it
	 * as a special object.
	 */
	action?: ControlAction;

	/**
	 * Additional arguments for analytics
	 */
	analytics?: unknown[];
}

export type ControlAction =
	string |
	Function |
	ControlActionObject;

/**
 * An object to decorate the handler function that will be called on the events of the given control
 */
export interface ControlActionObject {
	/**
	 * A handler that is called on events of the specified control, such as "click" or "change".
	 * The function can be passed explicitly, or as a path to the component property where it is located.
	 */
	handler: string | ControlActionHandler;

	/**
	 * A list of additional arguments to provide to the handler.
	 * These arguments will follow after the event's arguments.
	 */
	args?: unknown[];

	/**
	 * A function that takes a list of handler arguments and returns a new one.
	 * The function can be passed explicitly, or as a path to the component property where it is located.
	 */
	argsMap?: string | ControlActionArgsMap;

	/**
	 * Whether to provide the values of the intercepted event as arguments to the handler
	 */
	defArgs?: boolean;
}

export type ControlActionHandler<T extends iBlock = iBlock> =
	((this: T, ...args: unknown[]) => unknown) |
	Function;

export interface ControlActionArgsMap<T extends iBlock = iBlock> {
	(this: T, args: unknown[]): Nullable<unknown[]>;
}
