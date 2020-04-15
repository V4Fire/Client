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

const
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
			handler = (...args) => params.listener(el, ...args);

		el.setAttribute(attrs.id, elId);
		async[params.once ? 'once' : 'on'](params.emitter, params.event, handler, {label: elId});
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
