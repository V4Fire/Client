/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Async from 'core/async';

import { attrs } from 'core/component/directives/update-on/const';
import { DirectiveValue } from 'core/component/directives/update-on/interface';

export const
	async = new Async();

export default {
	/**
	 * Attaches a listener to the specified element
	 *
	 * @param params
	 * @param el
	 */
	add(params: DirectiveValue, el: HTMLElement): void {
		const
			elId = Math.random().toString().slice(2),
			label = {label: elId};

		const
			handler = (...args) => params.listener(el, ...args),
			errorHandler = (err) => params.errorListener != null ? params.errorListener(el, err) : stderr(err);

		const
			emitter = Object.isFunction(params.emitter) ? params.emitter() : params.emitter;

		el.setAttribute(attrs.id, elId);

		if (Object.isPromise(emitter)) {
			async.promise(emitter, label).then(handler, errorHandler);

		} else {
			if (params.event == null) {
				throw new Error('The event to listen is not specified');
			}

			async[params.once ? 'once' : 'on'](emitter, params.event, handler, label);
		}
	},

	/**
	 * Updates listeners from the specified element
	 *
	 * @param params
	 * @param el
	 */
	update(params: DirectiveValue, el: HTMLElement): void {
		const elId = el.getAttribute(attrs.id)!;
		async.clearAll({label: elId});
		this.add(params, el);
	},

	/**
	 * Removes listeners from the specified element
	 * @param el
	 */
	remove(el: HTMLElement): void {
		const elId = el.getAttribute(attrs.id)!;
		async.clearAll({label: elId});
	}
};
