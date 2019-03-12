/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { ComponentInterface, ComponentElement } from 'core/component/interface';
import { EventEmitter2 as EventEmitter } from 'eventemitter2';

/**
 * Adds an $el accessor to the specified component
 *
 * @param elId - element unique id
 * @param ctx - component context
 */
export function addElAccessor(elId: symbol, ctx: ComponentInterface): void {
	let
		staticEl;

	Object.defineProperty(ctx, '$el', {
		set(val: Element): void {
			staticEl = val;
		},

		get(): CanUndef<ComponentElement<any>> {
			if (staticEl) {
				return staticEl;
			}

			const
				el = <Element>ctx[elId];

			if (el && el.closest('html')) {
				return el;
			}

			return (ctx[elId] = document.querySelector(`.i-block-helper.${ctx.componentId}`) || undefined);
		}
	});
}

/**
 * Adds the component event API to the specified component
 * @param ctx - component context
 */
export function addEventAPI(ctx: Dictionary<any>): void {
	const
		$e = new EventEmitter({maxListeners: 1e3});

	Object.assign(ctx, {
		$emit(e: string, ...args: any[]): void {
			$e.emit(e, ...args);
		},

		$once(e: string, cb: any): void {
			$e.once(e, cb);
		},

		$on(e: CanArray<string>, cb: any): void {
			const
				events = (<string[]>[]).concat(e);

			for (let i = 0; i < events.length; i++) {
				$e.on(events[i], cb);
			}
		},

		$off(e: CanArray<string>, cb?: any): void {
			const
				events = (<string[]>[]).concat(e);

			for (let i = 0; i < events.length; i++) {
				$e.off(events[i], cb);
			}
		}
	});
}
