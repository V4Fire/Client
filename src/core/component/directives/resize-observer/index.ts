/*!
* V4Fire Client Core
* https://github.com/V4Fire/Client
*
* Released under the MIT license
* https://github.com/V4Fire/Client/blob/master/LICENSE
*/

import { ResizeWatcher, ResizeWatcherInitOptions } from 'core/dom/resize-observer';

import iBlock from 'super/i-block/i-block';

import { ComponentDriver, VNode } from 'core/component/engines';
import { DirectiveOptions, ResizeWatcherObservable, ResizeWatcherObserverOptions } from 'core/component/directives/resize-observer/interface';
import { DIRECTIVE_BIND } from 'core/component/directives/resize-observer/const';

export * from 'core/component/directives/resize-observer/interface';
export * from 'core/component/directives/resize-observer/const';
export * from 'core/dom/resize-observer';

ComponentDriver.directive('resize-observer', {
	// @ts-expect-error (wrong type)
	inserted(el: HTMLElement, opts: DirectiveOptions, vNode: VNode & {context?: iBlock}): void {
		const
			val = opts.value;

		if (val == null) {
			return;
		}

		Array.concat([], val).forEach((options) => {
			options = normalizeOptions(options, vNode.context);
			setCreatedViaDirectiveFlag(ResizeWatcher.observe(el, options));
		});
	},

	// @ts-expect-error (wrong type)
	update(el: HTMLElement, opts: DirectiveOptions, vNode: VNode & {context?: iBlock}): void {
		const
			oldOptions = opts.oldValue,
			newOptions = opts.value;

		if (Object.fastCompare(oldOptions, newOptions)) {
			return;
		}

		if (Array.isArray(oldOptions)) {
			oldOptions.forEach((options) => {
				ResizeWatcher.unobserve(el, options);
			});
		}

		Array.concat([], newOptions).forEach((options: CanUndef<ResizeWatcherInitOptions>) => {
			if (options == null) {
				return;
			}

			options = normalizeOptions(options, vNode.context);
			setCreatedViaDirectiveFlag(ResizeWatcher.observe(el, options));
		});
	},

	unbind(el: HTMLElement): void {
		const
			store = ResizeWatcher.getObservableElStore(el);

		if (store == null) {
			return;
		}

		store.forEach((observable: ResizeWatcherObservable) => {
			if (observable[DIRECTIVE_BIND] === true) {
				observable.destructor();
			}
		});
	}
});

/**
 * Sets a flag which indicates that the specified observable was created via the directive
 * @param observable
 */
function setCreatedViaDirectiveFlag(observable: Nullable<ResizeWatcherObservable>): void {
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
function normalizeOptions(opts: ResizeWatcherInitOptions, ctx: CanUndef<iBlock>): ResizeWatcherObserverOptions {
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
