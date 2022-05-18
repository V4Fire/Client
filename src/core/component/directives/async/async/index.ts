/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:core/component/directives/async/async/README.md]]
 * @packageDocumentation
 */

import { ComponentEngine } from 'core/component/engines';

import type { DirectiveOptions } from 'core/component/directives/async/async/interface';

export * from 'core/component/directives/async/async/interface';

ComponentEngine.directive('async', {
	created(node: Element, opts: DirectiveOptions): void {

	}
});
