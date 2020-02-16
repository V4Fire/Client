/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { EventEmitter2 as EventEmitter } from 'eventemitter2';
import { ComponentElement, ComponentInterface, ComponentMeta } from 'core/component/interface';
import { VNodeData } from 'core/component/engines';

/**
 * Adds the component event API to the specified component
 * @param ctx - component context
 */
export function addEventAPI(ctx: Dictionary<any>): void {
	const
		$e = new EventEmitter({maxListeners: 1e6, newListener: false});

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

/**
 * Patches ref links for the specified component
 * @param ctx - component context
 */
export function patchRefs(ctx: ComponentInterface): void {
	const
		// @ts-ignore (access)
		{$refs, $$refs} = ctx;

	if ($refs) {
		for (let keys = Object.keys($refs), i = 0; i < keys.length; i++) {
			const
				key = keys[i],
				el = $refs[key];

			if (!el) {
				continue;
			}

			if (Object.isArray(el)) {
				const
					arr = <unknown[]>[];

				let
					needRewrite;

				for (let i = 0; i < el.length; i++) {
					const
						listEl = el[i];

					let
						component;

					if (listEl instanceof Node) {
						component = (<ComponentElement>listEl).component;
						needRewrite = Boolean(component) && component.$el === listEl;

					} else {
						const {$el} = <ComponentInterface>listEl;
						component = $el.component;
						needRewrite = listEl !== component;
					}

					arr.push(needRewrite ? component : listEl);
				}

				if (needRewrite) {
					Object.defineProperty($refs, key, {
						configurable: true,
						enumerable: true,
						writable: true,
						value: arr
					});
				}

			} else {
				let
					component,
					needRewrite = false;

				if (el instanceof Node) {
					component = (<ComponentElement>el).component;
					needRewrite = Boolean(component) && component.$el === el;

				} else {
					const {$el} = <ComponentInterface>el;
					component = $el.component;
					needRewrite = el !== component;
				}

				if (needRewrite) {
					Object.defineProperty($refs, key, {
						configurable: true,
						enumerable: true,
						writable: true,
						value: component
					});
				}
			}
		}

		if ($$refs) {
			for (let keys = Object.keys($$refs), i = 0; i < keys.length; i++) {
				const
					key = keys[i],
					watchers = $$refs[key],
					el = $refs[key];

				if (el && watchers) {
					for (let i = 0; i < watchers.length; i++) {
						watchers[i](el);
					}

					delete $$refs[key];
				}
			}
		}
	}
}

