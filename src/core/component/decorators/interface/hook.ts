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
		 */
		after?: CanArray<string>;
	}
};
