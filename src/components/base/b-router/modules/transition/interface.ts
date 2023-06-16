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
	/**
	 * The route name or URL or `null`, if the route is equal to the previous
	 */
	ref: Nullable<string>;

	/**
	 * Additional options: query, params, meta
	 */
	opts?: TransitionOptions;

	/**
	 * The transition method: push, replace, etc.
	 */
	method: TransitionMethod;
}

export type ScrollSnapshot = CanUndef<{meta: {scroll: {x:number; y:number}}}>;
