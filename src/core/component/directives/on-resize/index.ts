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

ComponentEngine.directive('on-resize', {
	mounted(el: HTMLElement, {value}: DirectiveParams): void {
		registerDirectiveValue(el, value);
	},

	updated(el: HTMLElement, {value, oldValue}: DirectiveParams): void {
		if (Object.fastCompare(value, oldValue)) {
			return;
		}

		unregisterDirectiveValue(el, oldValue);
		registerDirectiveValue(el, value);
	},

	unmounted(el: HTMLElement, {value}: DirectiveParams): void {
		unregisterDirectiveValue(el, value);
	}
});

function registerDirectiveValue(el: Element, value: CanUndef<DirectiveValue>): void {
	if (value == null) {
		return;
	}

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

		ResizeWatcher.watch(el, opts, handler);
	});
}

function unregisterDirectiveValue(el: Element, value: Nullable<DirectiveValue>) {
	if (value == null) {
		return;
	}

	Array.concat([], value).forEach((opts) => {
		ResizeWatcher.unwatch(el, Object.isFunction(opts) ? opts : opts.handler);
	});
}
