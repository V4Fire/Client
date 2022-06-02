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
	beforeCreate(opts: DirectiveOptions): void {
		opts.value?.beforeCreate?.apply(opts.value, Object.cast(arguments));
	},

	created(el: Element, opts: DirectiveOptions): void {
		opts.value?.created?.apply(opts.value, Object.cast(arguments));
	},

	beforeMount(el: Element, opts: DirectiveOptions): void {
		opts.value?.beforeMount?.apply(opts.value, Object.cast(arguments));
	},

	mounted(el: Element, opts: DirectiveOptions): void {
		opts.value?.mounted?.apply(opts.value, Object.cast(arguments));
	},

	beforeUpdate(el: Element, opts: DirectiveOptions): void {
		opts.value?.beforeUpdate?.apply(opts.value, Object.cast(arguments));
	},

	updated(el: Element, opts: DirectiveOptions): void {
		opts.value?.updated?.apply(opts.value, Object.cast(arguments));
	},

	beforeUnmount(el: Element, opts: DirectiveOptions): void {
		opts.value?.beforeUnmount?.apply(opts.value, Object.cast(arguments));
	},

	unmounted(el: Element, opts: DirectiveOptions): void {
		opts.value?.unmounted?.apply(opts.value, Object.cast(arguments));
	}
});
