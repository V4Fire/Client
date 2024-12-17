/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:components/directives/on-resize/README.md]]
 * @packageDocumentation
 */

import * as ResizeWatcher from 'core/dom/resize-watcher';

import { ComponentEngine } from 'core/component/engines';

import type {

	DirectiveValue,
	DirectiveParams,

	WatchHandler,
	WatchOptions

} from 'components/directives/on-resize/interface';

export * from 'components/directives/on-resize/interface';

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

	Array.toArray(value).forEach((dirOpts: Exclude<DirectiveValue, any[]>) => {
		let
			watchOpts: WatchOptions,
			handler: WatchHandler;

		if (Object.isFunction(dirOpts)) {
			handler = dirOpts;
			watchOpts = {};

		} else {
			handler = dirOpts.handler;
			watchOpts = Object.reject(dirOpts, 'handler');
		}

		ResizeWatcher.watch(el, watchOpts, handler);
	});
}

function unregisterDirectiveValue(el: Element, value: Nullable<DirectiveValue>) {
	if (value == null) {
		return;
	}

	Array.toArray(value).forEach((opts: Exclude<DirectiveValue, any[]>) => {
		ResizeWatcher.unwatch(el, Object.isFunction(opts) ? opts : opts.handler);
	});
}
