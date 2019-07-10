/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { EventEmitter2 as EventEmitter } from 'eventemitter2';
import { ComponentElement, ComponentInterface } from 'core/component/interface';
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
						val = el[i],
						component = (<ComponentElement>val).component;

					if (component && (<ComponentInterface>component).$el === val) {
						needRewrite = true;
						arr.push(component);

					} else {
						arr.push(val);
					}
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
				const
					component = (<ComponentElement>el).component;

				if (component && (<ComponentInterface>component).$el === el) {
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

const
	directiveRgxp = /(v-(.*?))(?::(.*?))?(\..*)?$/;

/**
 * Parses v-attrs attribute from the specified vnode data and applies it
 *
 * @param data
 * @param [isComponent]
 */
export function parseVAttrs(data: VNodeData, isComponent?: boolean): void {
	const
		attrs = data.attrs = data.attrs || {},
		attrsSpreadObj = attrs['v-attrs'];

	if (attrsSpreadObj && Object.isSimpleObject(attrsSpreadObj)) {
		const
			eventOpts = data.on = data.on || {},
			nativeEventOpts = data.nativeOn = data.nativeOn || {},
			directiveOpts = data.directives = data.directives || [];

		for (let keys = Object.keys(attrsSpreadObj), i = 0; i < keys.length; i++) {
			const
				key = keys[i];

			let
				val = attrsSpreadObj[key];

			if (key[0] === '@') {
				let
					event = key.slice(1);

				if (isComponent) {
					const
						eventChunks = event.split('.'),
						flags = <Dictionary>{};

					for (let i = 1; i < eventChunks.length; i++) {
						flags[eventChunks[i]] = true;
					}

					event = eventChunks[0];

					if (flags.native) {
						if (flags.right) {
							event = 'contextmenu';
						}

						if (flags.capture) {
							event = `!${event}`;
						}

						if (flags.once) {
							event = `~${event}`;
						}

						if (flags.passive) {
							event = `&${event}`;
						}

						if (flags.self || flags.prevent || flags.stop) {
							const
								originalFn = val;

							val = (e: Event | MouseEvent) => {
								if (flags.prevent) {
									e.preventDefault();
								}

								if (flags.self && e.target !== e.currentTarget) {
									return null;
								}

								if (flags.stop) {
									e.stopPropagation();
								}

								return originalFn(e);
							};
						}

						if (!nativeEventOpts[event]) {
							nativeEventOpts[event] = val;
						}

					} else if (!eventOpts[event]) {
						eventOpts[event] = val;
					}

				} else if (!eventOpts[event]) {
					eventOpts[event] = val;
				}

			} else if (key.slice(0, 2) === 'v-') {
				const
					[, rawName, name, arg, rawModifiers] = directiveRgxp.exec(key);

				let
					modifiers;

				if (rawModifiers) {
					modifiers = {};

					for (let o = rawModifiers.split('.'), i = 0; i < o.length; i++) {
						modifiers[o[i]] = true;
					}
				}

				const
					dir = <Dictionary>{name, rawName, value: val};

				if (arg) {
					dir.arg = arg;
				}

				if (modifiers) {
					dir.modifiers = modifiers;
				}

				directiveOpts.push(<any>dir);

			} else if (!attrs[key]) {
				attrs[key] = val;
			}
		}

		delete attrs['v-attrs'];
	}
}
