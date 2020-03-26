/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { ComponentDriver } from 'core/component/engines';
import { DirectiveOptions } from 'core/component/directives/update-on/interface';
import engine from 'core/component/directives/update-on/engine';

export * from 'core/component/directives/update-on/interface';

/**
 * Update on firing third-party emitters events directive
 *
 * @example
 * < .&__example v-update-on = [{ &
 *  emitter: parentEvent,
 *  event: 'foo',
 *  listener: (el, v) => onSampleEvent(el, v, false)
 * }, {
 *  emitter: rootEvent,
 *  event: 'bar',
 *  listener: (el, v) => onSampleEvent(el, v, true)
 * }] .
 */
ComponentDriver.directive('update-on', {
	inserted(el: HTMLElement, {value}: DirectiveOptions): void {
		if (!Object.isArray(value) && (!value || (!value.emitter || !value.event || !value.listener))) {
			return;
		}

		if (!Object.isArray(value)) {
			value = [value];
		}

		value.forEach((v) => {
			engine.add(v, el);
		});
	},

	update(el: HTMLElement, {value, oldValue}: DirectiveOptions): void {
		if (Object.fastCompare(value, oldValue)) {
			return;
		}

		if (!Object.isArray(value)) {
			value = [value];
		}

		value.forEach((v) => {
			engine.update(v, el);
		});
	},

	unbind(el: HTMLElement): void {
		engine.remove(el);
	}
});
