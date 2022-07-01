/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { ComponentEngine } from 'core/component/engines';

import engine from 'core/component/directives/update-on/engines';

import type { ComponentInterface } from 'core/component/interface';
import type { DirectiveOptions, DirectiveValue } from 'core/component/directives/update-on/interface';

export * from 'core/component/directives/update-on/const';
export * from 'core/component/directives/update-on/interface';

ComponentEngine.directive('update-on', {
	mounted(el: Element, {value, instance}: DirectiveOptions): void {
		add(el, value, Object.cast(instance));
	},

	updated(el: Element, {value, oldValue, instance}: DirectiveOptions): void {
		if (Object.fastCompare(value, oldValue)) {
			return;
		}

		add(el, value, Object.cast(instance));
	},

	unmounted(el: Element, {instance}: DirectiveOptions): void {
		if (instance != null) {
			engine.remove(el, instance);
		}
	}
});

function add(el: Element, value: Nullable<CanArray<DirectiveValue>>, ctx: CanUndef<ComponentInterface>): void {
	if (ctx == null) {
		return;
	}

	engine.remove(el, ctx);

	if (value == null) {
		return;
	}

	Array.concat([], value).forEach((params) => {
		engine.add(el, params, ctx);
	});
}
