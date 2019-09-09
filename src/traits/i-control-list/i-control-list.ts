/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iBlock from 'super/i-block/i-block';

//#if runtime has bButton
import bButton from 'form/b-button/b-button';
//#endif

export type ControlInstance =
	bButton;

export type Style =
	string |
	Dictionary<string> |
	string[];

export interface Analytics {
	event: string;
	details?: Dictionary;
}

export interface ControlAction {
	method: string | Function;
	params?: unknown[];
	useDefParams?: boolean;
}

export interface Control {
	text?: string;
	component?: 'b-button' | 'b-file-button';
	action?: string | Function | ControlAction;
	analytics?: Analytics;
	attrs?: Dictionary;
}

export default abstract class iControlList {
	/**
	 * Calls an event handler for the specified control
	 *
	 * @param component
	 * @param [opts] - control options
	 * @param [control] - control instance
	 * @param [e] - event object
	 */
	static callControlAction<R = unknown, C extends iBlock = iBlock>(
		component: C,
		opts: Control = {},
		control?: ControlInstance,
		e?: Event
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

			const args = (<unknown[]>[]).concat(
				action.useDefParams ? [control, e] : [],
				action.params || []
			);

			const
				fn = Object.isFunction(action.method) ? action.method : component.field.get<Function>(action.method);

			if (fn) {
				return fn.call(component, ...args);
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
	 * @param [control]
	 * @param [e]
	 */
	abstract callControlAction<R = unknown>(
		opts?: Control,
		control?: ControlInstance,
		e?: Event
	): CanPromise<CanUndef<R>>;

	/**
	 * Calls an event handler for the specified control
	 * @param opts
	 */
	abstract getControlEvent(opts: Control): string;
}
