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
import type { DirectiveParams } from 'core/component/directives/hook/interface';

export * from 'core/component/directives/hook/interface';

ComponentEngine.directive('hook', {
	beforeCreate(params: DirectiveParams): void {
		params.value?.beforeCreate?.apply(params.value, Object.cast(arguments));
	},

	created(el: Element, params: DirectiveParams): void {
		params.value?.created?.apply(params.value, Object.cast(arguments));
	},

	beforeMount(el: Element, params: DirectiveParams): void {
		params.value?.beforeMount?.apply(params.value, Object.cast(arguments));
	},

	mounted(el: Element, params: DirectiveParams): void {
		params.value?.mounted?.apply(params.value, Object.cast(arguments));
	},

	beforeUpdate(el: Element, params: DirectiveParams): void {
		params.value?.beforeUpdate?.apply(params.value, Object.cast(arguments));
	},

	updated(el: Element, params: DirectiveParams): void {
		params.value?.updated?.apply(params.value, Object.cast(arguments));
	},

	beforeUnmount(el: Element, params: DirectiveParams): void {
		params.value?.beforeUnmount?.apply(params.value, Object.cast(arguments));
	},

	unmounted(el: Element, params: DirectiveParams): void {
		params.value?.unmounted?.apply(params.value, Object.cast(arguments));
	}
});
