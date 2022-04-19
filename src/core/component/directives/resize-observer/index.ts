/*!
* V4Fire Client Core
* https://github.com/V4Fire/Client
*
* Released under the MIT license
* https://github.com/V4Fire/Client/blob/master/LICENSE
*/

import { ResizeWatcher, ResizeWatcherInitOptions } from 'core/dom/resize-observer';
import { ComponentEngine, VNode } from 'core/component/engines';

import { DIRECTIVE_BIND } from 'core/component/directives/resize-observer/const';
import { normalizeOptions, setCreatedViaDirectiveFlag } from 'core/component/directives/resize-observer/helpers';

import type { DirectiveOptions, ResizeWatcherObservable } from 'core/component/directives/resize-observer/interface';

export * from 'core/dom/resize-observer';
export * from 'core/component/directives/resize-observer/const';
export * from 'core/component/directives/resize-observer/interface';

ComponentEngine.directive('resize-observer', {
	mounted(el: HTMLElement, opts: DirectiveOptions, vnode: VNode): void {
		const
			val = opts.value;

		if (val == null) {
			return;
		}

		Array.concat([], val).forEach((options) => {
			options = normalizeOptions(options, vnode.fakeContext);
			setCreatedViaDirectiveFlag(ResizeWatcher.observe(el, options));
		});
	},

	updated(el: HTMLElement, opts: DirectiveOptions, vnode: VNode): void {
		const
			oldOptions = opts.oldValue,
			newOptions = opts.value;

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

			opts = normalizeOptions(opts, vnode.fakeContext);
			setCreatedViaDirectiveFlag(ResizeWatcher.observe(el, opts));
		});
	},

	unmounted(el: HTMLElement): void {
		const
			store = ResizeWatcher.getObservableElStore(el);

		if (store == null) {
			return;
		}

		store.forEach((observable: ResizeWatcherObservable) => {
			if (observable[DIRECTIVE_BIND] === true) {
				observable.destructor();
			}
		});
	}
});

