/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from '~/core/symbol';
import Async from '~/core/async';

import { ID_ATTRIBUTE } from '~/core/component/directives/update-on/const';

import type { ComponentInterface } from '~/core/component';
import type { DirectiveValue } from '~/core/component/directives/update-on/interface';

export const
	$$ = symbolGenerator();

export default {
	/**
	 * Attaches a listener to the specified element
	 *
	 * @param el
	 * @param params
	 * @param ctx - context of the tied component
	 */
	add(el: Element, params: DirectiveValue, ctx: ComponentInterface): void {
		let
			id = Math.random().toString().slice(2);

		if (Object.isTruly(params.group)) {
			id = `${params.group}:${id}`;
		}

		const
			$a = this.getAsync(el, ctx),
			group = {group: id};

		const
			handler = (...args) => (params.listener ?? params.handler)(el, ...args),
			errorHandler = (err) => params.errorHandler != null ? params.errorHandler(el, err) : stderr(err);

		const emitter = Object.isFunction(params.emitter) ? params.emitter() : params.emitter;
		el.setAttribute(ID_ATTRIBUTE, id);

		if (Object.isPromise(emitter)) {
			$a.promise(emitter, group).then(handler, errorHandler);

		} else if (Object.isString(emitter)) {
			const
				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				unsafe = ctx.unsafe ?? ctx;

			const watcher = params.options != null ?
				unsafe.$watch(emitter, params.options, handler) :
				unsafe.$watch(emitter, handler);

			$a.worker(watcher, group);

		} else if (emitter != null) {
			if (params.event == null) {
				throw new Error('An event to listen is not specified');
			}

			$a[params.single ?? params.once ? 'once' : 'on'](emitter, params.event, handler, {
				options: params.options,
				...group
			});
		}
	},

	/**
	 * Removes listeners from the specified element
	 *
	 * @param el
	 * @param ctx - context of the tied component
	 */
	remove(el: Element, ctx: ComponentInterface | object): void {
		const
			group = el.getAttribute(ID_ATTRIBUTE);

		if (group != null) {
			this.getAsync(el, ctx).clearAll({group});
		}
	},

	/**
	 * Returns an async instance of the specified element
	 *
	 * @param el
	 * @param ctx - context of the tied component
	 */
	getAsync(el: Element, ctx: ComponentInterface | object): Async<ComponentInterface> {
		if ('$async' in ctx) {
			return ctx.unsafe.$async;
		}

		const $a = ctx[$$.async] ?? new Async(ctx);
		ctx[$$.async] = $a;

		return $a;
	}
};
