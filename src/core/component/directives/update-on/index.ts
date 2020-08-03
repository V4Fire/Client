/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { ComponentDriver } from 'core/component/engines';

import engine from 'core/component/directives/update-on/engines';
import { DirectiveOptions } from 'core/component/directives/update-on/interface';

export * from 'core/component/directives/update-on/interface';

/**
 * Directive to manually update an element by using special events
 */
ComponentDriver.directive('update-on', {
	inserted(el: HTMLElement, {value}: DirectiveOptions): void {
		if (value == null) {
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
