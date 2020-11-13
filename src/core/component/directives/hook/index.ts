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

import { ComponentDriver } from 'core/component/engines';
import { DirectiveOptions } from 'core/component/directives/hook/interface';

export * from 'core/component/directives/hook/interface';

ComponentDriver.directive('hook', {
	bind(el: Element, opts: DirectiveOptions): void {
		opts.value?.bind?.apply(opts.value, arguments);
	},

	inserted(el: Element, opts: DirectiveOptions): void {
		opts.value?.inserted?.apply(opts.value, arguments);
	},

	update(el: Element, opts: DirectiveOptions): void {
		opts.value?.update?.apply(opts.value, arguments);
	},

	componentUpdated(el: Element, opts: DirectiveOptions): void {
		opts.value?.componentUpdated?.apply(opts.value, arguments);
	},

	unbind(el: Element, opts: DirectiveOptions): void {
		opts.value?.unbind?.apply(opts.value, arguments);
	}
});
