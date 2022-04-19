/*!
* V4Fire Client Core
* https://github.com/V4Fire/Client
*
* Released under the MIT license
* https://github.com/V4Fire/Client/blob/master/LICENSE
*/

import type { ResizeWatcherInitOptions } from 'core/dom/resize-observer';
import { DIRECTIVE_BIND } from 'core/component/directives/resize-observer/const';

import type { ComponentInterface } from 'core/component/interface';
import type { ResizeWatcherObservable, ResizeWatcherObserverOptions } from 'core/component/directives/resize-observer/interface';

/**
 * Sets a flag which indicates that the specified observable was created via the directive
 * @param observable
 */
export function setCreatedViaDirectiveFlag(observable: Nullable<ResizeWatcherObservable>): void {
	if (observable == null) {
		return;
	}

	observable[DIRECTIVE_BIND] = true;
}

/**
 * Normalizes the specified directive options
 *
 * @param opts
 * @param ctx
 */
export function normalizeOptions(
	opts: ResizeWatcherInitOptions,
	ctx: CanUndef<ComponentInterface>
): ResizeWatcherObserverOptions {
	return Object.isFunction(opts) ?
		{
			callback: opts,
			ctx
		} :

		{
			...opts,
			ctx: opts.ctx ?? ctx
		};
}
