/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { TransitionOptions } from 'core/router';

import type { TransitionMethod } from 'components/base/b-router/interface';

export interface TransitionContext {
	ref: Nullable<string>;
	opts?: TransitionOptions;
	method: TransitionMethod;
}
