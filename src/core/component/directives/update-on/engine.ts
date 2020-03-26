/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Async from 'core/async';
import { DirectiveValue } from 'core/component/directives/update-on/interface';

const
	DATA_ATTRS = {
		id: 'data-update-on-id',
		event: 'data-update-on-event-name'
	};

const
	async = new Async();

export default {
	/**
	 * Adds listener
	 *
	 * @param params
	 * @param el
	 */
	add(params: DirectiveValue, el: HTMLElement): void {
		const
			elId = Math.random().toString().slice(2);

		el.setAttribute(DATA_ATTRS.id, elId);
		async.on(params.emitter, params.event, (v) => params.listener(el, v), {label: elId});
	},

	/**
	 * Updates listening
	 *
	 * @param params
	 * @param el
	 */
	update(params: DirectiveValue, el: HTMLElement): void {
		const
			elId = <string>el.getAttribute(DATA_ATTRS.id);

		async.clearAll({label: elId});
		this.add(params, el);
	},

	remove(el: HTMLElement): void {
		const
			elId = <string>el.getAttribute(DATA_ATTRS.id);

		async.clearAll({label: elId});
	}
};
