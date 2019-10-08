/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iBlock from 'super/i-block/i-block';

export interface ControlAnalytics {
	event: string;
	details?: Dictionary;
}

export type ControlActionMethodFn<T extends iBlock = iBlock> =
	(this: T, ...args: unknown[]) => unknown |
	Function;

export interface ControlActionArgsMapFn<T extends iBlock = iBlock> {
	(this: T, args: unknown[]): Nullable<unknown[]>;
}

export interface ControlActionObject {
	method: string | ControlActionMethodFn;
	args?: unknown[];
	argsMap?: string | ControlActionArgsMapFn;
	defArgs?: boolean;
}

export type ControlAction =
	string |
	Function |
	ControlActionObject;

export interface ControlEvent {
	action?: ControlAction;
	analytics?: ControlAnalytics;
}

export interface Control extends ControlEvent {
	text?: string;
	component?: 'b-button' | 'b-file-button' | string;
	attrs?: Dictionary;
}

export default abstract class iControlList {
	/**
	 * Calls an event handler for the specified control
	 *
	 * @param component
	 * @param [opts] - control options
	 * @param [args]
	 */
	static callControlAction<R = unknown, C extends iBlock = iBlock, CTX extends iBlock = iBlock>(
		component: CTX,
		opts: ControlEvent = {},
		...args: unknown[]
	): CanPromise<CanUndef<R>> {
		const
			{action, analytics} = opts;

		if (analytics) {
			const {event, details} = analytics;
			// @ts-ignore (access)
			component.analytics.sendEvent(event, details);
		}

		if (action) {
			if (Object.isString(action)) {
				const
					fn = component.field.get<Function>(action);

				if (fn) {
					return fn.call(component);
				}

				throw new TypeError(`Action method "${action}" is not a function`);
			}

			if (Object.isFunction(action)) {
				return action.call(component);
			}

			const fullArgs = (<unknown[]>[]).concat(
				action.defArgs ? args : [],
				action.args || []
			);

			const
				{method, argsMap} = action,
				{field} = component;

			const
				argsMapFn = Object.isFunction(argsMap) ? argsMap : argsMap && field.get<Function>(argsMap),
				methodFn = Object.isFunction(method) ? method : field.get<Function>(method);

			if (methodFn) {
				return methodFn.call(component, ...(argsMapFn ? argsMapFn.call(component, fullArgs) || [] : fullArgs));
			}

			throw new TypeError('Action method is not a function');
		}
	}

	/**
	 * Returns a type of listening event for the control
	 *
	 * @param component
	 * @param opts - control options
	 */
	static getControlEvent<T extends iBlock>(component: T, opts: Control): string {
		return opts.component === 'b-file-button' ? 'change' : 'click';
	}

	/**
	 * Calls an event handler for the specified control
	 *
	 * @param [opts]
	 * @param [args]
	 */
	abstract callControlAction<R = unknown>(opts?: ControlEvent, ...args: unknown[]): CanPromise<CanUndef<R>>;

	/**
	 * Calls an event handler for the specified control
	 * @param opts
	 */
	abstract getControlEvent(opts: ControlEvent): string;
}
