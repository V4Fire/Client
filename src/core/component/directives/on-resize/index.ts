/*!
* V4Fire Client Core
* https://github.com/V4Fire/Client
*
* Released under the MIT license
* https://github.com/V4Fire/Client/blob/master/LICENSE
*/

/**
 * [[include:core/component/directives/on-resize/README.md]]
 * @packageDocumentation
 */

import * as ResizeWatcher from 'core/dom/resize-watcher';

import { ComponentEngine } from 'core/component/engines';
import type { DirectiveValue, DirectiveParams } from 'core/component/directives/on-resize/interface';

export * from 'core/component/directives/on-resize/interface';

const
	DIRECTIVE = Symbol('The indicator that a watcher was initialized via the directive');

ComponentEngine.directive('resize-observer', {
	mounted(el: HTMLElement, {value}: DirectiveParams): void {
		registerDirectiveValue(el, value);
	},

	updated(el: HTMLElement, {value, oldValue}: DirectiveParams): void {
		if (Object.fastCompare(value, oldValue)) {
			return;
		}

		Array.concat([], oldValue).forEach((opts) => {
			ResizeWatcher.unwatch(el, Object.isFunction(opts) ? opts : opts.handler);
		});

		registerDirectiveValue(el, value);
	},

	unmounted(el: HTMLElement): void {
		ResizeWatcher.registeredWatchers.get(el)?.forEach((watcher) => {
			if (watcher[DIRECTIVE] === true) {
				watcher.unwatch();
			}
		});
	}
});

function registerDirectiveValue(el: Element, value: CanUndef<DirectiveValue>): void {
	Array.concat([], value).forEach((opts) => {
		let
			handler;

		if (Object.isFunction(opts)) {
			handler = opts;
			opts = {};

		} else {
			handler = opts.handler;
			opts = Object.reject(opts, 'handler');
		}

		ResizeWatcher.watch(el, opts, handler)[DIRECTIVE] = true;
	});
}
