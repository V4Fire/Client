/* eslint-disable prefer-spread, prefer-rest-params */

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:core/component/directives/hook/README.md]]
 * @packageDocumentation
 */

import { ComponentEngine } from 'core/component/engines';
import type { DirectiveOptions } from 'core/component/directives/hook/interface';

export * from 'core/component/directives/hook/interface';

ComponentEngine.directive('hook', {
	created(el: Element, opts: DirectiveOptions): void {
		opts.value?.created?.apply(opts.value, arguments);
	},

	beforeMount(el: Element, opts: DirectiveOptions): void {
		opts.value?.beforeMount?.apply(opts.value, arguments);
	},

	mounted(el: Element, opts: DirectiveOptions): void {
		opts.value?.mounted?.apply(opts.value, arguments);
	},

	beforeUpdate(el: Element, opts: DirectiveOptions): void {
		opts.value?.beforeUpdate?.apply(opts.value, arguments);
	},

	updated(el: Element, opts: DirectiveOptions): void {
		opts.value?.updated?.apply(opts.value, arguments);
	},

	beforeUnmount(el: Element, opts: DirectiveOptions): void {
		opts.value?.beforeUnmount?.apply(opts.value, arguments);
	},

	unmounted(el: Element, opts: DirectiveOptions): void {
		opts.value?.unmounted?.apply(opts.value, arguments);
	}
});
