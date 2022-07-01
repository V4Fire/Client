/*!
* V4Fire Client Core
* https://github.com/V4Fire/Client
*
* Released under the MIT license
* https://github.com/V4Fire/Client/blob/master/LICENSE
*/

import { ResizeWatcher, ResizeWatcherInitOptions } from 'core/dom/resize-observer';
import { ComponentEngine } from 'core/component/engines';

import { DIRECTIVE } from 'core/component/directives/resize-observer/const';
import { normalizeOptions, setCreatedViaDirectiveFlag } from 'core/component/directives/resize-observer/helpers';

import type { DirectiveOptions } from 'core/component/directives/resize-observer/interface';

export * from 'core/component/directives/resize-observer/const';
export * from 'core/component/directives/resize-observer/helpers';
export * from 'core/component/directives/resize-observer/interface';

ComponentEngine.directive('resize-observer', {
	mounted(el: HTMLElement, {value, instance}: DirectiveOptions): void {
		if (value == null) {
			return;
		}

		Array.concat([], value).forEach((opts) => {
			opts = normalizeOptions(opts, Object.cast(instance));
			setCreatedViaDirectiveFlag(ResizeWatcher.observe(el, opts));
		});
	},

	updated(el: HTMLElement, {value, oldValue, instance}: DirectiveOptions): void {
		const
			oldOptions = oldValue,
			newOptions = value;

		if (Object.fastCompare(oldOptions, newOptions)) {
			return;
		}

		if (Array.isArray(oldOptions)) {
			(<ResizeWatcherInitOptions[]>oldOptions).forEach((opts) => {
				ResizeWatcher.unobserve(el, opts);
			});
		}

		Array.concat([], newOptions).forEach((opts) => {
			if (opts == null) {
				return;
			}

			opts = normalizeOptions(opts, Object.cast(instance));
			setCreatedViaDirectiveFlag(ResizeWatcher.observe(el, opts));
		});
	},

	unmounted(el: HTMLElement): void {
		const
			store = ResizeWatcher.getObservableElStore(el);

		if (store == null) {
			return;
		}

		store.forEach((observable) => {
			if (observable[DIRECTIVE] === true) {
				observable.destructor();
			}
		});
	}
});

