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
			const
				analyticsArgs = Object.isArray(analytics) ? analytics : [analytics.event, analytics.details];

			component.analytics.sendEvent(...analyticsArgs);
		}

		if (action != null) {
			if (Object.isString(action)) {
				const
					fn = component.field.get<CanPromise<Function>>(action);

				if (fn != null) {
					if (Object.isPromise(fn)) {
						return fn.then((fn) => {
							if (!Object.isFunction(fn)) {
								throw new TypeError(`The action method "${action}" is not a function`);
							}

							return fn.call(component);
						});
					}

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
				argsMapFn = argsMap != null ? field.get<CanPromise<Function>>(argsMap) : null;
			}

			if (Object.isFunction(method)) {
				methodFn = method;

			} else if (Object.isString(method)) {
				methodFn = field.get<Function>(method);
			}

			const callMethod = (methodFn, argsMapFn) => {
				const args = argsMapFn != null ? argsMapFn.call(component, fullArgs) ?? [] : fullArgs;
				return methodFn.call(component, ...args);
			};

			if (methodFn != null) {
				if (Object.isPromise(methodFn)) {
					return methodFn.then((methodFn) => {
						if (!Object.isFunction(methodFn)) {
							throw new TypeError('The action method is not a function');
						}

						if (Object.isPromise(argsMapFn)) {
							return argsMapFn.then((argsMapFn) => callMethod(methodFn, argsMapFn));
						}

						return callMethod(methodFn, argsMapFn);
					});
				}

				if (Object.isPromise(argsMapFn)) {
					return argsMapFn.then((argsMapFn) => callMethod(methodFn, argsMapFn));
				}

				return callMethod(methodFn, argsMapFn);
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
		return Object.throw();
	}

	/**
	 * Calls an event handler for the specified control
	 * @param opts
	 */
	getControlEvent(opts: Control): string {
		return Object.throw();
	}
}
