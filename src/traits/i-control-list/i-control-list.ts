/* eslint-disable @typescript-eslint/no-unused-vars-experimental */

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type iBlock from 'super/i-block/i-block';
import type { Control, ControlEvent } from 'traits/i-control-list/interface';

export * from 'traits/i-control-list/interface';

export default abstract class iControlList {
	/**
	 * Calls an event handler for the specified control
	 *
	 * @param component
	 * @param [opts] - control options
	 * @param [args]
	 */
	static callControlAction<R = unknown, CTX extends iBlock = iBlock>(
		component: CTX,
		opts: ControlEvent = {},
		...args: unknown[]
	): CanPromise<CanUndef<R>> {
		const
			{action, analytics} = opts;

		if (analytics) {
			const {event, details} = analytics;
			component.analytics.sendEvent(event, details);
		}

		if (action != null) {
			if (Object.isString(action)) {
				const
					fn = component.field.get<Function>(action);

				if (fn) {
					return fn.call(component);
				}

				throw new TypeError(`The action method "${action}" is not a function`);
			}

			if (Object.isSimpleFunction(action)) {
				return action.call(component);
			}

			const
				fullArgs = Array.concat([], action.defArgs ? args : null, action.args);

			const
				{method, argsMap} = action,
				{field} = component;

			let
				argsMapFn,
				methodFn;

			if (Object.isFunction(argsMap)) {
				argsMapFn = argsMap;

			} else {
				argsMapFn = argsMap != null ? field.get<Function>(argsMap) : null;
			}

			if (Object.isFunction(method)) {
				methodFn = method;

			} else if (Object.isString(method)) {
				methodFn = field.get<Function>(method);
			}

			if (methodFn != null) {
				return methodFn.call(component, ...(argsMapFn != null ? argsMapFn.call(component, fullArgs) ?? [] : fullArgs));
			}

			throw new TypeError('The action method is not a function');
		}
	}

	/**
	 * Returns a type of the listening event for the control
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
	callControlAction<R = unknown>(opts?: ControlEvent, ...args: unknown[]): CanPromise<CanUndef<R>> {
		return <any>null;
	}

	/**
	 * Calls an event handler for the specified control
	 * @param opts
	 */
	getControlEvent(opts: Control): string {
		return <any>null;
	}
}
