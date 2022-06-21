/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Hook } from 'core/component/interface';
import type { DecoratorFunctionalOptions } from 'core/component/decorators/interface/types';

export type DecoratorHook =
	CanArray<Hook> |
	CanArray<DecoratorHookOptions>;

export type DecoratorHookOptions = {
	[hook in Hook]?: DecoratorFunctionalOptions & {
		/**
		 * A method name or a list of names after which this handler should be invoked on a registered hook event
		 *
		 * @example
		 * ```typescript
		 * import iBlock, { component, hook } from 'super/i-block/i-block';
		 *
		 * @component()
		 * class bExample extends iBlock {
		 *   @hook('mounted')
		 *   initializeComponent() {
		 *
		 *   }
		 *
		 *   @hook({mounted: {after: 'initializeComponent'}})
		 *   addedListeners() {
		 *
		 *   }
		 *
		 *   @hook({mounted: {after: ['initializeComponent', 'addedListeners']}})
		 *   sendData() {
		 *
		 *   }
		 * }
		 * ```
		 */
		after?: CanArray<string>;
	}
};
