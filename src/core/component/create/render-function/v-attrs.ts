/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { VNodeData } from 'core/component/engines';
import { ComponentMeta } from 'core/component';

const
	directiveRgxp = /(v-(.*?))(?::(.*?))?(\..*)?$/;

/**
 * Applies dynamic attributes from v-attrs to the specified vnode
 *
 * @param vnode - vnode data object
 * @param [component] - component meta object that is tied to the vnode
 */
export default function apply(vnode: VNodeData, component?: ComponentMeta): void {
	const
		attrs = vnode.attrs = vnode.attrs || {},
		attrsSpreadObj = attrs['v-attrs'],
		slotsSpreadObj = attrs['v-slots'];

	delete attrs['v-attrs'];
	delete attrs['v-slots'];

	if (Object.isPlainObject(slotsSpreadObj)) {
		const
			slotOpts: Dictionary = vnode.scopedSlots || {};

		for (let keys = Object.keys(slotsSpreadObj), i = 0; i < keys.length; i++) {
			const
				key = keys[i];

			let nm = `@${key}`;
			nm = slotOpts[nm] ? nm : '@';

			if (slotOpts[nm]) {
				const
					fn = slotOpts[nm];

				slotOpts[key] = (obj) => {
					obj.slotContent = slotsSpreadObj[key];
					return (<Function>fn)(obj);
				};

				if (nm === '@') {
					delete slotOpts[nm];
				}
			}
		}

		delete slotOpts['@'];
	}

	if (Object.isPlainObject(attrsSpreadObj)) {
		const
			eventOpts: Dictionary = vnode.on = vnode.on || {},
			nativeEventOpts: Dictionary = vnode.nativeOn = vnode.nativeOn || {},
			directiveOpts = vnode.directives = vnode.directives || [];

		for (let keys = Object.keys(attrsSpreadObj), i = 0; i < keys.length; i++) {
			let
				key = keys[i],
				val = attrsSpreadObj[key];

			if (component) {
				const
					propKey = `${key}Prop`;

				if (!component.props[key] && component.props[propKey]) {
					key = propKey;
				}
			}

			if (key[0] === '@') {
				let
					event = key.slice(1);

				if (component) {
					const
						eventChunks = event.split('.'),
						flags = <Dictionary>{};

					for (let i = 1; i < eventChunks.length; i++) {
						flags[eventChunks[i]] = true;
					}

					event = eventChunks[0].dasherize();

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

								return (<Function>originalFn)(e);
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

			} else if (key === 'staticClass') {
				vnode.staticClass = (<string[]>[]).concat(vnode.staticClass || [], <string>val).join(' ');

			} else if (key === 'class') {
				vnode.class = (<unknown[]>[]).concat(vnode.class || [], val);

			} else if (key === 'style') {
				vnode.style = (<unknown[]>[]).concat(vnode.style || [], val);

			} else if (!attrs[key]) {
				attrs[key] = val;
			}
		}
	}
}
